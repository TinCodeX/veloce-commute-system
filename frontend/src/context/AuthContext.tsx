import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../services/api';
import type { AuthContextType, CommuterRole, DjangoUser, SignupMetadata } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [role, setRole] = useState<CommuterRole>('passenger');
  const [djangoUser, setDjangoUser] = useState<DjangoUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync profile from Django REST Framework backend
  const syncBackendProfile = useCallback(async () => {
    try {
      const health = await api.getHealth();
      setBackendConnected(Boolean(health?.status === 'healthy'));

      const meData = await api.getMe();
      if (meData?.success && meData?.user) {
        setDjangoUser(meData.user);
        if (meData.user.role) {
          setRole(meData.user.role as CommuterRole);
        }
      }
    } catch (err: any) {
      console.warn('[Veloce Auth] Backend sync notice:', err?.response?.data || err.message);
      // Backend may be offline or 401 unauthenticated
      if (err?.response?.status === 401) {
        setDjangoUser(null);
      }
    }
  }, []);

  // Initial session hydration
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Check if demo dev session is active in localStorage
        const devSessionRaw = localStorage.getItem('veloce_dev_session');
        if (devSessionRaw) {
          try {
            const devData = JSON.parse(devSessionRaw);
            if (isMounted) {
              setUser(devData.user);
              setSession(devData.session);
              setRole(devData.role || 'passenger');
              setDjangoUser(devData.djangoUser || null);
            }
          } catch (e) {
            localStorage.removeItem('veloce_dev_session');
          }
        }

        // Hydrate from Supabase client
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('[Veloce Auth] Initial session fetch error:', sessionError);
        }

        if (initialSession && isMounted) {
          setSession(initialSession);
          setUser(initialSession.user);
          const metaRole = (initialSession.user.user_metadata?.role || 'passenger').toLowerCase() as CommuterRole;
          setRole(metaRole);
          await syncBackendProfile();
        }
      } catch (err: any) {
        console.error('[Veloce Auth] Auth initialization failure:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to real-time auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        const metaRole = (currentSession.user.user_metadata?.role || 'passenger').toLowerCase() as CommuterRole;
        setRole(metaRole);
        await syncBackendProfile();
      } else {
        // If not in dev demo mode, clear django user
        if (!localStorage.getItem('veloce_dev_session')) {
          setDjangoUser(null);
          setRole('passenger');
        }
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncBackendProfile]);

  // Login handler
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      setLoading(true);

      // If Supabase credentials are configured, authenticate against Supabase Auth
      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          return { success: false, error: authError.message };
        }

        setSession(data.session);
        setUser(data.user);
        const detectedRole = (data.user?.user_metadata?.role || 'passenger') as CommuterRole;
        setRole(detectedRole);
        await syncBackendProfile();
        return { success: true };
      } else {
        // Interactive Demo / Sandbox Mode for instant testing
        const roleMatch: CommuterRole = email.includes('driver')
          ? 'driver'
          : email.includes('corp') || email.includes('business')
          ? 'corporate'
          : 'passenger';

        const mockUser = {
          id: 'dev-user-' + Math.random().toString(36).substring(2, 9),
          email,
          user_metadata: {
            full_name: email.split('@')[0].toUpperCase(),
            role: roleMatch,
          },
        };

        const mockDjangoUser: DjangoUser = {
          id: 'django-' + Math.random().toString(36).substring(2, 9),
          supabase_uid: mockUser.id,
          email,
          username: email.split('@')[0],
          role: roleMatch,
          first_name: email.split('@')[0],
          last_name: 'Commuter',
          phone_number: '+1-555-0188',
          avatar_url: '',
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          commuter_profile: {
            preferred_pickup_hub: 'Central Station Transit Hub',
            preferred_dropoff_hub: 'Tech Corridor West Gate',
            preferred_commute_time: '08:30 AM',
            wallet_balance: 75.0,
            subscription_status: 'active',
            carbon_savings_kg: 28.4,
            emergency_contact_name: 'Jordan Smith',
            emergency_contact_phone: '+1-555-9090',
            updated_at: new Date().toISOString(),
          },
          driver_profile: roleMatch === 'driver' ? {
            vehicle_make: 'Tesla',
            vehicle_model: 'Model Y Long Range',
            vehicle_year: 2024,
            vehicle_color: 'Midnight Silver',
            license_plate: 'VEL-8822',
            seating_capacity: 4,
            driver_license_number: 'DL-990142',
            is_driver_approved: true,
            rating: 4.98,
            total_trips_completed: 214,
            earnings_balance: 620.50,
            current_corridor: 'Express Corridor A-12 (Silicon Line)',
            updated_at: new Date().toISOString(),
          } : undefined,
          corporate_profile: roleMatch === 'corporate' ? {
            company_name: 'Veloce Global Technologies',
            corporate_domain: 'veloce.global',
            employee_id: 'VEL-CORP-401',
            department: 'Cloud Infrastructure',
            monthly_transit_subsidy: 200.0,
            subsidy_used_this_month: 65.0,
            remaining_subsidy: 135.0,
            is_corporate_verified: true,
            updated_at: new Date().toISOString(),
          } : undefined,
        };

        const devSession = {
          user: mockUser,
          session: { access_token: 'mock-supabase-jwt-token' },
          role: roleMatch,
          djangoUser: mockDjangoUser,
        };

        localStorage.setItem('veloce_dev_session', JSON.stringify(devSession));
        setUser(mockUser);
        setSession({ access_token: 'mock-supabase-jwt-token' });
        setRole(roleMatch);
        setDjangoUser(mockDjangoUser);
        return { success: true };
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication error';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Signup handler
  const signup = async (
    email: string,
    password: string,
    metadata: SignupMetadata
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      setLoading(true);

      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              ...metadata,
            },
          },
        });

        if (authError) {
          setError(authError.message);
          return { success: false, error: authError.message };
        }

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          setRole(metadata.role);
          await syncBackendProfile();
        }
        return { success: true };
      } else {
        // Interactive Demo Signup
        return login(email, password);
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failure';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('veloce_dev_session');
      localStorage.removeItem('veloce_dev_bearer_token');
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setRole('passenger');
      setDjangoUser(null);
    } catch (err) {
      console.error('[Veloce Auth] Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await syncBackendProfile();
  };

  const value = useMemo(
    () => ({
      user,
      session,
      role,
      djangoUser,
      loading,
      backendConnected,
      error,
      login,
      signup,
      logout,
      refreshProfile,
    }),
    [user, session, role, djangoUser, loading, backendConnected, error, syncBackendProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
