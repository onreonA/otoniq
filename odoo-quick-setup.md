# Odoo Hızlı Kurulum Rehberi

## 1. Odoo Community Edition İndir

### macOS:

```bash
# Homebrew ile
brew install postgresql
brew services start postgresql
brew install odoo
```

### Ubuntu/Debian:

```bash
# PostgreSQL kur
sudo apt update
sudo apt install postgresql postgresql-contrib

# Odoo kur
wget -O - https://nightly.odoo.com/odoo.key | sudo apt-key add -
echo "deb http://nightly.odoo.com/16.0/nightly/deb/ ./" | sudo tee /etc/apt/sources.list.d/odoo.list
sudo apt update
sudo apt install odoo
```

## 2. PostgreSQL Setup

```bash
# PostgreSQL kullanıcısı oluştur
sudo -u postgres createuser --createdb --username postgres --no-createrole --no-superuser --pwprompt odoo
# Şifre: odoo

# Database oluştur
sudo -u postgres createdb --username postgres --owner odoo --encoding UTF8 --template template0 otoniq_test
```

## 3. Odoo Başlat

```bash
# Odoo'yu başlat
sudo systemctl start odoo
sudo systemctl enable odoo

# Veya manuel başlat
odoo -d otoniq_test -r odoo -w odoo --http-port=8069
```

## 4. Web Interface

1. **http://localhost:8069** adresine git
2. **"Create Database"** butonuna bas
3. **Database adı**: `otoniq_test`
4. **Master password**: `admin123`
5. **Language**: Turkish
6. **Country**: Turkey

## 5. Multi-Company Setup

1. **Settings > Users & Companies > Companies**
2. **"Create"** butonuna bas
3. **Company 1**: "NSL Savunma Ve Bilişim AŞ"
4. **Company 2**: "Woodntry E-ticaret Pazarlama AŞ"

## 6. Test Ürünleri

### NSL Company için:

1. Company'yi NSL olarak değiştir
2. **Inventory > Products > Products**
3. **"Create"** butonuna bas
4. **Ürün adı**: "NSL Test Ürün 1"
5. **SKU**: "NSL-001"
6. **Sale Price**: 100
7. **Product Type**: Consumable

### Woodntry Company için:

1. Company'yi Woodntry olarak değiştir
2. Aynı adımları tekrarla
3. **Ürün adı**: "Woodntry Test Ürün 1"
4. **SKU**: "WOOD-001"

## 7. API Test

```bash
# Odoo version check
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

## 8. Otoniq'te Test

1. **Odoo Integration sayfasına git**
2. **Settings** tab'ında:
   - **URL**: `http://localhost:8069`
   - **Database**: `otoniq_test`
   - **Username**: `admin`
   - **Password**: `admin123`
3. **"Bağlantıyı Test Et"** butonuna bas
