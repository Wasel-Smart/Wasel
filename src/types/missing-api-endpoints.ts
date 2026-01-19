/**
 * Missing Backend API Endpoints for Smart Route & Production
 * 
 * These endpoints need to be implemented in the backend server
 * to support the Smart Route autonomous intelligence system.
 */

// ============================================
// SMART ROUTE API ENDPOINTS
// ============================================

/**
 * POST /api/smart-route/events
 * Capture Smart Route events
 */
interface CaptureEventRequest {
  type: 'user_action' | 'rider_action' | 'system_event' | 'ml_prediction';
  source: string;
  data: any;
  userId?: string;
  tripId?: string;
  location?: { lat: number; lng: number };
  metadata?: any;
}

/**
 * POST /api/smart-route/decisions
 * Make autonomous decisions
 */
interface AutonomousDecisionRequest {
  type: 'demand_prediction' | 'dynamic_pricing' | 'smart_matching' | 'fraud_detection' | 'route_optimization';
  context: any;
  userId?: string;
  tripId?: string;
}

/**
 * GET /api/smart-route/health
 * System health check
 */
interface HealthCheckResponse {
  overall: 'healthy' | 'degraded' | 'critical';
  services: Record<string, any>;
  metrics: Record<string, any>;
  recommendations: string[];
}

/**
 * GET /api/smart-route/market-mirror
 * Market intelligence data
 */
interface MarketMirrorRequest {
  lat: number;
  lng: number;
  radius?: number;
}

// ============================================
// AI SERVICE ENDPOINTS
// ============================================

/**
 * POST /api/ai/routes/suggest
 * Smart route suggestions
 */
interface RouteSuggestRequest {
  query: string;
  userLocation?: { lat: number; lng: number };
  language?: string;
}

/**
 * POST /api/ai/pricing/optimize
 * Dynamic pricing optimization
 */
interface PricingOptimizeRequest {
  from: string;
  to: string;
  distance_km: number;
  departureTime: string;
  seats: number;
  tripType: 'passenger' | 'package';
  userReputation?: number;
}

/**
 * POST /api/ai/risk/assess
 * Risk assessment and fraud detection
 */
interface RiskAssessRequest {
  action: 'signup' | 'booking' | 'profile_update' | 'payment';
  data: any;
  accountAge?: number;
  previousFlags?: number;
}

/**
 * POST /api/ai/nlp/parse
 * Natural language query parsing
 */
interface NLPParseRequest {
  query: string;
  language: 'en' | 'ar';
}

/**
 * POST /api/ai/recommendations/personalized
 * Personalized recommendations
 */
interface PersonalizedRecommendationsRequest {
  userId: string;
  currentLocation?: { lat: number; lng: number };
  timeOfDay?: string;
}

/**
 * POST /api/ai/analytics/predict
 * Predictive analytics
 */
interface PredictiveAnalyticsRequest {
  type: 'demand' | 'pricing' | 'optimal_time';
  route: { from: string; to: string };
  targetDate?: string;
}

/**
 * POST /api/ai/matching/smart
 * Smart matching algorithm
 */
interface SmartMatchingRequest {
  from: string;
  to: string;
  date: string;
  seats: number;
  preferences?: any;
}

/**
 * POST /api/ai/conversation/suggest
 * Conversation AI suggestions
 */
interface ConversationSuggestRequest {
  history: Array<{ sender: string; message: string; timestamp: string }>;
  tripId?: string;
  language?: string;
}

// ============================================
// ML PIPELINE ENDPOINTS
// ============================================

/**
 * POST /api/ml/features/extract
 * Extract ML features from events
 */
interface FeatureExtractionRequest {
  eventData: any;
  featureTypes: ('user' | 'rider' | 'trip' | 'contextual')[];
}

/**
 * POST /api/ml/models/train
 * Trigger model training
 */
interface ModelTrainingRequest {
  modelType: string;
  trainingData?: any;
  hyperparameters?: any;
}

/**
 * POST /api/ml/models/predict
 * Model inference
 */
interface ModelPredictionRequest {
  modelType: string;
  features: any;
  userId?: string;
}

/**
 * POST /api/ml/feedback
 * Process feedback for model improvement
 */
interface FeedbackRequest {
  predictionId: string;
  actualOutcome: any;
  userSatisfaction?: number;
  metadata?: any;
}

// ============================================
// REAL-TIME ENDPOINTS
// ============================================

/**
 * WebSocket: /ws/location/{tripId}
 * Real-time location updates
 */
interface LocationUpdate {
  userId: string;
  tripId: string;
  coordinates: { lat: number; lng: number };
  heading: number;
  speed: number;
  accuracy: number;
  timestamp: string;
}

/**
 * WebSocket: /ws/trip-status/{tripId}
 * Real-time trip status updates
 */
interface TripStatusUpdate {
  tripId: string;
  status: string;
  eta?: string;
  distance?: number;
  duration?: number;
}

/**
 * POST /api/emergency/sos
 * Emergency SOS alert
 */
interface SOSRequest {
  tripId: string;
  location: { lat: number; lng: number };
  reason?: string;
  userId: string;
}

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

/**
 * GET /api/analytics/metrics
 * System performance metrics
 */
interface MetricsResponse {
  predictiveAccuracy: number;
  proactiveAcceptance: number;
  adaptationEffectiveness: number;
  userSatisfactionImprovement: number;
  activePredictions: number;
  activeRecommendations: number;
  activeAdaptations: number;
}

