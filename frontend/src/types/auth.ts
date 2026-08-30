export type CommuterRole = 'passenger' | 'driver' | 'corporate';

export interface CommuterProfile {
  preferred_pickup_hub: string;
  preferred_dropoff_hub: string;
  preferred_commute_time: string;
  wallet_balance: string | number;
  subscription_status: 'active' | 'paused' | 'inactive';
  carbon_savings_kg: string | number;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  updated_at: string;
}

export interface DriverProfile {
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  license_plate: string;
  seating_capacity: number;
  driver_license_number: string;
  is_driver_approved: boolean;
  rating: string | number;
  total_trips_completed: number;
  earnings_balance: string | number;
  current_corridor: string;
  updated_at: string;
}

export interface CorporateProfile {
  company_name: string;
  corporate_domain: string;
  employee_id: string;
  department: string;
  monthly_transit_subsidy: string | number;
  subsidy_used_this_month: string | number;
  remaining_subsidy: string | number;
  is_corporate_verified: boolean;
  updated_at: string;
}

export interface DjangoUser {
  id: string;
  supabase_uid: string;
  email: string;
  username: string;
  role: CommuterRole;
  first_name: string;
  last_name: string;
  phone_number: string;
  avatar_url: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  commuter_profile?: CommuterProfile;
  driver_profile?: DriverProfile;
  corporate_profile?: CorporateProfile;
}

export interface CommuteCorridor {
  id: string;
  name: string;
  code: string;
  origin_hub: string;
  destination_hub: string;
  distance_km: string | number;
  estimated_minutes: number;
  frequency_minutes: number;
  base_fare: string | number;
  is_active: boolean;
}

export interface AuthContextType {
  user: any | null; // Supabase User
  session: any | null; // Supabase Session
  role: CommuterRole;
  djangoUser: DjangoUser | null;
  loading: boolean;
  backendConnected: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, metadata: SignupMetadata) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export interface SignupMetadata {
  role: CommuterRole;
  full_name: string;
  phone_number?: string;
  // Driver specific
  vehicle_make?: string;
  vehicle_model?: string;
  license_plate?: string;
  driver_license_number?: string;
  // Corporate specific
  company_name?: string;
  corporate_domain?: string;
  employee_id?: string;
  department?: string;
}
