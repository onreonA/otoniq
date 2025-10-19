import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { Order } from '../../../domain/entities/Order';
import { OdooService } from '../../../infrastructure/services/OdooService';

export interface SyncOrderToOdooRequest {
  orderId: string;
  tenantId: string;
  odooCredentials: {
    url: string;
    database: string;
    username: string;
    password: string;
  };
  options?: {
    createCustomer?: boolean;
    createInvoice?: boolean;
    createDeliveryOrder?: boolean;
  };
}

export interface SyncOrderToOdooResponse {
  success: boolean;
  odooSaleOrderId?: string;
  odooInvoiceId?: string;
  odooDeliveryOrderId?: string;
  error?: string;
}

export class SyncOrderToOdooUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(
    request: SyncOrderToOdooRequest
  ): Promise<SyncOrderToOdooResponse> {
    const { orderId, tenantId, odooCredentials, options = {} } = request;

    try {
      // Get order from repository
      const order = await this.orderRepository.getById(orderId, tenantId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // Check if order is already synced to Odoo
      if (order.odooSaleOrderId) {
        return {
          success: false,
          error: 'Order is already synced to Odoo',
        };
      }

      // Initialize Odoo service
      const odooService = new OdooService(odooCredentials);

      // Test Odoo connection
      const connectionTest = await odooService.testConnection();
      if (!connectionTest.success) {
        return {
          success: false,
          error: `Odoo connection failed: ${connectionTest.error}`,
        };
      }

      const results: SyncOrderToOdooResponse = {
        success: true,
      };

      // 1. Create or get customer/partner
      let partnerId: number;
      if (options.createCustomer !== false) {
        partnerId = await this.createOrGetCustomer(odooService, order);
      } else {
        // Find existing customer by email
        const existingCustomer = await odooService.findPartnerByEmail(
          order.customerInfo.email
        );
        if (!existingCustomer) {
          return {
            success: false,
            error: 'Customer not found in Odoo and createCustomer is disabled',
          };
        }
        partnerId = existingCustomer.id;
      }

      // 2. Create sale order
      const saleOrderId = await this.createSaleOrder(
        odooService,
        order,
        partnerId
      );
      results.odooSaleOrderId = saleOrderId.toString();

      // 3. Create invoice if requested
      if (options.createInvoice !== false) {
        const invoiceId = await this.createInvoice(odooService, saleOrderId);
        results.odooInvoiceId = invoiceId.toString();
      }

      // 4. Create delivery order if requested
      if (options.createDeliveryOrder !== false) {
        const deliveryOrderId = await this.createDeliveryOrder(
          odooService,
          saleOrderId
        );
        results.odooDeliveryOrderId = deliveryOrderId.toString();
      }

      // Update order with Odoo IDs
      await this.orderRepository.update(orderId, {
        odooSaleOrderId: results.odooSaleOrderId,
        odooInvoiceId: results.odooInvoiceId,
      });

      return results;
    } catch (error) {
      const errorMessage = `Failed to sync order to Odoo: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      console.error('Odoo sync error:', error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Create or get customer/partner in Odoo
   */
  private async createOrGetCustomer(
    odooService: OdooService,
    order: Order
  ): Promise<number> {
    // Check if customer already exists
    const existingCustomer = await odooService.findPartnerByEmail(
      order.customerInfo.email
    );

    if (existingCustomer) {
      return existingCustomer.id;
    }

    // Create new customer
    const customerData = {
      name: order.customerInfo.name,
      email: order.customerInfo.email,
      phone: order.customerInfo.phone,
      street: order.customerInfo.address.street,
      city: order.customerInfo.address.city,
      state: order.customerInfo.address.state,
      zip: order.customerInfo.address.postalCode,
      country_id: await this.getCountryId(
        odooService,
        order.customerInfo.address.country
      ),
      is_company: false,
      customer_rank: 1,
    };

    return await odooService.createPartner(customerData);
  }

  /**
   * Create sale order in Odoo
   */
  private async createSaleOrder(
    odooService: OdooService,
    order: Order,
    partnerId: number
  ): Promise<number> {
    // Map order items to Odoo sale order lines
    const orderLines = await Promise.all(
      order.items.map(async item => ({
        product_id: await this.getOrCreateProduct(odooService, item),
        product_uom_qty: item.quantity,
        price_unit: item.unitPrice.getAmount(),
        name: item.title,
      }))
    );

    const saleOrderData = {
      partner_id: partnerId,
      date_order: order.orderDate.toISOString().split('T')[0],
      order_line: orderLines,
      amount_untaxed: order.subtotal.getAmount(),
      amount_tax: order.tax.getAmount(),
      amount_total: order.totalAmount.getAmount(),
      currency_id: await this.getCurrencyId(odooService, order.currency),
      client_order_ref: order.orderNumber,
      origin: `Marketplace: ${order.externalOrderId || 'Manual'}`,
      state: 'draft',
    };

    return await odooService.createSaleOrder(saleOrderData);
  }

  /**
   * Create invoice in Odoo
   */
  private async createInvoice(
    odooService: OdooService,
    saleOrderId: number
  ): Promise<number> {
    // Create invoice from sale order
    const invoiceData = {
      move_type: 'out_invoice',
      partner_id: await this.getSaleOrderPartnerId(odooService, saleOrderId),
      invoice_origin: saleOrderId.toString(),
      invoice_line_ids: await this.getSaleOrderLines(odooService, saleOrderId),
    };

    return await odooService.createInvoice(invoiceData);
  }

  /**
   * Create delivery order in Odoo
   */
  private async createDeliveryOrder(
    odooService: OdooService,
    saleOrderId: number
  ): Promise<number> {
    // Create stock picking from sale order
    const pickingData = {
      partner_id: await this.getSaleOrderPartnerId(odooService, saleOrderId),
      origin: saleOrderId.toString(),
      picking_type_id: await this.getOutgoingPickingTypeId(odooService),
      location_id: await this.getStockLocationId(odooService),
      location_dest_id: await this.getCustomerLocationId(odooService),
    };

    return await odooService.createStockPicking(pickingData);
  }

  /**
   * Get or create product in Odoo
   */
  private async getOrCreateProduct(
    odooService: OdooService,
    item: any
  ): Promise<number> {
    // Try to find existing product by SKU
    const existingProduct = await odooService.findProductBySku(item.sku);
    if (existingProduct) {
      return existingProduct.id;
    }

    // Create new product
    const productData = {
      name: item.title,
      default_code: item.sku,
      list_price: item.unitPrice.getAmount(),
      type: 'product',
      sale_ok: true,
      purchase_ok: true,
      categ_id: await this.getDefaultProductCategoryId(odooService),
    };

    return await odooService.createProduct(productData);
  }

  /**
   * Helper methods for Odoo data
   */
  private async getCountryId(
    odooService: OdooService,
    countryName: string
  ): Promise<number> {
    // Map country name to Odoo country ID
    const countryMap: Record<string, number> = {
      Turkey: 1, // Turkey
      TR: 1,
      Türkiye: 1,
    };

    return countryMap[countryName] || 1; // Default to Turkey
  }

  private async getCurrencyId(
    odooService: OdooService,
    currencyCode: string
  ): Promise<number> {
    // Map currency code to Odoo currency ID
    const currencyMap: Record<string, number> = {
      TRY: 1, // Turkish Lira
      USD: 2, // US Dollar
      EUR: 3, // Euro
    };

    return currencyMap[currencyCode] || 1; // Default to TRY
  }

  private async getSaleOrderPartnerId(
    odooService: OdooService,
    saleOrderId: number
  ): Promise<number> {
    const saleOrder = await odooService.getSaleOrder(saleOrderId);
    return saleOrder.partner_id[0];
  }

  private async getSaleOrderLines(
    odooService: OdooService,
    saleOrderId: number
  ): Promise<any[]> {
    const saleOrder = await odooService.getSaleOrder(saleOrderId);
    return saleOrder.order_line.map((line: any) => ({
      product_id: line.product_id[0],
      quantity: line.product_uom_qty,
      price_unit: line.price_unit,
      name: line.name,
    }));
  }

  private async getOutgoingPickingTypeId(
    odooService: OdooService
  ): Promise<number> {
    // Get default outgoing picking type
    return await odooService.getOutgoingPickingTypeId();
  }

  private async getStockLocationId(odooService: OdooService): Promise<number> {
    // Get stock location
    return await odooService.getStockLocationId();
  }

  private async getCustomerLocationId(
    odooService: OdooService
  ): Promise<number> {
    // Get customer location
    return await odooService.getCustomerLocationId();
  }

  private async getDefaultProductCategoryId(
    odooService: OdooService
  ): Promise<number> {
    // Get default product category
    return await odooService.getDefaultProductCategoryId();
  }
}
