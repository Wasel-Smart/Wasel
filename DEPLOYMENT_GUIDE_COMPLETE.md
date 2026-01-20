# 🚀 Production Deployment Guide - Wasel Backend

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
4. [Post-Deployment](#post-deployment)
5. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### ✅ Code & Dependencies

- [ ] All TypeScript compiled without errors
- [ ] All tests passing (`npm test`)
- [ ] Dependencies updated and secure (`npm audit`)
- [ ] Environment variables documented
- [ ] API keys rotated (after exposure)
- [ ] Git history cleaned (no sensitive data)

### ✅ Security

- [ ] All API keys are new/rotated
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] Helmet middleware configured

### ✅ Database

- [ ] Supabase Row Level Security (RLS) enabled
- [ ] Database indexes created
- [ ] Backup strategy configured
- [ ] Connection pooling optimized

### ✅ External Services

- [ ] Twilio account verified
- [ ] Stripe account activated
- [ ] Google Maps APIs enabled
- [ ] Webhook endpoints configured
- [ ] DNS records updated

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```bash
# ============================================================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================================================

# Server Configuration
NODE_ENV=production
PORT=3002
ALLOWED_ORIGINS=https://wasel.app,https://www.wasel.app

# Supabase (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Maps
GOOGLE_MAPS_API_KEY=your_new_google_maps_key_here

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_YOUR_NEW_LIVE_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_NEW_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Twilio (Production)
TWILIO_ACCOUNT_SID=YOUR_NEW_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_NEW_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
TWILIO_PHONE_NUMBER=+1234567890

# Emergency Contacts
EMERGENCY_CONTACT_PHONE=+962XXXXXXXXX

# Logging
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_here

# Redis (Optional - for session management)
REDIS_URL=redis://localhost:6379
```

### Security Best Practices

```bash
# Set restrictive file permissions
chmod 600 .env.production

# Never commit to Git
echo ".env.production" >> .gitignore

# Use secrets management (recommended)
# - AWS Secrets Manager
# - HashiCorp Vault
# - Google Secret Manager
```

---

## Deployment Options

### Option 1: Deploy to Railway (Recommended for Quick Start)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3002
# ... add all other variables

# 5. Deploy
railway up

# 6. Get deployment URL
railway domain
```

### Option 2: Deploy to Heroku

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create wasel-backend

# 4. Add buildpack
heroku buildpacks:set heroku/nodejs

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_url
# ... add all variables

# 6. Deploy
git push heroku main

# 7. Scale dynos
heroku ps:scale web=1

# 8. View logs
heroku logs --tail
```

### Option 3: Deploy to DigitalOcean App Platform

```bash
# 1. Create new app on DigitalOcean
# Go to: https://cloud.digitalocean.com/apps

# 2. Connect GitHub repository

# 3. Configure build settings:
#    - Build Command: npm run build
#    - Run Command: npm start
#    - Output Directory: dist

# 4. Add environment variables in the UI

# 5. Deploy
```

### Option 4: Deploy to AWS (EC2 + PM2)

```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2
sudo npm install -g pm2

# 5. Clone repository
git clone https://github.com/your-username/wasel-backend.git
cd wasel-backend

# 6. Install dependencies
npm install --production

# 7. Build TypeScript
npm run build

# 8. Create .env.production file
nano .env.production
# Paste all environment variables

# 9. Start with PM2
pm2 start dist/server-production-complete.js --name wasel-backend

# 10. Setup PM2 startup
pm2 startup
pm2 save

# 11. Configure Nginx (reverse proxy)
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/wasel

# Add configuration:
server {
    listen 80;
    server_name api.wasel.app;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 12. Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/wasel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 13. Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.wasel.app

# 14. Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Option 5: Deploy to Google Cloud Run

```bash
# 1. Create Dockerfile
cat > Dockerfile <<EOF
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3002

CMD ["node", "dist/server-production-complete.js"]
EOF

# 2. Create .dockerignore
cat > .dockerignore <<EOF
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
EOF

# 3. Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# 4. Authenticate
gcloud auth login

# 5. Set project
gcloud config set project your-project-id

# 6. Build and deploy
gcloud run deploy wasel-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,PORT=3002" \
  --max-instances=10

# 7. Add remaining environment variables
gcloud run services update wasel-backend \
  --set-env-vars="SUPABASE_URL=your_url,STRIPE_SECRET_KEY=your_key"
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Health check
curl https://your-domain.com/api/health

