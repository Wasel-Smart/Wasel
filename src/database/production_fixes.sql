-- ============================================
-- MISSING DATABASE FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update wallet balance safely
CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_user_id UUID,
  p_currency TEXT,
  p_amount DECIMAL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_wallets (user_id, aed, sar, egp, usd, eur, gbp, credits)
  VALUES (p_user_id, 
    CASE WHEN p_currency = 'aed' THEN p_amount ELSE 0 END,
    CASE WHEN p_currency = 'sar' THEN p_amount ELSE 0 END,
    CASE WHEN p_currency = 'egp' THEN p_amount ELSE 0 END,
    CASE WHEN p_currency = 'usd' THEN p_amount ELSE 0 END,
    CASE WHEN p_currency = 'eur' THEN p_amount ELSE 0 END,
    CASE WHEN p_currency = 'gbp' THEN p_amount ELSE 0 END,
    CASE WHEN p_currency = 'credits' THEN p_amount ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    aed = user_wallets.aed + CASE WHEN p_currency = 'aed' THEN p_amount ELSE 0 END,
    sar = user_wallets.sar + CASE WHEN p_currency = 'sar' THEN p_amount ELSE 0 END,
    egp = user_wallets.egp + CASE WHEN p_currency = 'egp' THEN p_amount ELSE 0 END,
    usd = user_wallets.usd + CASE WHEN p_currency = 'usd' THEN p_amount ELSE 0 END,
    eur = user_wallets.eur + CASE WHEN p_currency = 'eur' THEN p_amount ELSE 0 END,
    gbp = user_wallets.gbp + CASE WHEN p_currency = 'gbp' THEN p_amount ELSE 0 END,
    credits = user_wallets.credits + CASE WHEN p_currency = 'credits' THEN p_amount ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate trip booking
CREATE OR REPLACE FUNCTION validate_trip_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if trip has available seats
  IF (SELECT available_seats FROM trips WHERE id = NEW.trip_id) < NEW.seats_requested THEN
    RAISE EXCEPTION 'Insufficient seats available';
  END IF;
  
  -- Check if user is not the driver
  IF (SELECT driver_id FROM trips WHERE id = NEW.trip_id) = NEW.passenger_id THEN
    RAISE EXCEPTION 'Driver cannot book their own trip';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_booking
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_trip_booking();

-- Function to update trip seats on booking
CREATE OR REPLACE FUNCTION update_trip_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE trips 
    SET available_seats = available_seats - NEW.seats_requested
    WHERE id = NEW.trip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE trips 
    SET available_seats = available_seats + OLD.seats_requested
    WHERE id = OLD.trip_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seats
  AFTER INSERT OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_seats();

-- Performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trips_performance ON trips(status, departure_date, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_performance ON bookings(passenger_id, status, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_performance ON messages(trip_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_performance ON transactions(user_id, type, status, timestamp);

-- Constraints
ALTER TABLE trips ADD CONSTRAINT check_positive_fare CHECK (fare > 0);
ALTER TABLE trips ADD CONSTRAINT check_positive_seats CHECK (total_seats > 0 AND available_seats >= 0);
ALTER TABLE bookings ADD CONSTRAINT check_positive_booking_seats CHECK (seats_requested > 0);