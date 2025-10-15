# N8N Setup Guide - Otoniq.ai

## Genel Bakış

Otoniq.ai, iş akışı otomasyonu için N8N kullanmaktadır. Bu doküman, N8N kurulumu ve konfigürasyonunu açıklar.

## Seçenek 1: N8N Cloud (Önerilen - Hızlı Başlangıç)

### Adımlar:

1. **N8N Cloud Hesabı Oluşturun**
   - https://n8n.io/cloud/ adresine gidin
   - Ücretsiz trial ile başlayın veya ücretli plan seçin
   - E-posta doğrulamasını tamamlayın

2. **API Key Oluşturun**
   - N8N Cloud dashboard'a gidin
   - Settings → API Keys → Create API Key
   - API key'i kopyalayın ve güvenli bir yerde saklayın

3. **Environment Variables'ı Güncelleyin**
   ```bash
   # .env.local dosyasını düzenleyin
   VITE_N8N_API_URL=https://your-instance.app.n8n.cloud
   VITE_N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxx
   VITE_N8N_WEBHOOK_BASE_URL=https://your-instance.app.n8n.cloud/webhook
   ```

4. **Workflow'ları İçe Aktarın**
   - N8N Cloud'da "Workflows" sekmesine gidin
   - "Import from file" seçeneğini kullanın
   - Şu dosyaları import edin:
     - `src/infrastructure/workflows/daily-report.workflow.json`
     - `src/infrastructure/workflows/low-stock-alert.workflow.json`
     - `src/infrastructure/workflows/new-order-notification.workflow.json`

5. **Credentials Ayarlayın**
   - N8N Cloud'da "Credentials" sekmesine gidin
   - Aşağıdaki credential'ları oluşturun:
     - **Supabase Auth** (HTTP Header Auth):
       - Header Name: `apikey`
       - Header Value: `your_supabase_anon_key`
     - **SMTP Account** (Email için):
       - SMTP Host, Port, User, Password
     - **WhatsApp Business** (opsiyonel):
       - WhatsApp Business API credentials

## Seçenek 2: Self-Hosted (Docker)

### Gereksinimler:
- Docker & Docker Compose
- PostgreSQL (N8N için ayrı)
- Minimum 2GB RAM
- SSL sertifikası (production için)

### Adımlar:

1. **Docker Compose Dosyası Oluşturun**
   ```yaml
   # docker-compose.n8n.yml
   version: '3.8'
   
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_USER: n8n
         POSTGRES_PASSWORD: n8n_password
         POSTGRES_DB: n8n
       volumes:
         - n8n_postgres_data:/var/lib/postgresql/data
       networks:
         - n8n-network
   
     n8n:
       image: n8nio/n8n:latest
       ports:
         - "5678:5678"
       environment:
         - N8N_BASIC_AUTH_ACTIVE=true
         - N8N_BASIC_AUTH_USER=admin
         - N8N_BASIC_AUTH_PASSWORD=your_secure_password
         - DB_TYPE=postgresdb
         - DB_POSTGRESDB_HOST=postgres
         - DB_POSTGRESDB_PORT=5432
         - DB_POSTGRESDB_DATABASE=n8n
         - DB_POSTGRESDB_USER=n8n
         - DB_POSTGRESDB_PASSWORD=n8n_password
         - N8N_HOST=your-domain.com
         - N8N_PROTOCOL=https
         - WEBHOOK_URL=https://your-domain.com/
         - N8N_ENCRYPTION_KEY=your_encryption_key_here
       volumes:
         - n8n_data:/home/node/.n8n
       depends_on:
         - postgres
       networks:
         - n8n-network
   
   volumes:
     n8n_postgres_data:
     n8n_data:
   
   networks:
     n8n-network:
       driver: bridge
   ```

2. **N8N'i Başlatın**
   ```bash
   docker-compose -f docker-compose.n8n.yml up -d
   ```

