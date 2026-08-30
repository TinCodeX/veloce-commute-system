import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  Car, 
  Compass, 
  Building2, 
  User, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, djangoUser, backendConnected, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'driver':
        return (
          <span className="badge-driver text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5" />
            Veloce Driver
          </span>
        );
      case 'corporate':
        return (
          <span className="badge-corporate text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Corporate B2B
          </span>
        );
      case 'passenger':
      default:
        return (
          <span className="badge-passenger text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Passenger
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card !rounded-none border-t-0 border-x-0 border-b border-white/10 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group text-decoration-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all flex items-center justify-center">
            <div className="w-full h-full bg-[#070a13] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white font-mono">
                VELOCE<span className="text-emerald-400">.</span>
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded tracking-wider uppercase">
                SPATIAL AUTH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Spatiotemporal Commute Platform</p>
          </div>
        </Link>

        {/* Dynamic Navigation for Logged-in Commuters */}
        {user && (
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <Link
              to="/passenger"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/passenger')
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Rider Hub
            </Link>

            <Link
              to="/driver"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/driver')
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              Driver Cockpit
            </Link>

            <Link
              to="/corporate"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/corporate')
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Corporate Portal
            </Link>

            <Link
              to="/profile"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                location.pathname === '/profile'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Identity & JWT
            </Link>
          </nav>
        )}

        {/* Right Section: System Health + User Context */}
        <div className="flex items-center gap-3">
          {/* Backend Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/5 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-emerald-400 animate-pulse'}`} />
            <span>DRF Backend: <strong className="text-slate-200">Online</strong></span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {getRoleBadge()}

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200 truncate max-w-[160px]">
                  {djangoUser?.first_name ? `${djangoUser.first_name} ${djangoUser.last_name || ''}` : user.email}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {user.id ? `${String(user.id).substring(0, 8)}...` : 'Synced'}
                </span>
              </div>

              <Link
                to="/profile"
                className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 hover:border-emerald-500/40 hover:text-white transition-all"
                title="Profile & Token Claims"
              >
                <User className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="gradient-btn-primary px-4 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
