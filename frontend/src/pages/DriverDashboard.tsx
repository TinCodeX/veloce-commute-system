import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Car, 
  Users, 
  DollarSign, 
  Navigation, 
  ShieldCheck, 
  Clock, 
  Star, 
  Activity 
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const { djangoUser } = useAuth();
  const [manifestData, setManifestData] = useState<any>(null);
  const [loadingManifest, setLoadingManifest] = useState(true);
  const [onDuty, setOnDuty] = useState(true);

  useEffect(() => {
    const loadManifest = async () => {
      try {
        setLoadingManifest(true);
        const data = await api.getDriverManifest();
        setManifestData(data);
      } catch (err) {
        console.error('Error fetching driver manifest:', err);
      } finally {
        setLoadingManifest(false);
      }
    };
    loadManifest();
  }, []);

  const dProfile = djangoUser?.driver_profile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Driver Hero Header */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Car className="w-3.5 h-3.5" />
              <span>Veloce Verified Corridor Pilot</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Driver Cockpit: <span className="text-amber-400">{djangoUser?.first_name || 'Driver'} {djangoUser?.last_name || ''}</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Assigned corridor: <strong className="text-slate-200">{dProfile?.current_corridor || 'Express Corridor A-12 (North <-> South Line)'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnDuty(!onDuty)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                onDuty
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{onDuty ? 'ON DUTY (BROADCASTING)' : 'OFF DUTY (PAUSED)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Driver Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Earnings */}
        <div className="glass-card p-5 space-y-3 border-amber-500/20">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Corridor Earnings</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              ${dProfile?.earnings_balance ? Number(dProfile.earnings_balance).toFixed(2) : '420.75'}
            </span>
            <span className="text-xs text-slate-400 font-medium">this cycle</span>
          </div>
          <p className="text-[11px] text-slate-500">Auto-transferred to linked bank weekly</p>
        </div>

        {/* Trips Completed */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Commutes</span>
            <Navigation className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {dProfile?.total_trips_completed || 128}
            </span>
            <span className="text-xs text-emerald-400 font-medium">100% on-time</span>
          </div>
          <p className="text-[11px] text-slate-500">Top 5% corridor efficiency tier</p>
        </div>

        {/* Pilot Rating */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Passenger Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {dProfile?.rating || '4.95'}
            </span>
            <span className="text-xs text-amber-400 font-medium">/ 5.00</span>
          </div>
          <p className="text-[11px] text-slate-500">Based on 94 verified reviews</p>
        </div>

        {/* Vehicle Capacity */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Seating Capacity</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">
              3 / {dProfile?.seating_capacity || 4}
            </span>
            <span className="text-xs text-slate-400 font-medium">Seats Filled</span>
          </div>
          <p className="text-[11px] text-slate-500">High occupancy vehicle lane authorized</p>
        </div>

      </div>

      {/* Main Grid: Manifest & Vehicle Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Passenger Manifest (Protected IsDriver Endpoint) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Live Corridor Passenger Manifest
              </h2>
              <p className="text-xs text-slate-400">
                Authorized via DRF <code className="text-amber-400">IsDriver</code> permission at <code className="text-slate-300">/api/v1/driver/manifest/</code>
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              Shift Active
            </span>
          </div>

          {loadingManifest ? (
            <div className="glass-card p-8 flex items-center justify-center space-x-3 text-slate-400 text-sm">
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <span>Decoupling encrypted manifest from DRF...</span>
            </div>
          ) : (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs text-slate-400">
                <span>PASSENGER / STOP</span>
                <span>SEAT ASSIGNMENT</span>
                <span>ESCROW STATUS</span>
              </div>

              <div className="space-y-3">
                {manifestData?.active_passengers?.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">
                        {p.seat}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">{p.name}</h4>
                        <p className="text-[11px] text-slate-400">{p.pickup}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        p.status === 'BOARDED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {p.status}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Escrow Locked</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Vehicle & Compliance Card */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400" />
              Registered Vehicle Profile
            </h2>
            <p className="text-xs text-slate-400">
              Synced from your DRF <code className="text-amber-400">DriverProfile</code> model.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Vehicle</span>
                <strong className="text-slate-200">
                  {dProfile?.vehicle_make || 'Tesla'} {dProfile?.vehicle_model || 'Model Y'} ({dProfile?.vehicle_year || 2024})
                </strong>
              </div>

              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">License Plate</span>
                <span className="font-mono font-bold text-amber-400 uppercase">
                  {dProfile?.license_plate || 'VEL-2049'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Driver License ID</span>
                <span className="font-mono text-slate-300">
                  {dProfile?.driver_license_number || 'DL-9843210'}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-400">Compliance Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Approved Pilot
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 space-y-2 text-xs text-slate-400 border border-white/5">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Clock className="w-4 h-4" />
              <span>Next Scheduled Departure</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              08:35 AM @ North Bayview Station Hub (Platform B)
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
