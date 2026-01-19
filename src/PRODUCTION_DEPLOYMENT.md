# Production Deployment Configuration

# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# docker-compose.yml
version: '3.8'
services:
  wasel-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REACT_APP_SUPABASE_URL=${SUPABASE_URL}
      - REACT_APP_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - redis
  
  wasel-backend:
    build: ./src/backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

# GitHub Actions CI/CD
name: Deploy Wasel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to Production
        run: |
          docker build -t wasel-app .
          docker push ${{ secrets.DOCKER_REGISTRY }}/wasel-app:latest

# Environment Variables (.env.production)
NODE_ENV=production
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_GOOGLE_MAPS_API_KEY=your-maps-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-key
REACT_APP_BACKEND_URL=https://api.wassel.com

# Health Check Endpoint
GET /health
Response: {"status": "healthy", "timestamp": "2026-01-02T00:00:00Z"}

# Monitoring Setup
- Sentry for error tracking
- New Relic for performance monitoring  
- Uptime monitoring for 99.9% availability
- Log aggregation with structured logging

# Security Configuration
- HTTPS only with SSL certificates
- CORS configured for production domains
- Rate limiting: 100 requests/minute per IP
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers

# Database Optimization
- Connection pooling (max 20 connections)
- Query optimization with proper indexes
- Automated backups every 6 hours
- Read replicas for analytics queries

# CDN Configuration
- Static assets served via CloudFlare CDN
- Image optimization and compression
- Gzip compression for API responses
- Browser caching for static resources

# Load Balancer Setup
- NGINX reverse proxy
- SSL termination
- Health check routing
- Failover to backup servers

# Deployment Checklist
✅ Database schema deployed
✅ Environment variables configured
✅ SSL certificates installed
✅ CDN configured
✅ Monitoring setup
✅ Backup strategy implemented
✅ Load testing completed
✅ Security audit passed