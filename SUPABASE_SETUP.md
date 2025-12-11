# Supabase Setup Guide for Paper Trading

This guide covers setting up Supabase for the paper trading competition, using your **existing users table** and adding new tables for positions and orders.

## Quick Setup (For Existing Users Table)

**Option 1: Simple Setup (No Foreign Keys)** - Recommended if you're getting foreign key errors

Run this simpler version that doesn't require foreign keys:

```sql
-- Add columns to existing users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "Percent Gain" NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "Amount Gained" NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "Total Value" NUMERIC DEFAULT 10000;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "Category" TEXT DEFAULT 'Student';
ALTER TABLE public.users ALTER COLUMN "Name" DROP NOT NULL;

-- Create positions table (uses username instead of user_id)
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  ticker TEXT NOT NULL,
  name TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_cost NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  icon_bg TEXT DEFAULT 'bg-gray-600',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username, ticker)
);

-- Create orders table (uses username instead of user_id)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  ticker TEXT NOT NULL,
  name TEXT,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  total_value NUMERIC NOT NULL,
  order_type TEXT DEFAULT 'stock' CHECK (order_type IN ('stock', 'option')),
  option_details JSONB,
  status TEXT DEFAULT 'filled' CHECK (status IN ('pending', 'filled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_positions_username ON public.positions(username);
CREATE INDEX IF NOT EXISTS idx_orders_username ON public.orders(username);

-- RLS Policies
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "positions_all" ON public.positions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "orders_all" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);
```

---

**Option 2: Full Setup (With Foreign Keys)** - Use this if you want referential integrity

Run all the SQL below in your Supabase SQL Editor:

```sql
-- ==========================================
-- 1. ADD COLUMNS TO EXISTING USERS TABLE
-- ==========================================
-- Add auth columns if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- Add paper trading columns if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "Percent Gain" NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "Amount Gained" NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "Total Value" NUMERIC DEFAULT 10000;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "Category" TEXT DEFAULT 'Student';

-- Make Name column nullable if it exists (to avoid NOT NULL errors)
ALTER TABLE public.users ALTER COLUMN "Name" DROP NOT NULL;

-- ==========================================
-- 2. FIND YOUR USERS TABLE PRIMARY KEY
-- ==========================================
-- Run this first to see what your primary key column is:
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check the primary key constraint:
SELECT 
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users' 
  AND tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public';

-- ==========================================
-- 3. POSITIONS TABLE (tracks user holdings)
-- ==========================================
-- Create table using username (not user_id)
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  ticker TEXT NOT NULL,
  name TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_cost NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  icon_bg TEXT DEFAULT 'bg-gray-600',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username, ticker)
);

-- ==========================================
-- 4. ORDERS TABLE (tracks trade history)
-- ==========================================
-- Create table using username (not user_id)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  ticker TEXT NOT NULL,
  name TEXT,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  total_value NUMERIC NOT NULL,
  order_type TEXT DEFAULT 'stock' CHECK (order_type IN ('stock', 'option')),
  option_details JSONB,
  status TEXT DEFAULT 'filled' CHECK (status IN ('pending', 'filled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. CREATE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_positions_username ON public.positions(username);
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON public.positions(ticker);
CREATE INDEX IF NOT EXISTS idx_orders_username ON public.orders(username);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==========================================
-- 6. OPTIONAL: ADD FOREIGN KEYS (if username is unique in users table)
-- ==========================================
-- Only run these if username is UNIQUE in your users table
-- Foreign keys are optional - the app works fine without them

-- For positions table (using username):
-- ALTER TABLE public.positions 
-- ADD CONSTRAINT fk_positions_username 
-- FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;

-- For orders table (using username):
-- ALTER TABLE public.orders 
-- ADD CONSTRAINT fk_orders_username 
-- FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;

-- ==========================================
-- 6. RLS POLICIES (IMPORTANT!)
-- ==========================================
-- Enable RLS on new tables
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users table policies (if not already set)
DROP POLICY IF EXISTS "Allow public read access for leaderboard" ON public.users;
DROP POLICY IF EXISTS "Allow public insert for signup" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own record" ON public.users;

CREATE POLICY "Allow public read access for leaderboard" ON public.users FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert for signup" ON public.users FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow users to update own record" ON public.users FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Positions table policies
DROP POLICY IF EXISTS "Allow public read positions" ON public.positions;
DROP POLICY IF EXISTS "Allow public insert positions" ON public.positions;
DROP POLICY IF EXISTS "Allow public update positions" ON public.positions;
DROP POLICY IF EXISTS "Allow public delete positions" ON public.positions;

CREATE POLICY "Allow public read positions" ON public.positions FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert positions" ON public.positions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update positions" ON public.positions FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete positions" ON public.positions FOR DELETE TO public USING (true);

-- Orders table policies
DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public delete orders" ON public.orders;

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE TO public USING (true);
```

---

## Detailed Setup

## Issue: Data Not Showing Up

If data is not showing up in the leaderboard, it's most likely due to **Row Level Security (RLS)** policies blocking the queries. Supabase enables RLS by default on all tables.

## Solution: Set Up RLS Policies

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run These SQL Commands

Copy and paste the following SQL commands into the SQL Editor and run them:

