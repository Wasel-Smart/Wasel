# Database Setup Instructions for Wasel Laundry Service

## Overview
These SQL files set up the complete database schema for the Wasel Laundry Service feature in Supabase.

## Files

### 1. `database_migrations.sql` - Main Schema
Creates the database tables, indexes, RLS policies, and triggers.

**Tables Created:**
- `laundry_partners` - Laundry service providers
- `laundry_orders` - Customer laundry orders

**Features:**
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamp management
- ✅ Foreign key constraints
- ✅ Performance indexes
- ✅ Referential integrity

### 2. `seed_laundry_data.sql` - Sample Data
Populates the database with sample laundry partners and creates helper functions.

**Includes:**
- 10 sample laundry partners across Middle East
- Tracking code generation function
- View for available partners
- View for order tracking
- Permission grants

## Setup Instructions

### Step 1: Run Migrations
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Create a new query
4. Copy the entire contents of `database_migrations.sql`
5. Click "Run"
6. Wait for completion (should show "Success")

### Step 2: Run Seed Data
1. Create a new query in SQL Editor
2. Copy the entire contents of `seed_laundry_data.sql`
3. Click "Run"
4. Wait for completion

### Step 3: Verify Setup
```sql
-- Check laundry_partners table
SELECT COUNT(*) as partner_count FROM laundry_partners;
-- Should show: 10

-- Check available partners view
SELECT * FROM available_laundry_partners LIMIT 5;

-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'laundry%';
```

## Database Schema

### laundry_partners
```sql
- id: UUID (primary key)
- name: TEXT (unique)
- location: TEXT
- phone: TEXT
- email: TEXT
- rating: DECIMAL(3,2) default 4.5
- reviews_count: INTEGER
- services_offered: TEXT[]
- pricing_per_kg: DECIMAL(10,2)
- is_available: BOOLEAN
- availability_hours: JSONB
- status: TEXT (active/inactive)
- image_url: TEXT
- response_time_minutes: INTEGER
- created_at, updated_at: TIMESTAMPS
```

### laundry_orders
```sql
- id: UUID (primary key)
- customer_id: UUID (FK -> auth.users)
- captain_id: UUID (FK -> auth.users)
- laundry_partner_id: UUID (FK -> laundry_partners)
- service_type: TEXT ('wasel' or 'raje3')
- pickup_location: TEXT
- delivery_location: TEXT
- load_details: JSONB
- preferred_pickup_time: TIMESTAMP
- actual_pickup_time: TIMESTAMP
- estimated_delivery_time: TIMESTAMP
- actual_delivery_time: TIMESTAMP
- status: TEXT (pending, assigned, picked_up, at_laundry, processing, ready, out_for_delivery, delivered, cancelled)
- tracking_code: TEXT (unique)
- total_price: DECIMAL(10,2)
- payment_status: TEXT (pending, paid, refunded, failed)
- special_instructions: TEXT
- customer_notes: TEXT
- rating_score: INTEGER
- customer_review: TEXT
- created_at, updated_at: TIMESTAMPS
```

## Available Views

### 1. `available_laundry_partners`
Shows only active, available partners sorted by rating.
```sql
SELECT * FROM available_laundry_partners;
```

### 2. `order_tracking_view`
Shows customer's orders with partner details (user-specific via RLS).
```sql
SELECT * FROM order_tracking_view;
```

## Helper Functions

### `generate_tracking_code()`
Generates unique tracking codes for orders.
```sql
SELECT generate_tracking_code();
-- Returns: WAS-20260122143522-a7f2b9
```

## Row Level Security (RLS)

### Laundry Partners
- **Public**: Can view active partners

### Laundry Orders
- **Customers**: Can only view/create/update their own orders
- **Captains**: Can view and update orders assigned to them

## Using the Database in Your App

### Example: Get Available Partners
```typescript
const { data: partners } = await supabase
  .from('available_laundry_partners')
  .select('*')
  .order('rating', { ascending: false });
```

### Example: Create an Order
```typescript
const { data: order, error } = await supabase
  .from('laundry_orders')
  .insert({
    customer_id: user.id,
    service_type: 'wasel',
    pickup_location: 'Dubai Marina',
    delivery_location: null,
    laundry_partner_id: partnerId,
    load_details: {
      weight_kg: 5,
      items: ['Shirts', 'Pants', 'Towels']
    },
    tracking_code: generateTrackingCode(),
    total_price: 45.00
  })
  .select()
  .single();
```

### Example: Track Order Status
```typescript
const { data: orderStatus } = await supabase
  .from('order_tracking_view')
  .select('*')
  .eq('tracking_code', 'WAS-20260122143522-a7f2b9')
  .single();
```

## Troubleshooting

### Table Already Exists Error
- The migrations use `CREATE TABLE IF NOT EXISTS`, so re-running is safe
- If you need to reset: Delete tables manually first

### RLS Permission Denied
- Ensure user is authenticated
- Check that RLS policies are created correctly
- Verify user ID matches the customer_id

### Foreign Key Constraint Violation
- Ensure customer_id exists in auth.users
- Ensure laundry_partner_id exists in laundry_partners

## Best Practices

1. **Always run migrations first** before seed data
2. **Test views** after setup to verify data
3. **Keep backups** of production data
4. **Monitor RLS policies** for security
5. **Use tracking codes** for customer references

## Support

For issues:
1. Check Supabase logs for SQL errors
2. Verify all migrations ran successfully
3. Test individual queries in SQL editor
4. Check RLS policies are enabled

---

**Last Updated:** January 22, 2026  
**Status:** ✅ Production Ready
