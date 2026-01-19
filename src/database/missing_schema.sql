-- ============================================
-- MISSING DATABASE SCHEMA - SMART ROUTE & PRODUCTION
-- ============================================

-- Smart Route Events Table
CREATE TABLE IF NOT EXISTS smart_route_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'user_action', 'rider_action', 'system_event', 'ml_prediction'
  source TEXT NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  trip_id UUID REFERENCES trips(id),
  location JSONB,
  metadata JSONB
);

CREATE INDEX idx_smart_route_events_type ON smart_route_events(type);
CREATE INDEX idx_smart_route_events_source ON smart_route_events(source);
CREATE INDEX idx_smart_route_events_timestamp ON smart_route_events(timestamp DESC);
CREATE INDEX idx_smart_route_events_user ON smart_route_events(user_id);

-- AI Logs Table
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  input JSONB NOT NULL,
  output JSONB,
  confidence DECIMAL,
  latency INTEGER, -- milliseconds
  timestamp TIMESTAMP DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

CREATE INDEX idx_ai_logs_feature ON ai_logs(feature);
CREATE INDEX idx_ai_logs_timestamp ON ai_logs(timestamp DESC);
CREATE INDEX idx_ai_logs_success ON ai_logs(success);

-- AI Configuration Table
CREATE TABLE IF NOT EXISTS ai_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enabled BOOLEAN DEFAULT TRUE,
  features JSONB DEFAULT '{}',
  models JSONB DEFAULT '{}',
  thresholds JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_enabled BOOLEAN DEFAULT TRUE,
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  comfort_preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ML Features Cache Table
CREATE TABLE IF NOT EXISTS ml_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  trip_id UUID REFERENCES trips(id),
  feature_type TEXT NOT NULL, -- 'user', 'rider', 'trip', 'contextual'
  features JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_ml_features_user ON ml_features(user_id);
CREATE INDEX idx_ml_features_type ON ml_features(feature_type);
CREATE INDEX idx_ml_features_expires ON ml_features(expires_at);

-- Autonomous Decisions Table
CREATE TABLE IF NOT EXISTS autonomous_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'demand_prediction', 'dynamic_pricing', etc.
  confidence DECIMAL NOT NULL,
  recommendation JSONB NOT NULL,
  reasoning TEXT[],
  timestamp TIMESTAMP DEFAULT NOW(),
  executed BOOLEAN DEFAULT FALSE,
  execution_result JSONB,
  user_id UUID REFERENCES auth.users(id),
  trip_id UUID REFERENCES trips(id)
);

CREATE INDEX idx_autonomous_decisions_type ON autonomous_decisions(type);
CREATE INDEX idx_autonomous_decisions_executed ON autonomous_decisions(executed);
CREATE INDEX idx_autonomous_decisions_timestamp ON autonomous_decisions(timestamp DESC);

-- Predictive Matches Table
CREATE TABLE IF NOT EXISTS predictive_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  predicted_route JSONB NOT NULL,
  confidence DECIMAL NOT NULL,
  pre_configured_options JSONB DEFAULT '[]',
  expires_at TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'predicted', -- 'predicted', 'confirmed', 'expired', 'rejected'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictive_matches_user ON predictive_matches(user_id);
CREATE INDEX idx_predictive_matches_status ON predictive_matches(status);
CREATE INDEX idx_predictive_matches_expires ON predictive_matches(expires_at);

-- System Health Metrics Table
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  metric_unit TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_system_health_timestamp ON system_health_metrics(timestamp DESC);
CREATE INDEX idx_system_health_metric ON system_health_metrics(metric_name);

-- API Rate Limiting Table
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT NOW(),
  blocked_until TIMESTAMP
);

CREATE INDEX idx_api_rate_limits_user ON api_rate_limits(user_id);
CREATE INDEX idx_api_rate_limits_ip ON api_rate_limits(ip_address);
CREATE INDEX idx_api_rate_limits_endpoint ON api_rate_limits(endpoint);

-- Error Logs Table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id),
  request_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_error_logs_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);

-- ============================================
-- MISSING RPC FUNCTIONS
-- ============================================

