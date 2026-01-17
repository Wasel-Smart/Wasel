-- ============================================================================
-- WASEL DATABASE SCHEMA - COMPLETE PRODUCTION SETUP
-- ============================================================================
-- Run this in your Supabase SQL Editor
-- This creates all missing tables for specialized services
-- ============================================================================

-- ============================================================================
-- 1. SCOOTER TABLES
-- ============================================================================

-- Scooters inventory table
CREATE TABLE IF NOT EXISTS scooters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  battery INTEGER NOT NULL CHECK (battery >= 0 AND battery <= 100),
  location GEOGRAPHY(POINT) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'in-use', 'low-battery', 'maintenance')),
  price_per_min DECIMAL(10,2) NOT NULL DEFAULT 1.0,
  range_km INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scooter rentals table
CREATE TABLE IF NOT EXISTS scooter_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scooter_id UUID REFERENCES scooters(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  start_location GEOGRAPHY(POINT),
  end_location GEOGRAPHY(POINT),
  duration_minutes INTEGER,
  total_cost DECIMAL(10,2),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for scooters
CREATE INDEX IF NOT EXISTS idx_scooters_location ON scooters USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_scooters_status ON scooters(status);
CREATE INDEX IF NOT EXISTS idx_scooter_rentals_user ON scooter_rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_scooter_rentals_scooter ON scooter_rentals(scooter_id);
CREATE INDEX IF NOT EXISTS idx_scooter_rentals_status ON scooter_rentals(status);

-- ============================================================================
-- 2. PACKAGE DELIVERY TABLES
-- ============================================================================

-- Package deliveries table
CREATE TABLE IF NOT EXISTS package_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  captain_id UUID REFERENCES profiles(id),
  package_size TEXT NOT NULL CHECK (package_size IN ('small', 'medium', 'large')),
  weight_kg DECIMAL(10,2),
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  from_coordinates GEOGRAPHY(POINT),
  to_coordinates GEOGRAPHY(POINT),
  pickup_date DATE,
  delivery_date DATE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled')),
  total_price DECIMAL(10,2),
  tracking_code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package tracking table
CREATE TABLE IF NOT EXISTS package_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES package_deliveries(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL,
  location GEOGRAPHY(POINT),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for package deliveries
CREATE INDEX IF NOT EXISTS idx_package_deliveries_sender ON package_deliveries(sender_id);
CREATE INDEX IF NOT EXISTS idx_package_deliveries_captain ON package_deliveries(captain_id);
CREATE INDEX IF NOT EXISTS idx_package_deliveries_tracking ON package_deliveries(tracking_code);
CREATE INDEX IF NOT EXISTS idx_package_deliveries_status ON package_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_package_tracking_delivery ON package_tracking(delivery_id);

-- ============================================================================
-- 3. SCHOOL TRANSPORT TABLES
-- ============================================================================

-- School routes table
CREATE TABLE IF NOT EXISTS school_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  pickup_location TEXT NOT NULL,
  school_location TEXT NOT NULL,
  pickup_time TIME NOT NULL,
  return_time TIME,
  active_days TEXT[] NOT NULL,
  trip_type TEXT NOT NULL CHECK (trip_type IN ('one-way', 'round-trip')),
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')),
  monthly_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School students table
CREATE TABLE IF NOT EXISTS school_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES school_routes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  grade TEXT NOT NULL,
  guardians JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School trips table (individual trip instances)
CREATE TABLE IF NOT EXISTS school_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES school_routes(id) ON DELETE CASCADE NOT NULL,
  trip_date DATE NOT NULL,
  assigned_driver_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  students_checked_in UUID[] DEFAULT '{}',
  students_checked_out UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for school transport
CREATE INDEX IF NOT EXISTS idx_school_routes_user ON school_routes(created_by);
CREATE INDEX IF NOT EXISTS idx_school_routes_status ON school_routes(status);
CREATE INDEX IF NOT EXISTS idx_school_students_route ON school_students(route_id);
CREATE INDEX IF NOT EXISTS idx_school_trips_route ON school_trips(route_id);
CREATE INDEX IF NOT EXISTS idx_school_trips_date ON school_trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_school_trips_driver ON school_trips(assigned_driver_id);

-- ============================================================================
-- 4. SEED DATA - SAMPLE SCOOTERS
-- ============================================================================

-- Insert sample scooters in Dubai area
INSERT INTO scooters (code, battery, location, status, price_per_min, range_km)
VALUES 
  ('WAS-001', 85, ST_GeogFromText('POINT(55.2708 25.2048)'), 'available', 1.0, 25),
  ('WAS-002', 42, ST_GeogFromText('POINT(55.2715 25.2040)'), 'available', 1.0, 12),
  ('WAS-003', 15, ST_GeogFromText('POINT(55.2720 25.2055)'), 'low-battery', 1.0, 4),
  ('WAS-004', 92, ST_GeogFromText('POINT(55.2695 25.2035)'), 'available', 1.0, 28),
  ('WAS-005', 78, ST_GeogFromText('POINT(55.2750 25.2060)'), 'available', 1.0, 22),
  ('WAS-006', 65, ST_GeogFromText('POINT(55.2680 25.2025)'), 'available', 1.0, 18),
  ('WAS-007', 95, ST_GeogFromText('POINT(55.2730 25.2070)'), 'available', 1.0, 30),
  ('WAS-008', 88, ST_GeogFromText('POINT(55.2690 25.2045)'), 'available', 1.0, 26)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE scooters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scooter_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_trips ENABLE ROW LEVEL SECURITY;

-- Scooters: Public read, authenticated users can rent
CREATE POLICY "Scooters are viewable by everyone"
  ON scooters FOR SELECT
  USING (true);

CREATE POLICY "Scooter rentals are viewable by owner"
  ON scooter_rentals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rentals"
  ON scooter_rentals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rentals"
  ON scooter_rentals FOR UPDATE
  USING (auth.uid() = user_id);

-- Package deliveries: Sender and captain can view
CREATE POLICY "Package deliveries viewable by sender and captain"
  ON package_deliveries FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = captain_id);

CREATE POLICY "Users can create package deliveries"
  ON package_deliveries FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Captains can update assigned deliveries"
  ON package_deliveries FOR UPDATE
  USING (auth.uid() = captain_id OR auth.uid() = sender_id);

-- Package tracking: Viewable by sender and captain
CREATE POLICY "Package tracking viewable by delivery participants"
  ON package_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM package_deliveries
      WHERE package_deliveries.id = package_tracking.delivery_id
      AND (package_deliveries.sender_id = auth.uid() OR package_deliveries.captain_id = auth.uid())
    )
  );

