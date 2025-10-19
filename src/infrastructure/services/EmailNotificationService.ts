import axios, { AxiosInstance } from 'axios';

export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
  apiKey?: string;
  domain?: string;
  fromEmail: string;
  fromName: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface SendEmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailNotificationService {
  private api: AxiosInstance;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;

    // Initialize API client based on provider
    switch (config.provider) {
      case 'sendgrid':
        this.api = axios.create({
          baseURL: 'https://api.sendgrid.com/v3',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        break;
      case 'mailgun':
        this.api = axios.create({
          baseURL: `https://api.mailgun.net/v3/${config.domain}`,
          auth: {
            username: 'api',
            password: config.apiKey || '',
          },
        });
        break;
      case 'ses':
        this.api = axios.create({
          baseURL: 'https://email.us-east-1.amazonaws.com',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        break;
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Send a test email to verify configuration
      const testEmail: SendEmailRequest = {
        to: this.config.fromEmail,
        subject: 'Test Email - OTONIQ',
        textContent: 'This is a test email to verify email configuration.',
        htmlContent:
          '<p>This is a test email to verify email configuration.</p>',
      };

      const result = await this.sendEmail(testEmail);
      return { success: result.success, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email
   */
  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendViaSendGrid(request);
        case 'mailgun':
          return await this.sendViaMailgun(request);
        case 'ses':
          return await this.sendViaSES(request);
        default:
          throw new Error(
            `Unsupported email provider: ${this.config.provider}`
          );
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(
    request: SendEmailRequest
  ): Promise<SendEmailResponse> {
    const emailData = {
      personalizations: [
        {
          to: Array.isArray(request.to)
            ? request.to.map(email => ({ email }))
            : [{ email: request.to }],
          cc: request.cc
            ? Array.isArray(request.cc)
              ? request.cc.map(email => ({ email }))
              : [{ email: request.cc }]
            : undefined,
          bcc: request.bcc
            ? Array.isArray(request.bcc)
              ? request.bcc.map(email => ({ email }))
              : [{ email: request.bcc }]
            : undefined,
        },
      ],
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName,
      },
      subject: request.subject,
      content: [
        {
          type: 'text/plain',
          value: request.textContent || '',
        },
        {
          type: 'text/html',
          value: request.htmlContent || '',
        },
      ],
      attachments: request.attachments?.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.contentType,
        disposition: 'attachment',
      })),
    };

    const response = await this.api.post('/mail/send', emailData);
    return {
      success: true,
      messageId: response.headers['x-message-id'],
    };
  }

  /**
   * Send email via Mailgun
   */
  private async sendViaMailgun(
    request: SendEmailRequest
  ): Promise<SendEmailResponse> {
    const formData = new FormData();
    formData.append(
      'from',
      `${this.config.fromName} <${this.config.fromEmail}>`
    );
    formData.append(
      'to',
      Array.isArray(request.to) ? request.to.join(',') : request.to
    );
    formData.append('subject', request.subject);
    formData.append('text', request.textContent || '');
    formData.append('html', request.htmlContent || '');

    if (request.cc) {
      formData.append(
        'cc',
        Array.isArray(request.cc) ? request.cc.join(',') : request.cc
      );
    }
    if (request.bcc) {
      formData.append(
        'bcc',
        Array.isArray(request.bcc) ? request.bcc.join(',') : request.bcc
      );
    }

    const response = await this.api.post('/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      messageId: response.data.id,
    };
  }

  /**
   * Send email via AWS SES
   */
  private async sendViaSES(
    request: SendEmailRequest
  ): Promise<SendEmailResponse> {
    const emailData = {
      Source: `${this.config.fromName} <${this.config.fromEmail}>`,
      Destination: {
        ToAddresses: Array.isArray(request.to) ? request.to : [request.to],
        CcAddresses: request.cc
          ? Array.isArray(request.cc)
            ? request.cc
            : [request.cc]
          : undefined,
        BccAddresses: request.bcc
          ? Array.isArray(request.bcc)
            ? request.bcc
            : [request.bcc]
          : undefined,
      },
      Message: {
        Subject: {
          Data: request.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: request.textContent || '',
            Charset: 'UTF-8',
          },
          Html: {
            Data: request.htmlContent || '',
            Charset: 'UTF-8',
          },
        },
      },
    };

    const response = await this.api.post('/', emailData);
    return {
      success: true,
      messageId: response.data.MessageId,
    };
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(order: any): Promise<SendEmailResponse> {
    const subject = `Sipariş Onayı - #${order.orderNumber}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Siparişiniz Onaylandı!</h2>
        <p>Merhaba ${order.customerInfo.name},</p>
        <p>Siparişiniz başarıyla alınmış ve onaylanmıştır.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Sipariş Detayları</h3>
          <p><strong>Sipariş No:</strong> #${order.orderNumber}</p>
          <p><strong>Tarih:</strong> ${new Date(order.orderDate).toLocaleDateString('tr-TR')}</p>
          <p><strong>Toplam Tutar:</strong> ${order.totalAmount.getFormattedAmount()}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Sipariş Ürünleri</h3>
          ${order.items
            .map(
              (item: any) => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <p><strong>${item.title}</strong></p>
              <p>Miktar: ${item.quantity} | Fiyat: ${item.unitPrice.getFormattedAmount()}</p>
            </div>
          `
            )
            .join('')}
        </div>
        
        <p>Teşekkür ederiz!</p>
      </div>
    `;

    return await this.sendEmail({
      to: order.customerInfo.email,
      subject,
      htmlContent,
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdateEmail(
    order: any,
    newStatus: string
  ): Promise<SendEmailResponse> {
    const statusLabels: Record<string, string> = {
      PENDING: 'Beklemede',
      CONFIRMED: 'Onaylandı',
      PROCESSING: 'Hazırlanıyor',
      SHIPPED: 'Kargoya Verildi',
      DELIVERED: 'Teslim Edildi',
      CANCELLED: 'İptal Edildi',
    };

    const subject = `Sipariş Durumu Güncellendi - #${order.orderNumber}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Sipariş Durumu Güncellendi</h2>
        <p>Merhaba ${order.customerInfo.name},</p>
        <p>Siparişinizin durumu güncellenmiştir.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Sipariş Bilgileri</h3>
          <p><strong>Sipariş No:</strong> #${order.orderNumber}</p>
          <p><strong>Yeni Durum:</strong> ${statusLabels[newStatus] || newStatus}</p>
          <p><strong>Güncelleme Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>
        
        <p>Teşekkür ederiz!</p>
      </div>
    `;

    return await this.sendEmail({
      to: order.customerInfo.email,
      subject,
      htmlContent,
    });
  }

  /**
   * Send order cancellation email
   */
  async sendOrderCancellationEmail(
    order: any,
    reason?: string
  ): Promise<SendEmailResponse> {
    const subject = `Sipariş İptal Edildi - #${order.orderNumber}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Sipariş İptal Edildi</h2>
        <p>Merhaba ${order.customerInfo.name},</p>
        <p>Maalesef siparişiniz iptal edilmiştir.</p>
        
        <div style="background: #ffebee; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #d32f2f;">
          <h3>Sipariş Bilgileri</h3>
          <p><strong>Sipariş No:</strong> #${order.orderNumber}</p>
          <p><strong>İptal Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
          ${reason ? `<p><strong>İptal Sebebi:</strong> ${reason}</p>` : ''}
        </div>
        
        <p>Herhangi bir sorunuz varsa lütfen bizimle iletişime geçin.</p>
        <p>Teşekkür ederiz!</p>
      </div>
    `;

    return await this.sendEmail({
      to: order.customerInfo.email,
      subject,
      htmlContent,
    });
  }
}