# Expected response:
# {
#   "status": "healthy",
#   "version": "1.0.0",
#   "services": {
#     "database": "up",
#     "websocket": "up",
#     "api": "up"
#   }
# }
```

### 2. Configure Webhooks

#### Stripe Webhook

```bash
# 1. Go to Stripe Dashboard > Developers > Webhooks
# 2. Add endpoint: https://your-domain.com/api/webhooks/stripe
# 3. Select events:
#    - payment_intent.succeeded
#    - payment_intent.payment_failed
#    - charge.refunded
# 4. Copy webhook secret
# 5. Update environment variable:
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

#### Twilio Callback URLs

```bash
# Set callback URLs in Twilio Console
# Status Callback URL: https://your-domain.com/api/webhooks/twilio/status
# Message Callback URL: https://your-domain.com/api/webhooks/twilio/message
```

### 3. Configure DNS

```bash
# Add CNAME or A record:
# api.wasel.app -> your-server-ip or cloud-url

# Verify DNS propagation
nslookup api.wasel.app
```

### 4. Setup SSL Certificate

```bash
# If using Let's Encrypt (Certbot)
sudo certbot --nginx -d api.wasel.app

# Auto-renewal
sudo certbot renew --dry-run

# Setup cron for auto-renewal
sudo crontab -e
# Add: 0 0 1 * * certbot renew --quiet
```

### 5. Configure Monitoring

#### Setup Sentry for Error Tracking

```bash
npm install @sentry/node @sentry/tracing

# Add to server.ts:
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### Setup Uptime Monitoring

- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: https://www.pingdom.com
- **StatusCake**: https://www.statuscake.com

Configure to ping:
```
https://your-domain.com/api/health
Every 5 minutes
```

### 6. Database Backups

```bash
# Supabase auto-backs up, but for extra safety:
# 1. Go to Supabase Dashboard > Database > Backups
# 2. Configure daily backups
# 3. Test restore procedure

# Manual backup script:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

---

## Monitoring & Maintenance

### Daily Checks

```bash
# Check server health
curl https://api.wasel.app/api/health | jq

# Check logs
pm2 logs wasel-backend --lines 100

# Check error rate
pm2 monit
```

### Weekly Tasks

- [ ] Review error logs
- [ ] Check payment reconciliation
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Check disk space
- [ ] Review performance metrics

### Monthly Tasks

- [ ] Rotate API keys
- [ ] Review and optimize database
- [ ] Update SSL certificates (if needed)
- [ ] Backup audit
- [ ] Security audit
- [ ] Performance optimization

### Logging Best Practices

```typescript
// Add structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Performance Monitoring

```bash
# Install New Relic or similar
npm install newrelic

# Add to top of server file:
require('newrelic');
```

### Scaling Strategies

#### Horizontal Scaling

```bash
# PM2 Cluster Mode
pm2 start dist/server.js -i max --name wasel-backend

# Load Balancer (Nginx)
upstream wasel_backend {
    server localhost:3002;
    server localhost:3003;
    server localhost:3004;
    server localhost:3005;
}
```

#### Vertical Scaling

```bash
# Increase server resources
# - CPU: 2+ cores
# - RAM: 4GB+ minimum
# - Disk: SSD with 50GB+
```

---

## Rollback Procedure

### Quick Rollback

```bash
# If using PM2
pm2 stop wasel-backend
git checkout previous-stable-version
npm install
npm run build
pm2 restart wasel-backend

# If using Heroku
heroku releases:rollback

# If using Railway
railway rollback

# If using Cloud Run
gcloud run services update-traffic wasel-backend \
  --to-revisions=PREVIOUS_REVISION=100
```

---

## Troubleshooting

### Issue: High CPU Usage

```bash
# Check processes
pm2 monit

# Analyze heap usage
node --expose-gc --inspect dist/server.js

# Add connection pooling
```

### Issue: Memory Leaks

```bash
# Monitor memory
pm2 start dist/server.js --max-memory-restart 500M

# Profile memory usage
node --inspect dist/server.js
# Open chrome://inspect
```

### Issue: Database Connection Failures

```bash
# Check Supabase status
curl https://status.supabase.com

# Test connection
psql $DATABASE_URL

# Increase connection pool
# In Supabase: Project Settings > Database > Connection Pool
```

---

## Emergency Contacts

- **Supabase Support**: https://supabase.com/support
- **Stripe Support**: https://support.stripe.com
- **Twilio Support**: https://support.twilio.com
- **Google Maps Support**: https://developers.google.com/maps/support

---

## Deployment Checklist

- [ ] Code deployed successfully
- [ ] Environment variables configured
- [ ] HTTPS/SSL enabled
- [ ] Webhooks configured
- [ ] DNS configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Health check passing
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team notified

---

**Your Wasel backend is now production-ready!** 🎉

For questions or issues, refer to the troubleshooting section or contact the development team.
