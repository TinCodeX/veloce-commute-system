import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  Compass, 
  Car, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, role } = useAuth();

  const getDashboardLink = () => {
    switch (role) {
      case 'driver':
        return '/driver';
      case 'corporate':
        return '/corporate';
      case 'passenger':
      default:
        return '/passenger';
    }
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-bounce">
          <Zap className="w-3.5 h-3.5" />
          <span>Project Veloce • Next-Gen Spatiotemporal Transit</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Autonomous Subscription Commuting with <span className="gradient-text">Zero Friction</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          High-throughput multi-modal carpooling and spatial corridors. Powered by enterprise-grade cryptographic Supabase Auth and Django REST Framework.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              to={getDashboardLink()}
              className="gradient-btn-primary px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Go to Your {role.toUpperCase()} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="w-full sm:w-auto gradient-btn-primary px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4" />
                <span>Join Veloce Network</span>
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 flex items-center justify-center gap-2 transition-all"
              >
                <span>Existing Commuter Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          
          {/* Passenger Tier */}
          <div className="glass-card p-6 space-y-3.5 border-emerald-500/20 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Daily Passenger Passes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Guaranteed peak-hour seating, dynamic smart-hub routing, and automated escrow wallet payments.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Unlimited Spatial Corridors</span>
            </div>
          </div>

          {/* Driver Cockpit */}
          <div className="glass-card p-6 space-y-3.5 border-amber-500/20 hover:border-amber-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">High-Occupancy Pilots</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assigned arterial corridors, verified passenger manifests, HOV priority lane access, and weekly auto-payouts.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Guaranteed Route Utilization</span>
            </div>
          </div>

          {/* Corporate B2B */}
          <div className="glass-card p-6 space-y-3.5 border-indigo-500/20 hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Corporate B2B Subsidies</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Employer transit allowances, carbon footprint ESG certificates, and automated employee roster billing.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-indigo-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Scope 3 Commute Carbon Accounting</span>
            </div>
          </div>

        </div>
      </section>

      {/* Cryptographic Architecture Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 to-slate-900/50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Enterprise Security Matrix
              </div>
              <h2 className="text-2xl font-bold text-white">End-to-End Cryptographic JWT Flow</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supabase Auth issues asymmetric RS256 / symmetric HS256 tokens. The Django REST Framework <code className="text-emerald-400">SupabaseAuthentication</code> backend cryptographically validates the token, audience, and issuer, then idempotently provisions custom Django User entities and commuter domain profiles.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Link
                to="/profile"
                className="gradient-btn-cyan px-5 py-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                <span>Open JWT Claims Inspector</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
