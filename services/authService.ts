import { supabase } from './supabase';

export interface User {
  id?: string; // Optional - may not exist in all tables
  username: string; // Primary identifier
  created_at?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Sign up a new user with username and password
 * Stores plain text credentials in the users table
 * Only inserts username and password - other fields added when joining paper trading
 */
export async function signUp(username: string, password: string): Promise<AuthResult> {
  try {
    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { success: false, error: 'Username already taken' };
    }

    // Create new user - only insert username and password
    // Other paper trading fields will be set when joining the competition
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }

    const user: User = {
      id: data.id,
      username: data.username,
      created_at: data.created_at
    };

    // Store user in localStorage for session persistence
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { success: true, user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Log in an existing user with username and password
 */
export async function login(username: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid username or password' };
    }

    const user: User = {
      id: data.id,
      username: data.username,
      created_at: data.created_at
    };

    // Store user in localStorage for session persistence
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Log out the current user
 */
export function logout(): void {
  localStorage.removeItem('currentUser');
}

/**
 * Get the currently logged in user from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

/**
 * Check if a user is currently logged in
 */
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Update user's trading stats in Supabase
 */
export async function updateUserStats(
  userId: string,
  stats: {
    percentGain?: number;
    amountGained?: number;
    totalValue?: number;
    category?: string;
  }
): Promise<boolean> {
  try {
    const updateData: Record<string, any> = {};
    
    if (stats.percentGain !== undefined) updateData['Percent Gain'] = stats.percentGain;
    if (stats.amountGained !== undefined) updateData['Amount Gained'] = stats.amountGained;
    if (stats.totalValue !== undefined) updateData['Total Value'] = stats.totalValue;
    if (stats.category !== undefined) updateData['Category'] = stats.category;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Failed to update user stats:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update user stats:', error);
    return false;
  }
}

