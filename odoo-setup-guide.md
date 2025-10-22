# Odoo Kurulum Rehberi

## 1. Odoo Community Edition Kurulumu

### Ubuntu/Debian:

```bash
# Odoo 16 Community Edition
wget -O - https://nightly.odoo.com/odoo.key | apt-key add -
echo "deb http://nightly.odoo.com/16.0/nightly/deb/ ./" >> /etc/apt/sources.list.d/odoo.list
apt-get update && apt-get install odoo
```

### macOS:

```bash
# Homebrew ile
brew install postgresql
brew install odoo
```

### Windows:

- Odoo Windows Installer indir: https://www.odoo.com/download
- PostgreSQL kur
- Odoo'yu çalıştır

## 2. Odoo Konfigürasyonu

### Database Oluştur:

1. http://localhost:8069 adresine git
2. "Create Database" butonuna bas
3. Database adı: `otoniq_test`
4. Master password: `admin123`
5. Language: Turkish
6. Country: Turkey

### Multi-Company Setup:

1. Settings > Users & Companies > Companies
2. "Create" butonuna bas
3. Company 1: "NSL Savunma Ve Bilişim AŞ"
4. Company 2: "Woodntry E-ticaret Pazarlama AŞ"

## 3. Test Ürünleri Oluştur

### NSL Company için:

1. Company'yi NSL olarak değiştir
2. Inventory > Products > Products
3. "Create" butonuna bas
4. Ürün adı: "NSL Test Ürün 1"
5. SKU: "NSL-001"
6. Sale Price: 100
7. Product Type: Consumable

### Woodntry Company için:

1. Company'yi Woodntry olarak değiştir
2. Aynı adımları tekrarla
3. Ürün adı: "Woodntry Test Ürün 1"
4. SKU: "WOOD-001"

## 4. API Erişimi

### XML-RPC Endpoint:

- URL: http://localhost:8069
- Port: 8069
- Database: otoniq_test
- Username: admin
- Password: admin123

## 5. Test Bağlantısı

```bash
curl -X POST http://localhost:8069/xmlrpc/2/common \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "common",
      "method": "version"
    },
    "id": 1
  }'
```
