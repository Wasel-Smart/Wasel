# Wassel Services Documentation

This document provides a comprehensive overview of all services in the Wassel ride-sharing application.

## 🏗️ Service Architecture

The Wassel application follows a service-oriented architecture with the following layers:

1. **Core Services** - Essential business logic services
2. **Integration Services** - Third-party API integrations
3. **Specialized Services** - Domain-specific services
4. **Utility Services** - Helper and factory services

## 📋 Service Index

### Core Services

#### 1. API Service (`api.ts`)
**Purpose**: Central API client for Supabase backend communication
**Key Features**:
- Authentication (signup, signin, profile management)
- Trip management (create, search, update, delete)
- Booking management
- Messaging system
- Wallet operations
- Notifications
- Referral system

**Usage**:
```typescript
import { authAPI, tripsAPI, bookingsAPI } from './services/api';

// Authenticate user
const result = await authAPI.signIn(email, password);

// Search trips
const trips = await tripsAPI.searchTrips('Dubai', 'Abu Dhabi', '2024-01-15', 2);
```

#### 2. AI Service (`aiService.ts`)
**Purpose**: AI-powered features for smart routing, pricing, and recommendations
**Key Features**:
- Smart route suggestions
- Dynamic pricing optimization
- Risk assessment and fraud detection
- Natural language search
- Personalized recommendations
- Predictive analytics
- Smart matching algorithms
- Conversation AI

**Usage**:
```typescript
import { aiService } from './services/aiService';

// Get smart route suggestions
const suggestions = await aiService.getSmartRouteSuggestions('Dubai Marina');

// Calculate dynamic pricing
const pricing = await aiService.getDynamicPricing(tripData);
```

#### 3. Payment Service (`paymentService.ts`)
**Purpose**: Comprehensive payment processing and wallet management
**Key Features**:
- Multi-currency wallet management
- Stripe payment integration
- Escrow system for secure transactions
- Refund processing
- Transaction history
- Payment card management
- Charity round-up feature

**Usage**:
```typescript
import { paymentService } from './services/paymentService';

// Get wallet balance
const balance = await paymentService.getBalance(userId);

// Process payment
const result = await paymentService.processPayment(userId, amount, 'AED', 'wallet', tripId, 'Trip payment');
```

#### 4. Real-Time Tracking Service (`realTimeTracking.ts`)
**Purpose**: Live GPS tracking and trip monitoring
**Key Features**:
- Location tracking and broadcasting
- Real-time subscriptions
- Trip status updates
- Emergency SOS system
- Geofencing
- ETA calculations

**Usage**:
```typescript
import { realTimeTrackingService } from './services/realTimeTracking';

// Start location tracking
realTimeTrackingService.startLocationTracking(tripId, onLocationUpdate);

// Subscribe to driver location
const unsubscribe = realTimeTrackingService.subscribeToDriverLocation(tripId, driverId, onUpdate);
```

#### 5. Notification Service (`notificationService.ts`)
**Purpose**: Multi-channel notification system
**Key Features**:
- Push notifications
- SMS notifications
- Email notifications
- In-app notifications
- User preferences management
- Notification history

**Usage**:
```typescript
import { notificationService } from './services/notificationService';

// Send notification
await notificationService.sendNotification(userId, {
  title: 'Trip Confirmed',
  message: 'Your trip has been confirmed',
  type: 'trip',
  channels: ['push', 'in_app']
});
```

#### 6. Location Service (`locationService.ts`)
**Purpose**: Location-based services and geocoding
**Key Features**:
- Current location detection
- Geocoding and reverse geocoding
- Route calculation
- Place suggestions
- Nearby places search
- Distance calculations

**Usage**:
```typescript
import { locationService } from './services/locationService';

// Get current location
const location = await locationService.getCurrentLocation();

// Calculate route
const route = await locationService.calculateRoute(origin, destination);
```

#### 7. Rating Service (`ratingService.ts`)
**Purpose**: User rating and review system
**Key Features**:
- Trip ratings and reviews
- User rating statistics
- Review responses
- Rating trends
- Top-rated drivers
- Review moderation

**Usage**:
```typescript
import { ratingService } from './services/ratingService';

// Submit rating
await ratingService.submitRating({
  tripId,
  ratedUserId,
  rating: 5,
  review: 'Great driver!'
});

// Get user stats
const stats = await ratingService.getUserRatingStats(userId);
```

#### 8. Admin Service (`adminService.ts`)
**Purpose**: Administrative functions and platform management
**Key Features**:
- User management
- System metrics
- Dispute resolution
- Fraud monitoring
- Platform analytics
- System notifications
- Audit logging

**Usage**:
```typescript
import { adminService } from './services/adminService';

// Get system metrics
const metrics = await adminService.getSystemMetrics();

// Update user status
await adminService.updateUserStatus(userId, 'suspended', 'Policy violation');
```

#### 9. Security Service (`securityService.ts`)
**Purpose**: Security, authentication, and fraud prevention
**Key Features**:
- Enhanced authentication
- Fraud detection
- 2FA verification
- Device fingerprinting
- Security event logging
- Account protection

