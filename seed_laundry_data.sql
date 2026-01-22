-- Laundry Service Seed Data
-- Execute these SQL commands in your Supabase SQL editor after running the migrations

-- Insert sample laundry partners with complete data
INSERT INTO laundry_partners (name, location, phone, email, rating, reviews_count, services_offered, pricing_per_kg, is_available, status, response_time_minutes) VALUES
('Dubai Cleaners', 'Dubai Mall Area, Dubai', '+971-4-3322100', 'info@dubaycleaners.ae', 4.8, 342, ARRAY['Wash & Fold', 'Dry Cleaning', 'Ironing', 'Stain Removal', 'Express Service'], 6.00, true, 'active', 25),
('Abu Dhabi Laundry Hub', 'Corniche Road, Abu Dhabi', '+971-2-6225500', 'contact@abudhabilaundry.ae', 4.6, 298, ARRAY['Wash & Fold', 'Dry Cleaning', 'Express Service', 'Eco-Friendly'], 5.50, true, 'active', 30),
('Riyadh Wash Center', 'Olaya District, Riyadh', '+966-11-4620033', 'service@riyadhwash.sa', 4.7, 276, ARRAY['Wash & Fold', 'Ironing', 'Same Day Service', 'Pickup & Delivery'], 4.50, true, 'active', 20),
('Jeddah Clean Masters', 'Red Sea Mall Area, Jeddah', '+966-12-2114477', 'info@jeddahclean.sa', 4.5, 214, ARRAY['Wash & Fold', 'Dry Cleaning', 'Pickup & Delivery', 'Luxury Care'], 5.00, true, 'active', 35),
('Sharjah Laundry Plus', 'City Center, Sharjah', '+971-6-5632211', 'hello@sharjahlaundy.ae', 4.4, 189, ARRAY['Wash & Fold', 'Ironing', 'Eco-Friendly', 'Steam Cleaning'], 4.80, true, 'active', 28),
('Kuwait Clean Express', 'Salmiya Area, Kuwait City', '+965-2-5731234', 'service@kuwaitclean.kw', 4.3, 167, ARRAY['Wash & Fold', 'Express Service', '24/7 Pickup', 'Premium Care'], 4.20, true, 'active', 40),
('Doha Laundry Services', 'West Bay Area, Doha', '+974-4-4123456', 'contact@dohalaundry.qa', 4.6, 304, ARRAY['Wash & Fold', 'Dry Cleaning', 'Luxury Care', 'Bridal Service'], 5.20, true, 'active', 22),
('Manama Wash Point', 'Seef District, Manama', '+973-1-7774433', 'info@manamawash.bh', 4.2, 142, ARRAY['Wash & Fold', 'Ironing', 'Mobile App', 'Delivery Service'], 4.00, true, 'active', 32),
('Muscat Premium Laundry', 'Mutrah Area, Muscat', '+968-2-4566789', 'service@muscatlaundry.om', 4.7, 287, ARRAY['Wash & Fold', 'Dry Cleaning', 'Express Service', 'Corporate Packages'], 5.30, true, 'active', 26),
('Beirut Laundry Elite', 'Hamra District, Beirut', '+961-1-7432100', 'info@beirutlaundry.lb', 4.4, 195, ARRAY['Wash & Fold', 'Dry Cleaning', 'Tailoring Service', 'Eco-Friendly'], 5.80, true, 'active', 38);

-- Insert sample tracking codes helper
-- This creates a function to generate unique tracking codes
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'WAS-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a view for available partners (to simplify queries)
DROP VIEW IF EXISTS available_laundry_partners CASCADE;
CREATE VIEW available_laundry_partners AS
SELECT 
  id,
  name,
  location,
  rating,
  reviews_count,
  services_offered,
  pricing_per_kg,
  response_time_minutes
FROM laundry_partners
WHERE status = 'active' AND is_available = true
ORDER BY rating DESC, reviews_count DESC;

-- Optional: Create a view for order tracking
DROP VIEW IF EXISTS order_tracking_view CASCADE;
CREATE VIEW order_tracking_view AS
SELECT 
  lo.id,
  lo.tracking_code,
  lo.status,
  lo.pickup_location,
  lo.delivery_location,
  lp.name as partner_name,
  lp.phone as partner_phone,
  lo.service_type,
  lo.total_price,
  lo.preferred_pickup_time,
  lo.actual_pickup_time,
  lo.estimated_delivery_time,
  lo.actual_delivery_time,
  lo.created_at,
  lo.updated_at
FROM laundry_orders lo
LEFT JOIN laundry_partners lp ON lo.laundry_partner_id = lp.id
WHERE lo.customer_id = auth.uid();

-- Grant permissions (if using Postgres)
GRANT EXECUTE ON FUNCTION generate_tracking_code() TO authenticated;
GRANT SELECT ON available_laundry_partners TO authenticated;
GRANT SELECT ON order_tracking_view TO authenticated;