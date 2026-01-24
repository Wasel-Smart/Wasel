# Fix Supabase Security & Performance Issues

## Overview

This guide addresses the **128 issues** shown in your Supabase dashboard:

- **68 Security Issues**: Row Level Security (RLS) policy issues on tables
- **68 Performance Issues**: Slow queries related to PostGIS

## Quick Fix

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run the Migration

Copy and paste the contents of this file into the SQL Editor:

```text
Wasel/supabase/migrations/fix_rls_and_performance.sql
```

Or run this command to copy the file contents:

```bash
cat Wasel/supabase/migrations/fix_rls_and_performance.sql
```

### Step 3: Execute

Click **Run** or press `Ctrl+Enter` / `Cmd+Enter`

## What Gets Fixed

### 1. `spatial_ref_sys` Table (PostGIS)

- Revokes unnecessary privileges from `anon` and `authenticated` roles
- Grants only SELECT access (required for PostGIS functions)

### 2. `scooter_rentals` Table

- Adds complete RLS policies for SELECT, INSERT, UPDATE, DELETE
- Users can only access their own rentals
- Service role has full access for admin operations

### 3. `package_deliveries` Table

- Adds complete RLS policies
- Senders and captains can view their deliveries
- Only senders can create deliveries
- Both senders and captains can update

### 4. `memberships` Table

- Creates the table if it doesn't exist
- Adds complete RLS policies
- Users can only manage their own memberships

### 5. `package_tracking` Table

- Adds RLS policies for tracking updates
- Only delivery participants can view tracking
- Only captains can add tracking updates

### 6. Performance Optimizations

- Creates optimized indexes for common queries
- Adds GIST indexes for spatial queries
- Runs ANALYZE to update query planner statistics

## Verification

After running the migration, you should see:

```text
✅ RLS AND PERFORMANCE FIXES APPLIED SUCCESSFULLY!
```

The dashboard should show significantly fewer issues (ideally 0).

## Troubleshooting

### Error: "policy already exists"

The migration uses `DROP POLICY IF EXISTS` to handle this, but if you still get errors:

```sql
-- Drop the specific policy manually
DROP POLICY "policy_name" ON table_name;
```

### Error: "table does not exist"

Some tables may not have been created yet. Run the complete schema first:

```text
Wasel/supabase/complete_schema_production.sql
```

### Error: "permission denied"

Make sure you're running the SQL as the database owner or with sufficient privileges.

## Additional Notes

### Why These Issues Appear

1. **RLS Enabled Without Policies**: When you enable RLS on a table but don't create policies, no one can access the data (except service_role).

2. **PostGIS spatial_ref_sys**: This is a system table created by PostGIS extension. It contains coordinate system definitions and should have restricted access.

3. **Missing Indexes**: Without proper indexes, queries on large tables become slow.

### Best Practices

1. Always create RLS policies immediately after enabling RLS
2. Use service_role for admin operations
3. Create indexes for frequently queried columns
4. Run ANALYZE after bulk data changes

## Files Modified

- `Wasel/supabase/migrations/fix_rls_and_performance.sql` - Main fix migration
- `Wasel/FIX_SUPABASE_ISSUES.md` - This documentation

## Support

If issues persist after running the migration, check:

1. Supabase Dashboard > Database > Policies
2. Supabase Dashboard > Database > Tables (verify RLS is enabled)
3. Supabase Dashboard > Reports > Performance
