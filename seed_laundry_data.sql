-- Laundry Service Seed Data
-- Execute these SQL commands in your Supabase SQL editor after running the migrations

-- Insert sample laundry partners
INSERT INTO laundry_partners (name, location, rating, services_offered, pricing_per_kg, is_available, status) VALUES
('Dubai Cleaners', 'Dubai Mall Area, Dubai', 4.8, ARRAY['Wash & Fold', 'Dry Cleaning', 'Ironing', 'Stain Removal'], 6.00, true, 'active'),
('Abu Dhabi Laundry Hub', 'Corniche Road, Abu Dhabi', 4.6, ARRAY['Wash & Fold', 'Dry Cleaning', 'Express Service'], 5.50, true, 'active'),
('Riyadh Wash Center', 'Olaya District, Riyadh', 4.7, ARRAY['Wash & Fold', 'Ironing', 'Same Day Service'], 4.50, true, 'active'),
('Jeddah Clean Masters', 'Red Sea Mall Area, Jeddah', 4.5, ARRAY['Wash & Fold', 'Dry Cleaning', 'Pickup & Delivery'], 5.00, true, 'active'),
('Sharjah Laundry Plus', 'City Center, Sharjah', 4.4, ARRAY['Wash & Fold', 'Ironing', 'Eco-Friendly'], 4.80, true, 'active'),
('Kuwait Clean Express', 'Salmiya Area, Kuwait City', 4.3, ARRAY['Wash & Fold', 'Express Service', '24/7 Pickup'], 4.20, true, 'active'),
('Doha Laundry Services', 'West Bay Area, Doha', 4.6, ARRAY['Wash & Fold', 'Dry Cleaning', 'Luxury Care'], 5.20, true, 'active'),
('Manama Wash Point', 'Seef District, Manama', 4.2, ARRAY['Wash & Fold', 'Ironing', 'Mobile App'], 4.00, true, 'active');

-- Insert sample laundry orders (optional - for testing)
-- These would normally be created through the app
/*
INSERT INTO laundry_orders (
  customer_id,
  service_type,
  pickup_location,
  delivery_location,
  laundry_partner_id,
  load_details,
  preferred_pickup_time,
  status,
  tracking_code,
  total_price
) VALUES
(
  'your-user-id-here', -- Replace with actual user ID
  'wasel',
  'Dubai Marina, Dubai',
  NULL,
  (SELECT id FROM laundry_partners WHERE name = 'Dubai Cleaners' LIMIT 1),
  '{"weight_kg": 5, "items": ["Shirts", "Pants", "Towels"], "special_instructions": "Handle with care"}'::jsonb,
  NOW() + INTERVAL '2 hours',
  'pending',
  'WAS123456789',
  45.00
);
*/