```sql
-- Allow public read access to the users table for leaderboard
-- This policy allows anyone to SELECT (read) from the users table
CREATE POLICY "Allow public read access for leaderboard"
ON public.users
FOR SELECT
TO public
USING (true);

-- Allow public INSERT for user signup
-- This policy allows anyone to INSERT (create) new users
CREATE POLICY "Allow public insert for signup"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to UPDATE their own records
-- This policy allows users to update their own trading stats
CREATE POLICY "Allow users to update own record"
ON public.users
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- If policies already exist, drop them first:
-- DROP POLICY IF EXISTS "Allow public read access for leaderboard" ON public.users;
-- DROP POLICY IF EXISTS "Allow public insert for signup" ON public.users;
-- DROP POLICY IF EXISTS "Allow users to update own record" ON public.users;
-- Then run the CREATE POLICY commands above again
```

### Step 3: Verify RLS is Enabled

Check if RLS is enabled on your table:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
```

If `rowsecurity` is `true`, RLS is enabled. You need the policy above.

### Step 4: Alternative - Disable RLS (Not Recommended for Production)

If you want to disable RLS entirely (not recommended for production):

```sql
-- Disable RLS on users table (NOT RECOMMENDED)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

**Warning:** This makes all data publicly readable. Only use for development/testing.

## Table Structure

Make sure your `users` table has these columns:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "Percent Gain" NUMERIC DEFAULT 0,
  "Amount Gained" NUMERIC DEFAULT 0,
  "Total Value" NUMERIC DEFAULT 10000,
  "Category" TEXT DEFAULT 'Student' CHECK ("Category" IN ('Student', 'General', 'Advanced')),
  avatar_url TEXT,
  is_current_user BOOLEAN DEFAULT false,
  trend TEXT CHECK (trend IN ('up', 'down', 'same')) DEFAULT 'same',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_category ON public.users("Category");
CREATE INDEX IF NOT EXISTS idx_users_percent_gain ON public.users("Percent Gain" DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
```

### Add username/password columns to existing table

If you already have a users table, run these to add auth columns:

```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- Make Name column nullable (since we're using username instead)
ALTER TABLE public.users ALTER COLUMN "Name" DROP NOT NULL;
```

**Important:** If you're getting "null value in column Name violates not-null constraint" error, run this SQL to make the Name column nullable:

```sql
-- Remove NOT NULL constraint from Name column
ALTER TABLE public.users ALTER COLUMN "Name" DROP NOT NULL;
```

## Sample Data

To insert sample data for testing:

```sql
INSERT INTO public.users (username, password, "Percent Gain", "Amount Gained", "Total Value", "Category", trend) VALUES
('johndoe', 'password123', 15.5, 5000.00, 15000.00, 'General', 'up'),
('janesmith', 'password123', 12.3, 3500.00, 13500.00, 'General', 'up'),
('bobjohnson', 'password123', 8.7, 2200.00, 12200.00, 'Student', 'down'),
('alicewilliams', 'password123', 20.1, 8000.00, 18000.00, 'Advanced', 'up');
```

## Troubleshooting

### Check if data exists:
```sql
SELECT COUNT(*) FROM public.users;
```

### Check current policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Check for RLS errors in browser console:
Open your browser's developer console (F12) and look for error messages. RLS errors typically show:
- Code: `42501`
- Message: "permission denied" or "new row violates row-level security policy"

### Fix "new row violates row-level security policy" error:
If you see this error when signing up, it means you need to add an INSERT policy:

```sql
-- Add INSERT policy for user signup
CREATE POLICY "Allow public insert for signup"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);
```

## Environment Variables

Make sure your `.env` file has:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Or if using Next.js naming convention:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

## Testing

After setting up the policies, test the query:

```sql
-- This should return data if RLS is configured correctly
SELECT * FROM public.users ORDER BY "Percent Gain" DESC LIMIT 10;

-- Test positions table
SELECT * FROM public.positions LIMIT 10;

-- Test orders table
SELECT * FROM public.orders ORDER BY created_at DESC LIMIT 10;
```

If this works in the SQL Editor but not in your app, check:
1. Environment variables are set correctly
2. You've restarted your dev server after adding env variables
3. Browser console for any errors

## How Paper Trading Works

1. **User Signs Up** → Creates a row in `users` table with `username` and `password`
2. **User Joins Competition** → Sets `Total Value` to $10,000 and `Category` to their skill level
3. **User Places Order** → 
   - Order is recorded in `orders` table
   - Position is created/updated in `positions` table
   - User's `Total Value`, `Percent Gain`, and `Amount Gained` are updated
4. **Leaderboard** → Reads from `users` table, sorted by `Percent Gain`

## Data Flow Example

When a user buys 10 shares of AAPL at $150:

1. **Check funds**: User's available cash = `Total Value` - sum of `positions.current_value`
2. **Create order**: Insert into `orders` (side='buy', quantity=10, price=150, total_value=1500)
3. **Update position**: Insert/update `positions` (ticker='AAPL', quantity=10, average_cost=150, current_value=1500)
4. **Update user stats**: 
   - New total value = remaining cash + all positions value
   - Percent gain = (total_value - 10000) / 10000 * 100
   - Amount gained = total_value - 10000

