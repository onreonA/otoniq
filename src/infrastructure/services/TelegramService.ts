import axios from 'axios';

/**
 * Telegram Bot Service
 * Automated notifications, commands, and customer support via Telegram
 * Docs: https://core.telegram.org/bots/api
 */

export interface TelegramMessage {
  chatId: string | number;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
  replyMarkup?: {
    inlineKeyboard?: Array<
      Array<{ text: string; callbackData?: string; url?: string }>
    >;
    keyboard?: Array<Array<{ text: string }>>;
    removeKeyboard?: boolean;
  };
}

export interface TelegramUpdate {
  updateId: number;
  message?: {
    messageId: number;
    from: {
      id: number;
      firstName: string;
      lastName?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
  callbackQuery?: {
    id: string;
    from: {
      id: number;
      firstName: string;
    };
    data: string;
  };
}

export class TelegramService {
  private static readonly BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  private static readonly API_URL = `https://api.telegram.org/bot${this.BOT_TOKEN}`;

  /**
   * Check if Telegram is configured
   */
  static isConfigured(): boolean {
    return !!(this.BOT_TOKEN && this.BOT_TOKEN !== 'your-telegram-bot-token');
  }

  /**
   * Send text message
   */
  static async sendMessage(
    chatId: string | number,
    text: string,
    options?: {
      parseMode?: 'Markdown' | 'HTML';
      disableWebPagePreview?: boolean;
      replyMarkup?: any;
    }
  ): Promise<number> {
    if (!this.isConfigured()) {
      console.log('Telegram Mock: Sending message to', chatId, ':', text);
      return Date.now();
    }

    try {
      const response = await axios.post(`${this.API_URL}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode,
        disable_web_page_preview: options?.disableWebPagePreview,
        reply_markup: options?.replyMarkup,
      });

      return response.data.result.message_id;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      throw error;
    }
  }

  /**
   * Send order notification
   */
  static async sendOrderNotification(
    chatId: string | number,
    orderDetails: {
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      customerName: string;
    }
  ): Promise<number> {
    const itemsList = orderDetails.items
      .map(
        item => `  • ${item.name} x${item.quantity} - ₺${item.price.toFixed(2)}`
      )
      .join('\n');

    const message = `
🎉 *Yeni Sipariş Alındı!*

👤 Müşteri: ${orderDetails.customerName}
📦 Sipariş No: \`${orderDetails.orderNumber}\`

🛍️ *Ürünler:*
${itemsList}

💰 *Toplam:* ₺${orderDetails.total.toFixed(2)}

_${new Date().toLocaleString('tr-TR')}_
    `.trim();

    return this.sendMessage(chatId, message, { parseMode: 'Markdown' });
  }

  /**
   * Send daily sales report
   */
  static async sendDailySalesReport(
    chatId: string | number,
    reportData: {
      date: string;
      totalOrders: number;
      totalRevenue: number;
      topProducts: Array<{ name: string; sales: number }>;
      avgOrderValue: number;
    }
  ): Promise<number> {
    const topProducts = reportData.topProducts
      .slice(0, 5)
      .map((p, i) => `  ${i + 1}. ${p.name} (${p.sales} adet)`)
      .join('\n');

    const message = `
📊 *Günlük Satış Raporu*
📅 ${reportData.date}

📈 *Özet:*
  • Sipariş Sayısı: ${reportData.totalOrders}
  • Toplam Gelir: ₺${reportData.totalRevenue.toFixed(2)}
  • Ortalama Sepet: ₺${reportData.avgOrderValue.toFixed(2)}

🏆 *En Çok Satan Ürünler:*
${topProducts}

_Otoniq.ai Otomasyon Sistemi_
    `.trim();

    return this.sendMessage(chatId, message, { parseMode: 'Markdown' });
  }

  /**
   * Send low stock alert
   */
  static async sendLowStockAlert(
    chatId: string | number,
    products: Array<{ name: string; currentStock: number; threshold: number }>
  ): Promise<number> {
    const productsList = products
      .map(p => `  ⚠️ ${p.name}: ${p.currentStock} adet (Min: ${p.threshold})`)
      .join('\n');

    const message = `
🚨 *Düşük Stok Uyarısı!*

Aşağıdaki ürünlerin stoğu kritik seviyede:

${productsList}

Lütfen en kısa sürede stok yenilemesi yapın.

_Otoniq.ai Otomasyon Sistemi_
    `.trim();

    return this.sendMessage(chatId, message, { parseMode: 'Markdown' });
  }

  /**
   * Send message with inline keyboard
   */
  static async sendInlineKeyboard(
    chatId: string | number,
    text: string,
    buttons: Array<Array<{ text: string; callbackData?: string; url?: string }>>
  ): Promise<number> {
    const inlineKeyboard = buttons.map(row =>
      row.map(btn => ({
        text: btn.text,
        callback_data: btn.callbackData,
        url: btn.url,
      }))
    );

    return this.sendMessage(chatId, text, {
      parseMode: 'Markdown',
      replyMarkup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  }

  /**
   * Send photo
   */
  static async sendPhoto(
    chatId: string | number,
    photoUrl: string,
    caption?: string
  ): Promise<number> {
    if (!this.isConfigured()) {
      console.log('Telegram Mock: Sending photo to', chatId);
      return Date.now();
    }

    try {
      const response = await axios.post(`${this.API_URL}/sendPhoto`, {
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'Markdown',
      });

      return response.data.result.message_id;
    } catch (error) {
      console.error('Error sending Telegram photo:', error);
      throw error;
    }
  }

  /**
   * Send document
   */
  static async sendDocument(
    chatId: string | number,
    documentUrl: string,
    fileName: string,
    caption?: string
  ): Promise<number> {
    if (!this.isConfigured()) {
      console.log('Telegram Mock: Sending document to', chatId);
      return Date.now();
    }

    try {
      const response = await axios.post(`${this.API_URL}/sendDocument`, {
        chat_id: chatId,
        document: documentUrl,
        caption,
        filename: fileName,
      });

      return response.data.result.message_id;
    } catch (error) {
      console.error('Error sending Telegram document:', error);
      throw error;
    }
  }

  /**
   * Answer callback query
   */
  static async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert?: boolean
  ): Promise<void> {
    if (!this.isConfigured()) return;

    try {
      await axios.post(`${this.API_URL}/answerCallbackQuery`, {
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      });
    } catch (error) {
      console.error('Error answering callback query:', error);
    }
  }

  /**
   * Set webhook for receiving updates
   */
  static async setWebhook(webhookUrl: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('Telegram Mock: Setting webhook to', webhookUrl);
      return true;
    }

    try {
      const response = await axios.post(`${this.API_URL}/setWebhook`, {
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      });

      return response.data.result;
    } catch (error) {
      console.error('Error setting Telegram webhook:', error);
      return false;
    }
  }

  /**
   * Get bot info
   */
  static async getBotInfo(): Promise<{
    id: number;
    firstName: string;
    username: string;
  } | null> {
    if (!this.isConfigured()) {
      return {
        id: 123456789,
        firstName: 'Otoniq Bot',
        username: 'otoniq_bot',
      };
    }

    try {
      const response = await axios.get(`${this.API_URL}/getMe`);
      return response.data.result;
    } catch (error) {
      console.error('Error getting bot info:', error);
      return null;
    }
  }

  /**
   * Handle incoming commands
   */
  static async handleCommand(
    command: string,
    chatId: number,
    userId: number
  ): Promise<void> {
    switch (command) {
      case '/start':
        await this.sendMessage(
          chatId,
          `🤖 *Otoniq.ai Bot'a Hoş Geldiniz!*\n\nKomutlar:\n/help - Yardım\n/stats - İstatistikler\n/orders - Son siparişler\n/products - Ürünler`,
          { parseMode: 'Markdown' }
        );
        break;

      case '/help':
        await this.sendMessage(
          chatId,
          `📚 *Yardım Menüsü*\n\n/stats - Günlük istatistikleri görüntüle\n/orders - Son siparişleri listele\n/products - Ürün listesini al\n/alerts - Uyarıları kontrol et`,
          { parseMode: 'Markdown' }
        );
        break;

      case '/stats':
        await this.sendMessage(
          chatId,
          `📊 *Bugünün İstatistikleri*\n\n• Sipariş: 23\n• Gelir: ₺12,450\n• Ziyaretçi: 1,234\n\n_${new Date().toLocaleString('tr-TR')}_`,
          { parseMode: 'Markdown' }
        );
        break;

      default:
        await this.sendMessage(
          chatId,
          `Bilinmeyen komut. /help yazarak yardım alabilirsiniz.`
        );
    }
  }

  /**
   * Send product recommendation
   */
  static async sendProductRecommendation(
    chatId: string | number,
    products: Array<{
      name: string;
      price: number;
      imageUrl: string;
      link: string;
    }>
  ): Promise<number> {
    const productButtons = products.slice(0, 3).map(product => [
      {
        text: `${product.name} - ₺${product.price}`,
        url: product.link,
      },
    ]);

    return this.sendInlineKeyboard(
      chatId,
      '🎁 *Size Özel Ürün Önerileri*\n\nBu ürünler ilginizi çekebilir:',
      productButtons
    );
  }
}
