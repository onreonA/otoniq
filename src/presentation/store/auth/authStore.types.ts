/**
 * Auth Store Type Definitions
 */

import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  role: 'super_admin' | 'tenant_admin' | 'tenant_user';
  full_name: string | null;
  avatar_url: string | null;
  tenant_id: string | null;
  tenant?: {
    id: string;
    company_name: string;
    subscription_plan: string;
    subscription_status: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  // State
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    fullName?: string,
    tenantId?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}