**Usage**:
```typescript
import { securityService } from './services/securityService';

// Authenticate with security checks
const result = await securityService.authenticateUser(email, password, deviceFingerprint, ip, userAgent);

// Detect fraud
const fraudResult = await securityService.detectFraud(userId, context);
```

### Integration Services

#### 1. Maps Service (`integrations.ts`)
**Purpose**: Google Maps API integration
**Key Features**:
- Route calculation
- Geocoding/reverse geocoding
- Distance matrix
- Places API

#### 2. Payment Integration (`integrations.ts`)
**Purpose**: Stripe payment processing
**Key Features**:
- Payment intents
- Payment confirmation
- Refund processing

#### 3. SMS Service (`twilioService.ts`)
**Purpose**: Twilio SMS and voice integration
**Key Features**:
- SMS messaging
- Voice calls
- Emergency notifications
- Verification codes

#### 4. Email Service (`integrations.ts`)
**Purpose**: SendGrid email integration
**Key Features**:
- Transactional emails
- Verification emails
- Receipts and notifications

### Specialized Services

#### 1. Hero Service (`heroService.ts`)
**Purpose**: Community task and delivery system
**Key Features**:
- Task discovery
- Task acceptance
- Community rewards

#### 2. Package Service (`packageService.ts`)
**Purpose**: Package delivery system
**Key Features**:
- Delivery requests
- Captain matching
- Tracking system

#### 3. School Transport Service (`schoolTransportService.ts`)
**Purpose**: School transportation management
**Key Features**:
- Route creation
- Student management
- Guardian notifications

#### 4. Scooter Service (`scooterService.ts`)
**Purpose**: Scooter rental system
**Key Features**:
- Scooter discovery
- Rental management
- Battery tracking

#### 5. Intermodal Service (`intermodalService.ts`)
**Purpose**: Multi-modal journey planning
**Key Features**:
- Journey optimization
- Mode combination
- Cultural considerations

### Utility Services

#### 1. Service Factory (`serviceFactory.ts`)
**Purpose**: Unified service interface
**Key Features**:
- Service discovery
- Request processing
- Pricing calculation
- Assignment and completion

#### 2. Analytics Service (`analyticsService.ts`)
**Purpose**: Trip and user analytics
**Key Features**:
- Trip statistics
- User behavior analysis
- Revenue tracking

#### 3. Error Tracking (`errorTracking.ts`)
**Purpose**: Error monitoring and logging
**Key Features**:
- Exception capture
- Performance tracking
- User context

## 🚀 Service Initialization

Services are automatically initialized when imported. For manual initialization:

```typescript
import { initializeServices, performHealthCheck } from './services';

// Initialize all services
const result = await initializeServices();

// Check service health
const health = await performHealthCheck();
```

## 🔧 Configuration

Services are configured through environment variables:

```env
# Core Services
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key

# Integration Services
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key
REACT_APP_TWILIO_ACCOUNT_SID=your_twilio_sid
REACT_APP_SENDGRID_API_KEY=your_sendgrid_key
REACT_APP_FIREBASE_API_KEY=your_firebase_key

# Optional Services
REACT_APP_JUMIO_API_KEY=your_jumio_key
REACT_APP_MIXPANEL_TOKEN=your_mixpanel_token
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

## 📊 Service Health Monitoring

All services include health monitoring:

```typescript
import { checkAllServicesStatus } from './services';

const status = await checkAllServicesStatus();
console.log('Service Health:', status.overall_health);
console.log('Integration Health:', status.integrations.percentage + '%');
```

## 🔒 Security Considerations

1. **Authentication**: All API calls are authenticated using Supabase Auth
2. **Authorization**: Row-level security (RLS) policies protect data
3. **Encryption**: Sensitive data is encrypted at rest and in transit
4. **Fraud Detection**: AI-powered fraud detection on all transactions
5. **Rate Limiting**: API rate limiting prevents abuse
6. **Input Validation**: All inputs are validated and sanitized

## 🧪 Testing

Services include comprehensive test coverage:

```bash
# Run service tests
npm test src/services/

# Run specific service tests
npm test src/services/paymentService.test.ts
```

## 📈 Performance

Services are optimized for performance:

- **Caching**: Frequently accessed data is cached
- **Lazy Loading**: Services are loaded on demand
- **Connection Pooling**: Database connections are pooled
- **CDN**: Static assets served via CDN
- **Compression**: API responses are compressed

## 🔄 Service Updates

Services follow semantic versioning and include migration scripts for updates:

1. **Backward Compatibility**: New versions maintain backward compatibility
2. **Migration Scripts**: Database schema changes include migration scripts
3. **Feature Flags**: New features can be toggled via feature flags
4. **Rollback Support**: Services support rollback to previous versions

## 📞 Support

For service-related issues:

1. Check service health status
2. Review error logs
3. Consult API documentation
4. Contact support team

## 🎯 Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Logging**: Log important events and errors
3. **Monitoring**: Monitor service performance and health
4. **Testing**: Write comprehensive tests for all services
5. **Documentation**: Keep service documentation up to date
6. **Security**: Follow security best practices
7. **Performance**: Optimize for performance and scalability

---

*Last Updated: January 2, 2026*
*Version: 1.0.0*