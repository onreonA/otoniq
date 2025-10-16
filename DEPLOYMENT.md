# 🚀 Otoniq.ai Deployment Guide

## Production Checklist

### ✅ Pre-Deployment

- [ ] All environment variables configured
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured
- [ ] Sentry error tracking active
- [ ] N8N workflows tested
- [ ] Database migrations applied
- [ ] Security headers configured (vercel.json)

### 🔐 Environment Variables

Create `.env.local` for development and configure in Vercel/production:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_KEY=your-service-key

# N8N Cloud
VITE_N8N_API_URL=https://your-workspace.app.n8n.cloud
VITE_N8N_API_KEY=your-n8n-api-key
VITE_N8N_WEBHOOK_BASE_URL=https://your-workspace.app.n8n.cloud/webhook

# OpenAI (for Feed Doctor)
VITE_OPENAI_API_KEY=sk-your-openai-key

# Canva (for Visual Automation)
VITE_CANVA_API_KEY=your-canva-api-key

# WhatsApp Business
VITE_WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
VITE_WHATSAPP_ACCESS_TOKEN=your-whatsapp-token

# Telegram Bot
VITE_TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Amazon Marketplace
VITE_AMAZON_SELLER_ID=your-seller-id
VITE_AMAZON_ACCESS_KEY=your-access-key
VITE_AMAZON_SECRET_KEY=your-secret-key

# Hepsiburada
VITE_HEPSIBURADA_MERCHANT_ID=your-merchant-id
VITE_HEPSIBURADA_USERNAME=your-username
VITE_HEPSIBURADA_PASSWORD=your-password

# Sentry
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_AUTH_TOKEN=your-auth-token

# App Config
VITE_APP_ENV=production
VITE_APP_NAME=Otoniq.ai
VITE_APP_URL=https://otoniq.ai
VITE_APP_VERSION=1.0.0
```

### 🗄️ Database Setup

1. **Run all migrations** in Supabase SQL Editor (in order):
   - `001_initial_schema.sql` → `031_email_campaigns.sql`

2. **Enable RLS** on all tables

3. **Create indexes** for performance:

```sql
-- Products
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_sku ON products(sku);

-- Orders
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Analytics
CREATE INDEX idx_feed_analysis_tenant_id ON feed_analysis(tenant_id);
CREATE INDEX idx_feed_analysis_score ON feed_analysis(overall_score);
```

### 🚀 Vercel Deployment

1. **Connect GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Set build settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**:

```bash
npm run build
vercel --prod
```

### 🔒 Security Configuration

1. **Enable security headers** (already in `vercel.json`)
2. **Configure CORS** in Supabase:
   - Add production domain to allowed origins

3. **Set up rate limiting**:
   - Already implemented in codebase
   - Monitor via Supabase logs

4. **Enable 2FA** for all admin users

### 📊 Monitoring Setup

**Sentry**:

1. Create project at sentry.io
2. Add DSN to environment variables
3. Enable source maps upload (already in vite.config.ts)

**Supabase Logs**:

- Monitor RPC function calls
- Track RLS policy violations
- Watch for slow queries

**N8N Monitoring**:

- Check workflow execution history
- Monitor failed workflows
- Review webhook response times

### 🔄 N8N Workflows Setup

1. **Create N8N Cloud account**: https://app.n8n.cloud/register
2. **Install default workflows** via `/automation` page
3. **Configure credentials** for each workflow:
   - Supabase connection (API key)
   - Email service (SMTP or SendGrid)
   - WhatsApp/Telegram tokens

4. **Test workflows manually** before activating schedules

### 📱 Third-Party Integrations

**Shopify**:

1. Create private app in Shopify admin
2. Copy API credentials to Supabase Edge Function env

**Odoo**:

1. Get XML-RPC endpoint URL
2. Configure database, username, password

**Trendyol** (requires proxy):

1. Set up backend proxy server
2. Configure API credentials

**WhatsApp Business**:

1. Create Meta Business account
2. Set up WhatsApp Business API
3. Add phone number and webhook

**Telegram**:

1. Create bot via @BotFather
2. Get bot token
3. Set webhook URL

### 🧪 Testing

**Manual Testing**:

- [ ] User registration & login
- [ ] 2FA setup & verification
- [ ] Product management (CRUD)
- [ ] Order processing
- [ ] Marketplace sync (Shopify, Odoo)
- [ ] N8N workflows execution
- [ ] Feed Doctor analysis
- [ ] Visual content generation
- [ ] WhatsApp/Telegram notifications

**Performance Testing**:

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=https://your-domain.com
```

### 📈 Performance Optimization

**Vercel Settings**:

- Enable Edge Functions for auth
- Configure caching headers
- Use Vercel Analytics

**Database Optimization**:

- Enable connection pooling
- Use prepared statements
- Implement Redis caching (future)

**Asset Optimization**:

- Images served via CDN
- Code splitting enabled (Vite)
- Lazy loading for routes

### 🔐 Post-Deployment Security

1. **Rotate all secrets** after initial deployment
2. **Enable Vercel DDoS protection**
3. **Set up backup schedule** in Supabase
4. **Configure alerts** for:
   - High error rates (Sentry)
   - Failed workflows (N8N)
   - Database connection issues
   - Rate limit violations

### 📞 Support & Maintenance

**Regular Tasks**:

- Weekly: Review error logs (Sentry)
- Weekly: Check workflow success rates (N8N)
- Monthly: Review database performance
- Monthly: Update dependencies (`npm audit`)

**Emergency Contacts**:

- Supabase Support: https://supabase.com/support
- N8N Support: https://community.n8n.io/
- Vercel Support: https://vercel.com/support

### 🎯 Rollback Plan

If deployment fails:

1. **Revert to previous deployment** in Vercel dashboard
2. **Check error logs** in Sentry
3. **Verify environment variables** are correct
4. **Test database migrations** can be rolled back
5. **Pause N8N workflows** if causing issues

### ✅ Go-Live Checklist

- [ ] All features tested on staging
- [ ] Database backups configured
- [ ] Monitoring & alerts active
- [ ] Documentation complete
- [ ] Team trained on admin panel
- [ ] Customer support ready
- [ ] Marketing materials prepared
- [ ] Social media announcements scheduled

---

## 🎉 Launch Day

1. **Deploy to production** via Vercel
2. **Verify all services** are responding
3. **Run smoke tests** on critical paths
4. **Monitor error rates** closely for first 24h
5. **Announce launch** on social media
6. **Onboard first customers** with support team

---

**Need help?** Contact: support@otoniq.ai
