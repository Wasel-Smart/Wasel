-- Laundry Service Database Migration
-- Execute these SQL commands in your Supabase SQL editor

-- Create laundry_partners table
CREATE TABLE IF NOT EXISTS laundry_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  rating DECIMAL(3,2) DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 0,
  services_offered TEXT[] DEFAULT '{}',
  pricing_per_kg DECIMAL(10,2) DEFAULT 5.00,
  is_available BOOLEAN DEFAULT true,
  availability_hours JSONB DEFAULT '{"monday": "08:00-20:00", "tuesday": "08:00-20:00", "wednesday": "08:00-20:00", "thursday": "08:00-20:00", "friday": "10:00-18:00", "saturday": "09:00-19:00", "sunday": "10:00-18:00"}',
  status TEXT DEFAULT 'active',
  image_url TEXT,
  response_time_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create laundry_orders table
CREATE TABLE IF NOT EXISTS laundry_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  captain_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  laundry_partner_id UUID REFERENCES laundry_partners(id) ON DELETE SET NULL,
  service_type TEXT CHECK (service_type IN ('wasel', 'raje3')) NOT NULL,
  pickup_location TEXT NOT NULL,
  delivery_location TEXT,
  load_details JSONB DEFAULT '{}',
  preferred_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'at_laundry', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
  tracking_code TEXT UNIQUE,
  total_price DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  special_instructions TEXT,
  customer_notes TEXT,
  rating_score INTEGER,
  customer_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_laundry_orders_customer_id ON laundry_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_captain_id ON laundry_orders(captain_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_partner_id ON laundry_orders(laundry_partner_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_status ON laundry_orders(status);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_payment_status ON laundry_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_tracking_code ON laundry_orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_created_at ON laundry_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_laundry_partners_status ON laundry_partners(status);
CREATE INDEX IF NOT EXISTS idx_laundry_partners_available ON laundry_partners(is_available);
CREATE INDEX IF NOT EXISTS idx_laundry_partners_rating ON laundry_partners(rating);

-- Enable Row Level Security
ALTER TABLE laundry_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for laundry_partners (public read for available partners)
DROP POLICY IF EXISTS "Laundry partners are viewable by everyone" ON laundry_partners;
CREATE POLICY "Laundry partners are viewable by everyone" ON laundry_partners
  FOR SELECT USING (status = 'active' AND is_available = true);

-- RLS Policies for laundry_orders
DROP POLICY IF EXISTS "Users can view their own laundry orders" ON laundry_orders;
CREATE POLICY "Users can view their own laundry orders" ON laundry_orders
  FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can create their own laundry orders" ON laundry_orders;
CREATE POLICY "Users can create their own laundry orders" ON laundry_orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can update their own laundry orders" ON laundry_orders;
CREATE POLICY "Users can update their own laundry orders" ON laundry_orders
  FOR UPDATE USING (auth.uid() = customer_id);

-- Allow captains to view and update assigned orders
DROP POLICY IF EXISTS "Captains can view assigned laundry orders" ON laundry_orders;
CREATE POLICY "Captains can view assigned laundry orders" ON laundry_orders
  FOR SELECT USING (auth.uid() = captain_id);

DROP POLICY IF EXISTS "Captains can update assigned laundry orders" ON laundry_orders;
CREATE POLICY "Captains can update assigned laundry orders" ON laundry_orders
  FOR UPDATE USING (auth.uid() = captain_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at
DROP TRIGGER IF EXISTS update_laundry_partners_updated_at ON laundry_partners;
CREATE TRIGGER update_laundry_partners_updated_at BEFORE UPDATE ON laundry_partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_laundry_orders_updated_at ON laundry_orders;
CREATE TRIGGER update_laundry_orders_updated_at BEFORE UPDATE ON laundry_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();