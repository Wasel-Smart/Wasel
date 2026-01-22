-- Laundry Service Database Migration
-- Execute these SQL commands in your Supabase SQL editor

-- Create laundry_partners table
CREATE TABLE IF NOT EXISTS laundry_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating DECIMAL(3,2) DEFAULT 4.5,
  services_offered TEXT[] DEFAULT '{}',
  pricing_per_kg DECIMAL(10,2) DEFAULT 5.00,
  is_available BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create laundry_orders table
CREATE TABLE IF NOT EXISTS laundry_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id),
  captain_id UUID REFERENCES auth.users(id),
  laundry_partner_id UUID REFERENCES laundry_partners(id),
  service_type TEXT CHECK (service_type IN ('wasel', 'raje3')),
  pickup_location TEXT NOT NULL,
  delivery_location TEXT,
  load_details JSONB,
  preferred_pickup_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'at_laundry', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
  tracking_code TEXT UNIQUE,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_laundry_orders_customer_id ON laundry_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_captain_id ON laundry_orders(captain_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_status ON laundry_orders(status);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_tracking_code ON laundry_orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_laundry_partners_status ON laundry_partners(status);
CREATE INDEX IF NOT EXISTS idx_laundry_partners_available ON laundry_partners(is_available);

-- Enable Row Level Security
ALTER TABLE laundry_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for laundry_partners (public read for available partners)
CREATE POLICY "Laundry partners are viewable by everyone" ON laundry_partners
  FOR SELECT USING (status = 'active' AND is_available = true);

-- RLS Policies for laundry_orders
CREATE POLICY "Users can view their own laundry orders" ON laundry_orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own laundry orders" ON laundry_orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own laundry orders" ON laundry_orders
  FOR UPDATE USING (auth.uid() = customer_id);

-- Allow captains to view and update assigned orders
CREATE POLICY "Captains can view assigned laundry orders" ON laundry_orders
  FOR SELECT USING (auth.uid() = captain_id);

CREATE POLICY "Captains can update assigned laundry orders" ON laundry_orders
  FOR UPDATE USING (auth.uid() = captain_id);