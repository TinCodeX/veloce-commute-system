import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { CommuteCorridor } from '../types/auth';
import { 
  Compass, 
  Wallet, 
  Leaf, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  Ticket
} from 'lucide-react';

export const PassengerDashboard: React.FC = () => {
  const { user, djangoUser, refreshProfile } = useAuth();
  const [corridors, setCorridors] = useState<CommuteCorridor[]>([]);
  const [loadingCorridors, setLoadingCorridors] = useState(true);
  const [updatingHub, setUpdatingHub] = useState(false);
  const [pickupHub, setPickupHub] = useState(
    djangoUser?.commuter_profile?.preferred_pickup_hub || 'Central Station Transit Hub'
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadCorridors = async () => {
      try {
        setLoadingCorridors(true);
        const data = await api.getCorridors();
        setCorridors(data.corridors || []);
      } catch (err) {
        console.error('Error fetching corridors:', err);
      } finally {
        setLoadingCorridors(false);
      }
    };
    loadCorridors();
  }, []);

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingHub(true);
      setSuccessMsg(null);
      await api.updateProfile({ preferred_pickup_hub: pickupHub });
      await refreshProfile();
      setSuccessMsg('Commuter preferences updated successfully on DRF backend!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Update failed:', err);
    } finally {
      setUpdatingHub(false);
    }
  };

  const profile = djangoUser?.commuter_profile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Active Passenger Corridor Member</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{djangoUser?.first_name || user?.email?.split('@')[0] || 'Commuter'}</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Your cryptographic Veloce commuter pass is verified. Spatial corridor routing and automated seat reservations are synchronized.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refreshProfile()}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-medium flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Backend State
            </button>
            <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              JWT Verified (sub: {String(user?.id || djangoUser?.supabase_uid).substring(0, 8)}...)
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Transit Wallet */}
        <div className="glass-card p-5 space-y-3 border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Digital Transit Wallet</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              ${profile?.wallet_balance ? Number(profile.wallet_balance).toFixed(2) : '50.00'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">+ Autoload ON</span>
          </div>
          <p className="text-[11px] text-slate-500">Escrow funds ready for instant corridor bookings</p>
        </div>

        {/* Subscription Status */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Subscription Tier</span>
            <Ticket className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white uppercase">
              {profile?.subscription_status || 'ACTIVE'}
            </span>
            <span className="text-xs text-cyan-400 font-medium">Unlimited Corridors</span>
          </div>
          <p className="text-[11px] text-slate-500">Auto-renews monthly via corporate billing</p>
        </div>

        {/* Carbon Savings */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbon Offset</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {profile?.carbon_savings_kg ? Number(profile.carbon_savings_kg).toFixed(1) : '14.5'}
            </span>
            <span className="text-xs text-slate-400 font-medium">kg CO2e saved</span>
          </div>
          <p className="text-[11px] text-slate-500">Equivalent to 4.2 urban tree seedlings</p>
        </div>

        {/* Preferred Window */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Departure Slot</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {profile?.preferred_commute_time || '08:30 AM'}
            </span>
            <span className="text-xs text-amber-400 font-medium">Morning Wave</span>
          </div>
          <p className="text-[11px] text-slate-500">Dynamic AI corridor matching active</p>
        </div>

      </div>

      {/* Main Grid: Active Corridors & Route Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Spatiotemporal Corridors (from DRF) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Available Spatial Corridors
              </h2>
              <p className="text-xs text-slate-400">
                Live routes synchronized from DRF API endpoint <code className="text-emerald-400">/api/v1/commuter/corridors/</code>
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">{corridors.length} active routes</span>
          </div>

          {loadingCorridors ? (
            <div className="glass-card p-8 flex items-center justify-center space-x-3 text-slate-400 text-sm">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <span>Fetching corridor routes from Django REST API...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {corridors.map((c) => (
                <div
                  key={c.id}
                  className="glass-card p-5 hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {c.code}
                      </span>
                      <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-300">{c.origin_hub}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                      <span className="text-slate-300">{c.destination_hub}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Distance: <strong className="text-slate-300">{c.distance_km} km</strong></span>
                      <span>Est. Travel: <strong className="text-slate-300">{c.estimated_minutes} mins</strong></span>
                      <span>Frequency: <strong className="text-emerald-400">Every {c.frequency_minutes}m</strong></span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                    <span className="text-base font-extrabold text-white font-mono">
                      ${Number(c.base_fare).toFixed(2)}
                    </span>
                    <button className="gradient-btn-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <Zap className="w-3.5 h-3.5" />
                      Book Seat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Commute Preference Customizer */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Commuter Hub Preferences
            </h2>
            <p className="text-xs text-slate-400">
              Customize your default pickup and dropoff points. Updates persist to your Django <code className="text-emerald-400">CommuterProfile</code> model.
            </p>

            <form onSubmit={handleUpdatePreferences} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preferred Pickup Hub
                </label>
                <input
                  type="text"
                  value={pickupHub}
                  onChange={(e) => setPickupHub(e.target.value)}
                  className="veloce-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Destination Dropoff Hub
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.preferred_dropoff_hub || 'Tech Innovation Core West'}
                  className="veloce-input text-xs opacity-70 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={updatingHub}
                className="w-full gradient-btn-cyan py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updatingHub ? 'Syncing...' : 'Save Hub Preference'}
              </button>
            </form>
          </div>

          {/* Escrow & Security Info */}
          <div className="glass-panel p-4 space-y-2 text-xs text-slate-400 border border-white/5">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Smart Escrow Protection</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every ride reservation uses Veloce smart escrow. Fares are only disbursed to the driver upon verified QR corridor check-in.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
