# 🚗 Wasel - Modern Ride Sharing Platform

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/Wasel-01/Wasel)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Production Ready](https://img.shields.io/badge/status-production%20ready-green.svg)](PRODUCTION_READY.md)
[![Health Check](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Wasel-01/4030b19df12e0616efa9b65503e5e1d1/raw/wasel-health.json)](https://github.com/Wasel-01/Wasel/actions?query=workflow%3A%22Health+Check%22)

> Wasel is a next-generation ride-sharing platform designed for the Middle East, built with modern web technologies and best practices.

## 🚀 Quick Start

```bash
# 1. Setup project
npm run setup

# 2. Configure environment
# Edit .env with your Supabase credentials

# 3. Start development
npm run dev

# 4. Visit http://localhost:3000
```

## ✨ Features

- 🔐 **Secure Authentication** - Email/password authentication with Supabase
- 🗺️ **Smart Route Matching** - Find rides based on location and preferences
- 💬 **Real-time Messaging** - Chat with drivers and passengers
- 💰 **Integrated Payments** - Secure payment processing
- ⭐ **Rating System** - Rate and review your trips
- 🛡️ **Safety Center** - Emergency contacts and SOS features
- 📊 **Analytics Dashboard** - Track your trips and earnings
- 🎁 **Referral Program** - Earn rewards by inviting friends

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS 3 + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Maps**: Mapbox GL JS
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Requirements

- Node.js 18+
- npm or yarn
- Supabase account (optional for demo)

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run setup` | Initial project setup |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run health` | Run health checks |
| `npm run typecheck` | Check TypeScript types |

## 🔧 Configuration

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
PAYMENT_PROVIDER_API_KEY=your_payment_key
```

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL migrations from `src/supabase/` (if present)
3. Add credentials to `.env`
4. Restart development server

## 🚀 Deployment

Ready for deployment to:

- **Vercel** - `vercel --prod`
- **Netlify** - Deploy `dist` folder
- **AWS Amplify** - Connect repository
- **Static Hosting** - Upload `dist` folder

```bash
npm run build
# Deploy the dist/ folder
```

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md)
- [Feature Specification](src/FEATURE_SPEC.md)
- [Developer Guide](src/DEVELOPER_GUIDE.md)
- [Backend Setup](src/BACKEND_SETUP_GUIDE.md)
- [Production Ready](PRODUCTION_READY.md)

## 🔒 Security

- ✅ No hardcoded credentials
- ✅ Input sanitization
- ✅ XSS prevention
- ✅ Log injection protection
- ✅ Environment variable security

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- 📧 Email: [support@wasel.app](mailto:support@wasel.app)
- 💬 Discord: [Join our community](https://discord.gg/wasel)
- 🐛 Issues: [GitHub Issues](https://github.com/Wasel-01/Wasel/issues)

---

Made with ❤️ by the Wasel Team
