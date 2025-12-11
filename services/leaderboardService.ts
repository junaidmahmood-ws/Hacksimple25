import { supabase } from './supabase';
import { LeaderboardUser } from '../types';

// Interface matching the actual Supabase column names (with spaces and capitals)
interface SupabaseUser {
  id: string;
  username?: string;
  Name?: string;
  name?: string;
  'Percent Gain'?: number;
  percent_gain?: number;
  'Amount Gained'?: number;
  amount_gained?: number;
  'Total Value'?: number;
  total_value?: number;
  Category?: string;
  category?: string;
  avatar_url?: string;
  is_current_user?: boolean;
  trend?: 'up' | 'down' | 'same';
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Allow dynamic access for column names with spaces
}

/**
 * Fetch leaderboard users from Supabase
 * @param category - Filter by category (Students, General, Advanced)
 * @param currentUserId - Optional user ID to mark as current user
 * @returns Array of LeaderboardUser objects
 */
export async function fetchLeaderboardUsers(
  category?: string,
  currentUserId?: string
): Promise<LeaderboardUser[]> {
  try {
    // Check if Supabase is configured (check for both VITE_ and NEXT_PUBLIC_ prefixes)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabase || !supabaseUrl) {
      console.warn('Supabase not configured. Please set VITE_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) in your .env file');
      return [];
    }

    // Note: Column names in Supabase have spaces and capitals (e.g., "Percent Gain", "Category")
    let query = supabase
      .from('users')
      .select('*')
      .order('Percent Gain', { ascending: false, nullsFirst: false });

    // Filter by category if provided
    // Note: Column name is 'Category' (capitalized) in Supabase
    // Normalize UI category names to database values: "Students" -> "Student"
    if (category && category !== 'ALL') {
      const dbCategory = category === 'Students' ? 'Student' : category;
      query = query.eq('Category', dbCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leaderboard users:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Check if it's a column name error (case sensitivity issue)
      if (error.code === '42703' && error.hint?.includes('Category')) {
        console.error('\n⚠️  Column Name Case Sensitivity Issue Detected!');
        console.error('The column name in your Supabase table is case-sensitive.');
        console.error('Error suggests the column is named "Category" (capitalized).');
        console.error('\n💡 Solutions:');
        console.error('1. Update your Supabase table to use lowercase "category" column');
        console.error('2. Or update the code to use "Category" (capitalized)');
        console.error('\nTo check your column names, run in Supabase SQL Editor:');
        console.error(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users';`);
      }
      
      // Check if it's an RLS (Row Level Security) error
      if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        console.error('\n⚠️  RLS (Row Level Security) Error Detected!');
        console.error('The users table has RLS enabled but no policies are set up.');
        console.error('\n📋 Copy and run this SQL in your Supabase SQL Editor:');
        console.error(`
-- Allow public read access to the users table for leaderboard
CREATE POLICY "Allow public read access for leaderboard"
ON public.users
FOR SELECT
TO public
USING (true);
        `);
        console.error('\n📖 For full setup instructions, see SUPABASE_SETUP.md');
      }
      
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('No users found in the database. Make sure:');
      console.warn('1. RLS policies are set up correctly');
      console.warn('2. Data exists in the users table');
      console.warn('3. The table name is correct (should be "users")');
      return [];
    }

    // Transform Supabase data to LeaderboardUser format
    // Note: Column names may have spaces (e.g., "Percent Gain", "Amount Gained", "Total Value")
    const users: LeaderboardUser[] = data.map((user: SupabaseUser, index: number) => {
      // Handle column names with spaces using bracket notation
      const percentUp = user['Percent Gain'] ?? user.percent_gain ?? 0;
      const moneyUp = user['Amount Gained'] ?? user.amount_gained ?? 0;
      const userName = user.username ?? user['Name'] ?? user.name ?? 'Unknown';
      
      // Generate avatar URL if not provided
      const avatar = user.avatar_url || 
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName.replace(' ', '')}`;

      // Determine if this is the current user
      const isCurrentUser = currentUserId 
        ? user.id === currentUserId 
        : user.is_current_user ?? false;

      // Determine trend (default to 'same' if not provided)
      const trend = user.trend || 'same';

      // Handle both capitalized and lowercase category column names
      const userCategory = user.Category || user.category || 'General';
      // Normalize 'Student' to 'Students' to match the UI
      const normalizedCategory = userCategory === 'Student' ? 'Students' : userCategory;

      return {
        id: user.id,
        name: userName,
        percentUp,
        moneyUp,
        rank: index + 1, // Will be recalculated per category
        category: normalizedCategory,
        avatar,
        isCurrentUser,
        trend: trend as 'up' | 'down' | 'same'
      };
    });

    return users;
  } catch (error) {
    console.error('Failed to fetch leaderboard users:', error);
    return [];
  }
}

/**
 * Get current user's rank for a specific category
 * @param category - Category to check rank in
 * @param currentUserId - Current user's ID
 * @returns Rank number or null if not found
 */
export async function getCurrentUserRank(
  category: string,
  currentUserId?: string
): Promise<number | null> {
  try {
    const users = await fetchLeaderboardUsers(category, currentUserId);
    const currentUser = users.find(u => u.isCurrentUser);
    return currentUser?.rank ?? null;
  } catch (error) {
    console.error('Failed to get current user rank:', error);
    return null;
  }
}