-- Get nearby scooters function
CREATE OR REPLACE FUNCTION get_nearby_scooters(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km DECIMAL DEFAULT 2
)
RETURNS TABLE (
  id UUID,
  battery INTEGER,
  location JSONB,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.battery,
    s.location,
    (6371 * acos(cos(radians(user_lat)) * cos(radians((s.location->>'lat')::DECIMAL)) * 
     cos(radians((s.location->>'lng')::DECIMAL) - radians(user_lng)) + 
     sin(radians(user_lat)) * sin(radians((s.location->>'lat')::DECIMAL))))::DECIMAL as distance_km
  FROM scooters s
  WHERE s.status = 'available'
    AND s.battery >= 20
    AND (6371 * acos(cos(radians(user_lat)) * cos(radians((s.location->>'lat')::DECIMAL)) * 
         cos(radians((s.location->>'lng')::DECIMAL) - radians(user_lng)) + 
         sin(radians(user_lat)) * sin(radians((s.location->>'lat')::DECIMAL)))) <= radius_km
  ORDER BY distance_km
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Calculate demand density function
CREATE OR REPLACE FUNCTION calculate_demand_density(
  center_lat DECIMAL,
  center_lng DECIMAL,
  radius_km DECIMAL DEFAULT 5,
  time_window_hours INTEGER DEFAULT 24
)
RETURNS DECIMAL AS $$
DECLARE
  demand_count INTEGER;
  area_km2 DECIMAL;
BEGIN
  -- Count trips in the area within time window
  SELECT COUNT(*) INTO demand_count
  FROM trips t
  WHERE t.created_at >= NOW() - (time_window_hours || ' hours')::INTERVAL
    AND (6371 * acos(cos(radians(center_lat)) * cos(radians((t.from_coordinates->>'lat')::DECIMAL)) * 
         cos(radians((t.from_coordinates->>'lng')::DECIMAL) - radians(center_lng)) + 
         sin(radians(center_lat)) * sin(radians((t.from_coordinates->>'lat')::DECIMAL)))) <= radius_km;
  
  -- Calculate area
  area_km2 := PI() * radius_km * radius_km;
  
  -- Return density (trips per km2 per hour)
  RETURN (demand_count::DECIMAL / area_km2) / time_window_hours;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MISSING TRIGGERS
-- ============================================

-- Auto-capture events trigger
CREATE OR REPLACE FUNCTION auto_capture_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Capture trip events
  IF TG_TABLE_NAME = 'trips' THEN
    INSERT INTO smart_route_events (type, source, data, user_id, trip_id)
    VALUES (
      'system_event',
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'trip_created'
        WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 'trip_status_changed'
        ELSE 'trip_updated'
      END,
      row_to_json(NEW),
      COALESCE(NEW.driver_id, NEW.passenger_id),
      NEW.id
    );
  END IF;
  
  -- Capture booking events
  IF TG_TABLE_NAME = 'bookings' THEN
    INSERT INTO smart_route_events (type, source, data, user_id, trip_id)
    VALUES (
      'user_action',
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'booking_created'
        WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 'booking_status_changed'
        ELSE 'booking_updated'
      END,
      row_to_json(NEW),
      NEW.passenger_id,
      NEW.trip_id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER trigger_auto_capture_trip_events
  AFTER INSERT OR UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION auto_capture_events();

CREATE TRIGGER trigger_auto_capture_booking_events
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION auto_capture_events();

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Geospatial indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_trips_from_location_gin ON trips USING GIN (from_coordinates);
CREATE INDEX IF NOT EXISTS idx_trips_to_location_gin ON trips USING GIN (to_coordinates);
CREATE INDEX IF NOT EXISTS idx_live_locations_coordinates_gin ON live_locations USING GIN (coordinates);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_trips_status_date ON trips(status, departure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_time ON messages(sender_id, receiver_id, created_at DESC);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_trips_active ON trips(id) WHERE status IN ('active', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_scooters_available ON scooters(id, location) WHERE status = 'available';

-- ============================================
-- DATA CLEANUP FUNCTIONS
-- ============================================

-- Cleanup old events
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS void AS $$
BEGIN
  -- Delete events older than 90 days
  DELETE FROM smart_route_events WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Delete expired ML features
  DELETE FROM ml_features WHERE expires_at < NOW();
  
  -- Delete old error logs (keep 30 days)
  DELETE FROM error_logs WHERE timestamp < NOW() - INTERVAL '30 days' AND resolved = TRUE;
  
  -- Delete old rate limit records
  DELETE FROM api_rate_limits WHERE window_start < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on new tables
ALTER TABLE smart_route_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their events" ON smart_route_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their AI logs" ON ai_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their preferences" ON user_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their ML features" ON ml_features
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their predictive matches" ON predictive_matches
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default AI configuration
INSERT INTO ai_config (enabled, features, models, thresholds) VALUES (
  TRUE,
  '{
    "smartRoutes": true,
    "dynamicPricing": true,
    "riskAssessment": true,
    "nlpSearch": true,
    "recommendations": true,
    "predictive": true,
    "smartMatching": true,
    "conversationAI": true
  }',
  '{
    "routeOptimization": "gpt-4-turbo",
    "pricingModel": "xgboost-v2",
    "riskModel": "random-forest-v3",
    "nlpModel": "bert-multilingual",
    "recommendationModel": "collaborative-filtering-v2"
  }',
  '{
    "riskScore": 0.7,
    "matchConfidence": 0.6,
    "pricingConfidence": 0.8
  }'
) ON CONFLICT DO NOTHING;