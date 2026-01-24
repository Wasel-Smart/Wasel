-- ============================================================================
-- WASEL DATABASE FIX - RLS POLICIES AND PERFORMANCE OPTIMIZATION
-- ============================================================================
-- Run this in your Supabase SQL Editor to fix security and performance issues
-- ============================================================================

-- ============================================================================
-- 1. FIX SPATIAL_REF_SYS RLS ISSUE (PostGIS Extension Table)
-- ============================================================================
-- The spatial_ref_sys table is part of PostGIS and needs special handling
-- Option 1: Revoke direct access and use service_role for spatial queries
-- Option 2: Keep table accessible but secure

-- Revoke privileges from anon and authenticated roles on spatial_ref_sys
REVOKE ALL ON public.spatial_ref_sys FROM anon;
REVOKE ALL ON public.spatial_ref_sys FROM authenticated;

-- Grant SELECT only (needed for PostGIS functions to work)
GRANT SELECT ON public.spatial_ref_sys TO anon;
GRANT SELECT ON public.spatial_ref_sys TO authenticated;

-- ============================================================================
-- 2. FIX SCOOTER_RENTALS RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Scooter rentals are viewable by owner" ON scooter_rentals;
DROP POLICY IF EXISTS "Users can create their own rentals" ON scooter_rentals;
DROP POLICY IF EXISTS "Users can update their own rentals" ON scooter_rentals;
DROP POLICY IF EXISTS "Service role full access to scooter_rentals" ON scooter_rentals;

-- Ensure RLS is enabled
ALTER TABLE scooter_rentals ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for scooter_rentals
CREATE POLICY "Scooter rentals are viewable by owner"
  ON scooter_rentals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rentals"
  ON scooter_rentals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rentals"
  ON scooter_rentals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rentals"
  ON scooter_rentals FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass for admin operations
CREATE POLICY "Service role full access to scooter_rentals"
  ON scooter_rentals FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 3. FIX PACKAGE_DELIVERIES RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Package deliveries viewable by sender and captain" ON package_deliveries;
DROP POLICY IF EXISTS "Users can create package deliveries" ON package_deliveries;
DROP POLICY IF EXISTS "Captains can update assigned deliveries" ON package_deliveries;
DROP POLICY IF EXISTS "Service role full access to package_deliveries" ON package_deliveries;

-- Ensure RLS is enabled
ALTER TABLE package_deliveries ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for package_deliveries
CREATE POLICY "Package deliveries viewable by sender and captain"
  ON package_deliveries FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = captain_id);

CREATE POLICY "Users can create package deliveries"
  ON package_deliveries FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders and captains can update deliveries"
  ON package_deliveries FOR UPDATE
  USING (auth.uid() = captain_id OR auth.uid() = sender_id);

CREATE POLICY "Senders can delete their deliveries"
  ON package_deliveries FOR DELETE
  USING (auth.uid() = sender_id);

-- Service role bypass for admin operations
CREATE POLICY "Service role full access to package_deliveries"
  ON package_deliveries FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 4. CREATE AND FIX MEMBERSHIPS TABLE (if not exists)
-- ============================================================================

-- Create memberships table if it doesn't exist
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'business', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT TRUE,
  price_monthly DECIMAL(10,2),
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  features JSONB DEFAULT '{}',
  payment_method TEXT,
  last_payment_date TIMESTAMPTZ,
  next_billing_date DATE,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for memberships
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_plan ON memberships(plan_type);
CREATE INDEX IF NOT EXISTS idx_memberships_end_date ON memberships(end_date);

-- Enable RLS on memberships
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can create their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON memberships;
DROP POLICY IF EXISTS "Service role full access to memberships" ON memberships;

-- Create comprehensive policies for memberships
CREATE POLICY "Users can view their own memberships"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memberships"
  ON memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
  ON memberships FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships"
  ON memberships FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass for admin operations
CREATE POLICY "Service role full access to memberships"
  ON memberships FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 5. FIX SCOOTERS TABLE RLS (Public read access)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Scooters are viewable by everyone" ON scooters;
DROP POLICY IF EXISTS "Service role full access to scooters" ON scooters;

-- Ensure RLS is enabled
ALTER TABLE scooters ENABLE ROW LEVEL SECURITY;

-- Create policies for scooters (public read, admin write)
CREATE POLICY "Scooters are viewable by everyone"
  ON scooters FOR SELECT
  USING (true);

-- Service role bypass for admin operations
CREATE POLICY "Service role full access to scooters"
  ON scooters FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 6. FIX PACKAGE_TRACKING RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Package tracking viewable by delivery participants" ON package_tracking;
DROP POLICY IF EXISTS "Service role full access to package_tracking" ON package_tracking;

-- Ensure RLS is enabled
ALTER TABLE package_tracking ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for package_tracking
CREATE POLICY "Package tracking viewable by delivery participants"
  ON package_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM package_deliveries
      WHERE package_deliveries.id = package_tracking.delivery_id
      AND (package_deliveries.sender_id = auth.uid() OR package_deliveries.captain_id = auth.uid())
    )
  );

CREATE POLICY "Captains can insert tracking updates"
  ON package_tracking FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM package_deliveries
      WHERE package_deliveries.id = package_tracking.delivery_id
      AND package_deliveries.captain_id = auth.uid()
    )
  );

-- Service role bypass for admin operations
CREATE POLICY "Service role full access to package_tracking"
  ON package_tracking FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 7. PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Create optimized indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scooter_rentals_created_at ON scooter_rentals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_package_deliveries_created_at ON package_deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memberships_created_at ON memberships(created_at DESC);

-- Optimize spatial queries by ensuring proper indexes exist
CREATE INDEX IF NOT EXISTS idx_scooters_location_gist ON scooters USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_package_deliveries_from_coords ON package_deliveries USING GIST(from_coordinates);
CREATE INDEX IF NOT EXISTS idx_package_deliveries_to_coords ON package_deliveries USING GIST(to_coordinates);

-- Analyze tables to update statistics for query planner
ANALYZE scooters;
ANALYZE scooter_rentals;
ANALYZE package_deliveries;
ANALYZE package_tracking;
ANALYZE memberships;

-- ============================================================================
-- 8. CREATE UPDATED_AT TRIGGER FOR MEMBERSHIPS
-- ============================================================================

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for memberships
DROP TRIGGER IF EXISTS update_memberships_updated_at ON memberships;
CREATE TRIGGER update_memberships_updated_at 
  BEFORE UPDATE ON memberships
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('scooters', 'scooter_rentals', 'package_deliveries', 'package_tracking', 'memberships')
ORDER BY tablename;

-- Check policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('scooters', 'scooter_rentals', 'package_deliveries', 'package_tracking', 'memberships')
ORDER BY tablename, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 
  '✅ RLS AND PERFORMANCE FIXES APPLIED SUCCESSFULLY!' as status,
  NOW() as applied_at;