3. **N8N'e Erişin**
   - http://localhost:5678 adresine gidin
   - Basic Auth credentials ile giriş yapın

4. **API Access Ayarlayın**
   - Settings → API → Enable API access
   - API key oluşturun

5. **Environment Variables'ı Güncelleyin**
   ```bash
   VITE_N8N_API_URL=http://localhost:5678
   VITE_N8N_API_KEY=your_api_key
   VITE_N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
   ```

## Multi-Tenant Yapılandırması

### Her Tenant için Workflow Kurulumu:

1. **Otomatik Kurulum (Önerilen)**
   ```typescript
   import { WorkflowInstaller } from './infrastructure/workflows/WorkflowInstaller';
   
   // Yeni tenant oluşturulduğunda
   const workflowIds = await WorkflowInstaller.installDefaultWorkflows(
     tenantId,
     userId
   );
   ```

2. **Manuel Kurulum**
   - N8N Service kullanarak workflow oluşturun
   - Tenant ID'yi workflow tag'lerine ekleyin
   - Webhook URL'lerini tenant'a özgü yapın

### Naming Convention:
- Workflow isimleri: `[tenant_name]_workflow_name`
- Webhook paths: `/webhook/[tenant_id]/[workflow_name]`
- Credential isimleri: `[tenant_name]_credential_type`

## Workflow'ları Kullanma

### 1. Günlük Satış Raporu (Cron)
```typescript
// Otomatik çalışır, manuel trigger için:
await N8NService.executeWorkflow(workflowId);
```

### 2. Düşük Stok Uyarısı (Webhook)
```typescript
// InventoryService içinden tetikleyin
const execution = await N8NService.executeWorkflow(workflowId, {
  product_id: product.id,
  product_name: product.name,
  product_sku: product.sku,
  current_stock: currentStock,
  threshold: stockThreshold,
  warehouse_name: warehouse.name,
  tenant_id: tenantId
});
```

### 3. Yeni Sipariş Bildirimi (Webhook)
```typescript
// OrderService içinden tetikleyin
const execution = await N8NService.executeWorkflow(workflowId, {
  id: order.id,
  order_number: order.orderNumber,
  customer_name: order.customerName,
  customer_email: order.customerEmail,
  total_amount: order.totalAmount,
  items: order.items,
  tenant_id: tenantId
});
```

## Troubleshooting

### 1. Workflow çalışmıyor
- N8N service'in çalıştığını kontrol edin
- Credential'ların doğru yapılandırıldığını kontrol edin
- Workflow'un active olduğunu kontrol edin
- Logs'u kontrol edin: N8N → Executions → View logs

### 2. Webhook 404 hatası
- Webhook URL'nin doğru olduğunu kontrol edin
- N8N'de webhook node'unun active olduğunu kontrol edin
- N8N_WEBHOOK_BASE_URL environment variable'ını kontrol edin

### 3. Database connection hatası
- Supabase URL ve API key'lerin doğru olduğunu kontrol edin
- RLS policies'lerin API key'e izin verdiğini kontrol edin
- Network bağlantısını kontrol edin

## Production Checklist

- [ ] N8N Cloud paid plan veya production-ready self-hosted setup
- [ ] SSL sertifikası yapılandırıldı
- [ ] Güvenli API keys ve credentials
- [ ] Backup stratejisi (workflow exports)
- [ ] Monitoring ve alerting (N8N executions)
- [ ] Rate limiting yapılandırması
- [ ] Email/WhatsApp service credentials production'da
- [ ] Webhook URL'leri production domain'e güncellendi
- [ ] Credential encryption key güvenli
- [ ] Log retention policy belirlendi

## Ek Kaynaklar

- N8N Documentation: https://docs.n8n.io/
- N8N Community: https://community.n8n.io/
- Workflow Templates: https://n8n.io/workflows/
- API Documentation: https://docs.n8n.io/api/

## Destek

Herhangi bir sorun için:
- N8N setup issues: N8N community veya support
- Otoniq integration issues: development team

