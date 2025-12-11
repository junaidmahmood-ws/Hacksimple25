# Supabase Setup Guide for Leaderboard

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

-- If the policy already exists, you can drop and recreate it:
-- DROP POLICY IF EXISTS "Allow public read access for leaderboard" ON public.users;
-- Then run the CREATE POLICY command above again
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
  name TEXT NOT NULL,
  percent_gain NUMERIC,
  percent_up NUMERIC,
  amount_gained NUMERIC,
  money_up NUMERIC,
  total_value NUMERIC,
  category TEXT NOT NULL CHECK (category IN ('Students', 'General', 'Advanced')),
  avatar_url TEXT,
  is_current_user BOOLEAN DEFAULT false,
  trend TEXT CHECK (trend IN ('up', 'down', 'same')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_category ON public.users(category);
CREATE INDEX IF NOT EXISTS idx_users_percent_gain ON public.users(percent_gain DESC);
```

## Sample Data

To insert sample data for testing:

```sql
INSERT INTO public.users (name, percent_gain, amount_gained, category, trend) VALUES
('John Doe', 15.5, 5000.00, 'General', 'up'),
('Jane Smith', 12.3, 3500.00, 'General', 'up'),
('Bob Johnson', 8.7, 2200.00, 'Students', 'down'),
('Alice Williams', 20.1, 8000.00, 'Advanced', 'up');
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
SELECT * FROM public.users ORDER BY percent_gain DESC LIMIT 10;
```

If this works in the SQL Editor but not in your app, check:
1. Environment variables are set correctly
2. You've restarted your dev server after adding env variables
3. Browser console for any errors