/**
 * GET /api/analytics/revenue
 * Revenue analytics
 */
interface RevenueAnalyticsRequest {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}

/**
 * GET /api/analytics/user-behavior
 * User behavior analytics
 */
interface UserBehaviorRequest {
  userId?: string;
  timeframe: string;
  metrics: string[];
}

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * GET /api/admin/system-health
 * Comprehensive system health
 */
interface SystemHealthResponse {
  services: Record<string, 'healthy' | 'degraded' | 'critical'>;
  databases: Record<string, any>;
  integrations: Record<string, any>;
  performance: Record<string, number>;
}

/**
 * POST /api/admin/fraud-alerts
 * Fraud detection alerts
 */
interface FraudAlertRequest {
  userId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: any;
}

/**
 * GET /api/admin/audit-logs
 * System audit logs
 */
interface AuditLogsRequest {
  startDate: string;
  endDate: string;
  userId?: string;
  action?: string;
  limit?: number;
}

// ============================================
// PAYMENT ENDPOINTS
// ============================================

/**
 * POST /api/payments/webhook/stripe
 * Stripe webhook handler
 */
interface StripeWebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
}

/**
 * POST /api/payments/refund
 * Process refund
 */
interface RefundRequest {
  tripId: string;
  amount: number;
  reason: string;
  userId: string;
}

/**
 * POST /api/payments/split
 * Split payment processing
 */
interface SplitPaymentRequest {
  tripId: string;
  splits: Array<{
    userId: string;
    amount: number;
    paymentMethodId: string;
  }>;
}

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================

/**
 * POST /api/notifications/push
 * Send push notification
 */
interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: any;
  channels: ('push' | 'sms' | 'email' | 'in_app')[];
}

/**
 * POST /api/notifications/bulk
 * Send bulk notifications
 */
interface BulkNotificationRequest {
  userIds: string[];
  template: string;
  data: any;
  channels: string[];
}

// ============================================
// INTEGRATION ENDPOINTS
// ============================================

/**
 * POST /api/integrations/maps/route
 * Calculate route using Google Maps
 */
interface RouteCalculationRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints?: Array<{ lat: number; lng: number }>;
  optimizeWaypoints?: boolean;
}

/**
 * POST /api/integrations/sms/send
 * Send SMS via Twilio
 */
interface SMSRequest {
  to: string;
  message: string;
  type: 'otp' | 'notification' | 'emergency';
}

/**
 * POST /api/integrations/email/send
 * Send email via SendGrid
 */
interface EmailRequest {
  to: string;
  template: string;
  data: any;
  priority?: 'low' | 'normal' | 'high';
}

// ============================================
// RATE LIMITING & SECURITY
// ============================================

/**
 * Middleware: Rate limiting
 */
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Middleware: API key validation
 */
interface APIKeyValidation {
  keyHeader: string;
  requiredScopes: string[];
  rateLimits: RateLimitConfig;
}

/**
 * Middleware: Request validation
 */
interface RequestValidation {
  schema: any;
  sanitize: boolean;
  allowUnknown: boolean;
}

// ============================================
// ERROR HANDLING
// ============================================

interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}

// ============================================
// IMPLEMENTATION NOTES
// ============================================

/**
 * Required Backend Technologies:
 * - Node.js/Express or Python/FastAPI
 * - WebSocket support (Socket.io or native)
 * - Redis for caching and rate limiting
 * - PostgreSQL with PostGIS for geospatial queries
 * - Message queue (Redis/RabbitMQ) for async processing
 * - ML serving framework (TensorFlow Serving/MLflow)
 * 
 * Security Requirements:
 * - JWT authentication with refresh tokens
 * - API rate limiting per user/IP
 * - Input validation and sanitization
 * - SQL injection prevention
 * - XSS protection headers
 * - CORS configuration
 * 
 * Performance Requirements:
 * - Response time < 200ms for most endpoints
 * - WebSocket latency < 100ms
 * - ML inference < 1000ms
 * - Database connection pooling
 * - Response caching where appropriate
 * 
 * Monitoring Requirements:
 * - Request/response logging
 * - Error tracking (Sentry)
 * - Performance monitoring (New Relic/DataDog)
 * - Health check endpoints
 * - Metrics collection (Prometheus)
 */

export type {
  CaptureEventRequest,
  AutonomousDecisionRequest,
  HealthCheckResponse,
  MarketMirrorRequest,
  RouteSuggestRequest,
  PricingOptimizeRequest,
  RiskAssessRequest,
  NLPParseRequest,
  PersonalizedRecommendationsRequest,
  PredictiveAnalyticsRequest,
  SmartMatchingRequest,
  ConversationSuggestRequest,
  FeatureExtractionRequest,
  ModelTrainingRequest,
  ModelPredictionRequest,
  FeedbackRequest,
  LocationUpdate,
  TripStatusUpdate,
  SOSRequest,
  MetricsResponse,
  RevenueAnalyticsRequest,
  UserBehaviorRequest,
  SystemHealthResponse,
  FraudAlertRequest,
  AuditLogsRequest,
  StripeWebhookEvent,
  RefundRequest,
  SplitPaymentRequest,
  PushNotificationRequest,
  BulkNotificationRequest,
  RouteCalculationRequest,
  SMSRequest,
  EmailRequest,
  RateLimitConfig,
  APIKeyValidation,
  RequestValidation,
  APIError,
  APIResponse
};