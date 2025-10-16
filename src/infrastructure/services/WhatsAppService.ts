import axios from 'axios';

/**
 * WhatsApp Business API Service
 * Handles customer messaging, order notifications, and automated responses
 * Docs: https://developers.facebook.com/docs/whatsapp/business-platform
 */

export interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., +905551234567)
  type: 'text' | 'template' | 'image' | 'document';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: string;
    components: any[];
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    filename: string;
    caption?: string;
  };
}

export interface WhatsAppConversation {
  id: string;
  phoneNumber: string;
  customerName?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: 'active' | 'closed';
}

export class WhatsAppService {
  private static readonly API_URL = 'https://graph.facebook.com/v18.0';
  private static readonly PHONE_NUMBER_ID = import.meta.env
    .VITE_WHATSAPP_PHONE_NUMBER_ID;
  private static readonly ACCESS_TOKEN = import.meta.env
    .VITE_WHATSAPP_ACCESS_TOKEN;

  /**
   * Check if WhatsApp is configured
   */
  static isConfigured(): boolean {
    return !!(
      this.PHONE_NUMBER_ID &&
      this.ACCESS_TOKEN &&
      this.PHONE_NUMBER_ID !== 'your-phone-number-id' &&
      this.ACCESS_TOKEN !== 'your-access-token'
    );
  }

  /**
   * Get API client
   */
  private static getClient() {
    return axios.create({
      baseURL: this.API_URL,
      headers: {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send a text message
   */
  static async sendTextMessage(
    phoneNumber: string,
    message: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      console.log(
        'WhatsApp Mock: Sending message to',
        phoneNumber,
        ':',
        message
      );
      return `mock-message-${Date.now()}`;
    }

    try {
      const client = this.getClient();
      const response = await client.post(`/${this.PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message,
        },
      });

      return response.data.messages[0].id;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation message
   */
  static async sendOrderConfirmation(
    phoneNumber: string,
    orderDetails: {
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      deliveryDate?: string;
    }
  ): Promise<string> {
    const itemsList = orderDetails.items
      .map(
        item => `• ${item.name} x${item.quantity} - ₺${item.price.toFixed(2)}`
      )
      .join('\n');

    const message = `
🎉 *Siparişiniz Alındı!*

📦 Sipariş No: *${orderDetails.orderNumber}*

🛍️ *Ürünler:*
${itemsList}

💰 *Toplam:* ₺${orderDetails.total.toFixed(2)}

${orderDetails.deliveryDate ? `🚚 Tahmini Teslimat: ${orderDetails.deliveryDate}` : ''}

Siparişiniz en kısa sürede hazırlanıp gönderilecektir. Teşekkür ederiz! 🙏
    `.trim();

    return this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send shipping notification
   */
  static async sendShippingNotification(
    phoneNumber: string,
    trackingDetails: {
      orderNumber: string;
      trackingNumber: string;
      carrier: string;
      estimatedDelivery?: string;
    }
  ): Promise<string> {
    const message = `
📦 *Siparişiniz Kargoya Verildi!*

🔖 Sipariş No: *${trackingDetails.orderNumber}*
🚚 Kargo Takip No: *${trackingDetails.trackingNumber}*
🏢 Kargo Firması: ${trackingDetails.carrier}

${trackingDetails.estimatedDelivery ? `📅 Tahmini Teslim: ${trackingDetails.estimatedDelivery}` : ''}

Kargonuzu takip etmek için: https://kargotakip.com/${trackingDetails.trackingNumber}

İyi günler dileriz! 🌟
    `.trim();

    return this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send low stock alert to admin
   */
  static async sendLowStockAlert(
    adminPhoneNumber: string,
    products: Array<{ name: string; currentStock: number; threshold: number }>
  ): Promise<string> {
    const productsList = products
      .map(p => `⚠️ ${p.name}: ${p.currentStock} adet (Min: ${p.threshold})`)
      .join('\n');

    const message = `
🚨 *Düşük Stok Uyarısı!*

Aşağıdaki ürünlerin stoğu kritik seviyede:

${productsList}

Lütfen stok yenilemesi yapın.

_Otoniq.ai Otomasyon Sistemi_
    `.trim();

    return this.sendTextMessage(adminPhoneNumber, message);
  }

  /**
   * Send template message (for marketing campaigns)
   */
  static async sendTemplateMessage(
    phoneNumber: string,
    templateName: string,
    language: string,
    parameters: string[]
  ): Promise<string> {
    if (!this.isConfigured()) {
      console.log(
        'WhatsApp Mock: Sending template',
        templateName,
        'to',
        phoneNumber
      );
      return `mock-template-${Date.now()}`;
    }

    try {
      const client = this.getClient();
      const response = await client.post(`/${this.PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language,
          },
          components: [
            {
              type: 'body',
              parameters: parameters.map(text => ({
                type: 'text',
                text,
              })),
            },
          ],
        },
      });

      return response.data.messages[0].id;
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      throw error;
    }
  }

  /**
   * Send product image with caption
   */
  static async sendProductImage(
    phoneNumber: string,
    imageUrl: string,
    caption: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      console.log('WhatsApp Mock: Sending image to', phoneNumber);
      return `mock-image-${Date.now()}`;
    }

    try {
      const client = this.getClient();
      const response = await client.post(`/${this.PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'image',
        image: {
          link: imageUrl,
          caption,
        },
      });

      return response.data.messages[0].id;
    } catch (error) {
      console.error('Error sending WhatsApp image:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  static async markAsRead(messageId: string): Promise<void> {
    if (!this.isConfigured()) return;

    try {
      const client = this.getClient();
      await client.post(`/${this.PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  /**
   * Send interactive button message
   */
  static async sendButtonMessage(
    phoneNumber: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<string> {
    if (!this.isConfigured()) {
      console.log('WhatsApp Mock: Sending button message to', phoneNumber);
      return `mock-button-${Date.now()}`;
    }

    try {
      const client = this.getClient();
      const response = await client.post(`/${this.PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: bodyText,
          },
          action: {
            buttons: buttons.map(btn => ({
              type: 'reply',
              reply: {
                id: btn.id,
                title: btn.title,
              },
            })),
          },
        },
      });

      return response.data.messages[0].id;
    } catch (error) {
      console.error('Error sending WhatsApp button message:', error);
      throw error;
    }
  }

  /**
   * Get mock conversations for development
   */
  static getMockConversations(): WhatsAppConversation[] {
    return [
      {
        id: '1',
        phoneNumber: '+905551234567',
        customerName: 'Ahmet Yılmaz',
        lastMessage: 'Siparişim ne zaman gelecek?',
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 2,
        status: 'active',
      },
      {
        id: '2',
        phoneNumber: '+905559876543',
        customerName: 'Ayşe Demir',
        lastMessage: 'Teşekkürler, harika bir ürün!',
        lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
        unreadCount: 0,
        status: 'closed',
      },
      {
        id: '3',
        phoneNumber: '+905551112233',
        customerName: 'Mehmet Kaya',
        lastMessage: 'İade işlemi nasıl yapabilirim?',
        lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
        unreadCount: 1,
        status: 'active',
      },
    ];
  }
}
