import { Order, OrderItem } from '../../../domain/entities';
import { OrderStatus, PaymentStatus } from '../../../domain/enums/OrderStatus';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { Money } from '../../../domain/value-objects/Money';

export interface CreateOrderRequest {
  tenantId: string;
  orderNumber?: string;
  externalOrderId?: string;
  marketplaceConnectionId?: string;
  customerInfo: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    address: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
  };
  items: {
    productId: string;
    sku: string;
    title: string;
    quantity: number;
    unitPrice: number;
    currency?: string;
    variant?: {
      id: string;
      name: string;
      value: string;
    };
  }[];
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  discount?: number;
  currency?: string;
  customerNote?: string;
  internalNote?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

export class CreateOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate order number if not provided
      const orderNumber =
        request.orderNumber ||
        (await this.generateOrderNumber(request.tenantId));

      // Create order items
      const orderItems = request.items.map(
        item =>
          new OrderItem(
            crypto.randomUUID(),
            item.productId,
            item.sku,
            item.title,
            item.quantity,
            new Money(item.unitPrice, request.currency || 'TRY'),
            item.variant
          )
      );

      // Calculate totals
      const subtotal = new Money(request.subtotal, request.currency || 'TRY');
      const tax = new Money(request.tax || 0, request.currency || 'TRY');
      const shippingCost = new Money(
        request.shippingCost || 0,
        request.currency || 'TRY'
      );
      const discount = new Money(
        request.discount || 0,
        request.currency || 'TRY'
      );
      const totalAmount = subtotal
        .add(tax)
        .add(shippingCost)
        .subtract(discount);

      // Create order
      const order = new Order(
        crypto.randomUUID(),
        request.tenantId,
        orderNumber,
        request.externalOrderId,
        request.marketplaceConnectionId,
        request.customerInfo,
        orderItems,
        subtotal,
        tax,
        shippingCost,
        discount,
        totalAmount,
        request.currency || 'TRY',
        OrderStatus.PENDING,
        PaymentStatus.PENDING,
        undefined, // shippingInfo
        undefined, // odooSaleOrderId
        undefined, // odooInvoiceId
        false, // n8nWorkflowTriggered
        undefined, // n8nWorkflowStatus
        request.customerNote,
        request.internalNote
      );

      // Save order
      const savedOrder = await this.orderRepository.create(order);

      // Add status history
      await this.orderRepository.addStatusHistory({
        id: crypto.randomUUID(),
        orderId: savedOrder.id,
        tenantId: savedOrder.tenantId,
        newStatus: OrderStatus.PENDING,
        note: 'Sipariş oluşturuldu',
        changedBy: 'system',
        changedAt: new Date(),
      });

      return {
        success: true,
        order: savedOrder,
      };
    } catch (error) {
      console.error('CreateOrderUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Sipariş oluşturulurken hata oluştu',
      };
    }
  }

  private validateRequest(request: CreateOrderRequest): {
    isValid: boolean;
    error?: string;
  } {
    // Validate required fields
    if (!request.tenantId) {
      return { isValid: false, error: 'Tenant ID gerekli' };
    }

    if (!request.customerInfo?.name || !request.customerInfo?.email) {
      return { isValid: false, error: 'Müşteri bilgileri gerekli' };
    }

    if (!request.items || request.items.length === 0) {
      return { isValid: false, error: 'En az bir ürün gerekli' };
    }

    // Validate items
    for (const item of request.items) {
      if (!item.productId || !item.sku || !item.title) {
        return { isValid: false, error: 'Ürün bilgileri eksik' };
      }

      if (item.quantity <= 0) {
        return { isValid: false, error: "Ürün miktarı 0'dan büyük olmalı" };
      }

      if (item.unitPrice <= 0) {
        return { isValid: false, error: "Ürün fiyatı 0'dan büyük olmalı" };
      }
    }

    // Validate totals
    if (request.subtotal <= 0) {
      return { isValid: false, error: "Ara toplam 0'dan büyük olmalı" };
    }

    if (request.tax && request.tax < 0) {
      return { isValid: false, error: 'Vergi negatif olamaz' };
    }

    if (request.shippingCost && request.shippingCost < 0) {
      return { isValid: false, error: 'Kargo ücreti negatif olamaz' };
    }

    if (request.discount && request.discount < 0) {
      return { isValid: false, error: 'İndirim negatif olamaz' };
    }

    return { isValid: true };
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const orderNumber =
      await this.orderRepository.generateNextOrderNumber(tenantId);
    return orderNumber;
  }
}
