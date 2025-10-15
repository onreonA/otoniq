/**
 * AuthService
 * Enhanced authentication service with session management
 */

import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';
import { SessionService } from '../services/SessionService';
import { TwoFactorAuthService } from '../services/TwoFactorAuthService';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface LoginResult {
  user: User | null;
  session: Session | null;
  requires2FA: boolean;
  error?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  };
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize authentication state
   */
  private async initializeAuth() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        this.updateAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      if (session?.user) {
        this.updateAuthState({
          user: session.user,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        this.updateAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.updateAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);

      if (event === 'SIGNED_IN' && session) {
        await this.handleSignIn(session);
      } else if (event === 'SIGNED_OUT') {
        await this.handleSignOut();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await this.handleTokenRefresh(session);
      }
    });
  }

  /**
   * Handle sign in
   */
  private async handleSignIn(session: Session) {
    try {
      // Create session record
      const { sessionToken, refreshToken } = SessionService.generateTokens();
      const { expiresAt, refreshExpiresAt } =
        SessionService.calculateExpirationTimes();

      await SessionService.createSession({
        userId: session.user.id,
        sessionToken,
        refreshToken,
        expiresAt,
        refreshExpiresAt,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        deviceInfo: SessionService.getDeviceInfo(navigator.userAgent),
      });

      this.updateAuthState({
        user: session.user,
        session,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error handling sign in:', error);
    }
  }

  /**
   * Handle sign out
   */
  private async handleSignOut() {
    try {
      if (this.authState.user) {
        await SessionService.invalidateAllUserSessions(this.authState.user.id);
      }

      this.updateAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error handling sign out:', error);
    }
  }

  /**
   * Handle token refresh
   */
  private async handleTokenRefresh(session: Session) {
    try {
      // Update session activity
      if (this.authState.session?.access_token) {
        await SessionService.updateSessionActivity(
          this.authState.session.access_token
        );
      }

      this.updateAuthState({
        user: session.user,
        session,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error handling token refresh:', error);
    }
  }

  /**
   * Update authentication state and notify listeners
   */
  private updateAuthState(newState: AuthState) {
    this.authState = newState;
    this.listeners.forEach(listener => listener(newState));
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current auth state
   */
  getAuthState(): AuthState {
    return this.authState;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          requires2FA: false,
          error: error.message,
        };
      }

      if (data.user && data.session) {
        // Check if user has 2FA enabled
        const has2FA = await TwoFactorAuthService.isTwoFactorEnabled(
          data.user.id
        );

        if (has2FA) {
          // Sign out the user temporarily until 2FA is verified
          await supabase.auth.signOut();
          return {
            user: data.user,
            session: null,
            requires2FA: true,
          };
        }

        return {
          user: data.user,
          session: data.session,
          requires2FA: false,
        };
      }

      return {
        user: null,
        session: null,
        requires2FA: false,
        error: 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        user: null,
        session: null,
        requires2FA: false,
        error: 'Login failed',
      };
    }
  }

  /**
   * Complete 2FA login
   */
  async complete2FALogin(
    email: string,
    password: string,
    twoFactorCode: string
  ): Promise<LoginResult> {
    try {
      // First, sign in again
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return {
          user: null,
          session: null,
          requires2FA: false,
          error: error?.message || 'Login failed',
        };
      }

      // Verify 2FA code
      const verification = await TwoFactorAuthService.verifyTwoFactor(
        data.user.id,
        twoFactorCode
      );

      if (!verification.isValid) {
        await supabase.auth.signOut();
        return {
          user: null,
          session: null,
          requires2FA: false,
          error: 'Invalid 2FA code',
        };
      }

      return {
        user: data.user,
        session: data.session,
        requires2FA: false,
      };
    } catch (error) {
      console.error('2FA login error:', error);
      return {
        user: null,
        session: null,
        requires2FA: false,
        error: '2FA login failed',
      };
    }
  }

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    userData?: any
  ): Promise<{ user: User | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        return {
          user: null,
          error: error.message,
        };
      }

      return {
        user: data.user,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        user: null,
        error: 'Registration failed',
      };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      if (this.authState.user) {
        await SessionService.invalidateAllUserSessions(this.authState.user.id);
      }

      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(): Promise<any[]> {
    if (!this.authState.user) {
      return [];
    }

    return await SessionService.getUserActiveSessions(this.authState.user.id);
  }

  /**
   * Invalidate specific session
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId)
        .eq('user_id', this.authState.user?.id);

      if (error) {
        throw new Error(`Failed to invalidate session: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error invalidating session:', error);
      return false;
    }
  }

  /**
   * Get client IP address (simplified)
   */
  private async getClientIP(): Promise<string | undefined> {
    try {
      // In a real application, you'd get this from the server
      // For now, we'll return undefined
      return undefined;
    } catch (error) {
      return undefined;
    }
  }
}