-- School routes: Viewable by creator
CREATE POLICY "School routes viewable by creator"
  ON school_routes FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create school routes"
  ON school_routes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their routes"
  ON school_routes FOR UPDATE
  USING (auth.uid() = created_by);

-- School students: Viewable by route creator
CREATE POLICY "School students viewable by route creator"
  ON school_students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM school_routes
      WHERE school_routes.id = school_students.route_id
      AND school_routes.created_by = auth.uid()
    )
  );

-- School trips: Viewable by route creator and assigned driver
CREATE POLICY "School trips viewable by route creator and driver"
  ON school_trips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM school_routes
      WHERE school_routes.id = school_trips.route_id
      AND school_routes.created_by = auth.uid()
    )
    OR auth.uid() = assigned_driver_id
  );

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to get nearby scooters
CREATE OR REPLACE FUNCTION get_nearby_scooters(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 2
)
RETURNS TABLE (
  id UUID,
  code TEXT,
  battery INTEGER,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  price_per_min DECIMAL,
  range_km INTEGER,
  status TEXT,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.code,
    s.battery,
    ST_Y(s.location::geometry) as lat,
    ST_X(s.location::geometry) as lng,
    s.price_per_min,
    s.range_km,
    s.status,
    ST_Distance(
      s.location,
      ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')')
    ) / 1000 as distance_km
  FROM scooters s
  WHERE 
    s.status IN ('available')
    AND ST_DWithin(
      s.location,
      ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Update scooter status when rental starts/ends
CREATE OR REPLACE FUNCTION update_scooter_status()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- When rental becomes active, mark scooter as in-use
    IF NEW.status = 'active' THEN
      UPDATE scooters 
      SET status = 'in-use', updated_at = NOW()
      WHERE id = NEW.scooter_id;
    END IF;
    
    -- When rental completes, mark scooter as available
    IF NEW.status = 'completed' THEN
      UPDATE scooters 
      SET 
        status = 'available',
        location = NEW.end_location,
        updated_at = NOW()
      WHERE id = NEW.scooter_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scooter_rental_status_trigger
  AFTER INSERT OR UPDATE ON scooter_rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_scooter_status();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scooters_updated_at
  BEFORE UPDATE ON scooters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_deliveries_updated_at
  BEFORE UPDATE ON package_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_routes_updated_at
  BEFORE UPDATE ON school_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify everything was created successfully:

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'scooters', 
  'scooter_rentals', 
  'package_deliveries', 
  'package_tracking', 
  'school_routes', 
  'school_students', 
  'school_trips'
)
ORDER BY table_name;

-- Check scooter count
SELECT COUNT(*) as scooter_count FROM scooters;

-- Check sample scooter data
SELECT code, battery, status, price_per_min 
FROM scooters 
ORDER BY code;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If you see this message after running, all tables were created successfully!
-- Next step: Update your frontend to use the new services
-- ============================================================================

SELECT 
  '✅ DATABASE SCHEMA APPLIED SUCCESSFULLY!' as status,
  COUNT(*) as scooters_available
FROM scooters 
WHERE status = 'available';
