# 🚀 Otoniq.ai - E-Commerce & E-Export Automation Platform

> AI-powered e-commerce automation platform with multi-marketplace integration, N8N workflows, and comprehensive business intelligence.

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 🎯 Project Overview

**Otoniq.ai** is a comprehensive e-commerce automation platform designed for e-export and e-commerce companies. It manages entire business processes with full AI integration, including:

- 🤖 **AI-Powered Product Analysis** (GPT-4)
- 🛒 **8 Marketplace Integrations** (Shopify, Amazon, Trendyol, etc.)
- ⚡ **N8N Workflow Automation**
- 📱 **Multi-Channel Communication** (WhatsApp, Telegram)
- 🎨 **Visual Content Automation** (Canva, Image Processing)
- 🔌 **IoT Device Monitoring**
- 📊 **Advanced Analytics & Reporting**

---

## 📚 Documentation

- 📖 **[FEATURES.md](./FEATURES.md)** - Complete feature list (200+ features)
- 🚀 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- 🧪 **[TESTING.md](./TESTING.md)** - Testing infrastructure & guide
- 🔐 **[SECURITY_N8N_SETUP.md](./SECURITY_N8N_SETUP.md)** - Security & N8N setup guide
- 📦 **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture (coming soon)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- N8N Cloud account (optional but recommended)

### Installation

```bash
# Clone repository
git clone https://github.com/onreonA/otoniq.git
cd otoniq

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run e2e

# Coverage report
npm run test:coverage
```

---

## 🎯 Core Features

### 🔐 Security & Authentication

- Multi-tenant architecture with full isolation
- Two-Factor Authentication (2FA)
- Session management & refresh tokens
- Rate limiting & input validation
- Audit logging & Sentry error tracking

### 📦 Product & Inventory Management

- Complete product CRUD operations
- Multi-warehouse inventory tracking
- Stock movement history
- Category management
- Bulk operations & import/export

### 🛒 Marketplace Integrations

- **Shopify** - Full sync & webhooks
- **Odoo ERP** - XML-RPC integration
- **Trendyol** - Turkish marketplace
- **Amazon** - SP-API (FBA/FBM)
- **Hepsiburada** - Turkish marketplace
- **Alibaba.com** - B2B sourcing
- Unified dashboard for all marketplaces

### 🤖 AI & Automation

- **Feed Doctor** - AI product analysis (GPT-4)
- **N8N Workflows** - 10+ automated workflows
- **Visual Automation** - Canva API integration
- **Image Processing** - Enhancement & optimization
- **Social Media** - Auto-posting (5 platforms)
- **Email Campaigns** - Bulk & drip campaigns

### 💬 Communication

- **WhatsApp Business API** - Order notifications
- **Telegram Bot** - Admin alerts & commands
- Multi-channel notification system

### 🔌 IoT & Monitoring

- Device monitoring (temp, humidity, motion)
- Real-time alerts
- Device health scoring
- Battery monitoring

### 📊 Analytics & Reporting

- Real-time dashboard metrics
- Sales trends & forecasting
- Top products analysis
- Multi-marketplace comparison
- Exportable reports (CSV, PDF)

---

## 🏗️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for data fetching
- **React Flow** for workflow diagrams
- **Recharts** for data visualization

### Backend & Database

- **Supabase** (PostgreSQL + Auth + Edge Functions)
- **31+ Database Migrations**
- Row Level Security (RLS) policies
- Real-time subscriptions

### Automation & AI

- **N8N Cloud** for workflow automation
- **OpenAI GPT-4 Turbo** for AI analysis
- **Canva API** for design generation

### Testing & QA

- **Vitest** for unit tests
- **Cypress** for E2E tests
- **Testing Library** for component tests
- Coverage reporting

### DevOps & Monitoring

- **Vercel** for deployment
- **Sentry** for error tracking
- **GitHub Actions** for CI/CD
- **Supabase Logs** for monitoring

---

## 📊 Project Statistics

- **150+** Features Implemented
- **15+** Third-party Integrations
- **8** Marketplace Connections
- **31+** Database Migrations
- **20+** Services & Repositories
- **50+** UI Pages
- **10+** N8N Workflows
- **5** Social Media Platforms

---

## 🗂️ Project Structure

```
otoniq/
├── src/
│   ├── application/           # Use cases & business logic
│   ├── domain/               # Domain entities & interfaces
│   ├── infrastructure/       # External services & implementations
│   │   ├── database/        # Supabase migrations & queries
│   │   ├── services/        # API integrations
│   │   └── workflows/       # N8N workflow templates
│   └── presentation/        # UI components & pages
│       ├── components/      # Reusable components
│       ├── pages/          # Route pages
│       ├── hooks/          # Custom React hooks
│       └── store/          # State management
├── cypress/                 # E2E tests
├── public/                  # Static assets
├── DEPLOYMENT.md           # Deployment guide
├── FEATURES.md            # Feature documentation
└── TESTING.md            # Testing guide
```

---

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_KEY=

# N8N Cloud
VITE_N8N_API_URL=
VITE_N8N_API_KEY=

# OpenAI
VITE_OPENAI_API_KEY=

# Canva
VITE_CANVA_API_KEY=

# WhatsApp Business
VITE_WHATSAPP_PHONE_NUMBER_ID=
VITE_WHATSAPP_ACCESS_TOKEN=

# Telegram
VITE_TELEGRAM_BOT_TOKEN=

# Sentry
VITE_SENTRY_DSN=
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Manual Deployment

```bash
# Build
npm run build

# Preview
npm run preview

# Deploy dist/ folder to your hosting
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- OpenAIService

# E2E tests
npm run e2e

# Coverage
npm run test:coverage
```

See [TESTING.md](./TESTING.md) for complete testing guide.

---

## 📈 Roadmap

### ✅ Completed (v1.0.0)

- Core business features
- Security & authentication
- 8 marketplace integrations
- AI-powered automation
- N8N workflow system
- Testing infrastructure

### 🔄 In Progress (v1.1.0)

- Advanced AI/ML features
- Multi-language support
- GDPR/KVKK compliance

### 📋 Planned (v2.0.0)

- Enterprise features (RBAC, SSO)
- Predictive analytics
- Computer vision
- White-label solution

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

---

## 📞 Support

- **Email**: support@otoniq.ai
- **Documentation**: https://docs.otoniq.ai
- **Issues**: https://github.com/onreonA/otoniq/issues

---

## 🙏 Acknowledgments

- **Supabase** for backend infrastructure
- **N8N** for workflow automation
- **OpenAI** for AI capabilities
- **Vercel** for deployment platform

---

**Made with ❤️ by Otoniq Team**

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: January 2025
