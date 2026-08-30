import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Compass, 
  Car, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Shield 
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both your email and password.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Redirect according to email/role context
        if (email.includes('driver')) {
          navigate('/driver');
        } else if (email.includes('corp') || email.includes('business')) {
          navigate('/corporate');
        } else {
          navigate('/passenger');
        }
      }
    } else {
      setFormError(res.error || 'Invalid credentials. Please verify and try again.');
    }
  };

  const handleQuickDemoFill = (type: 'passenger' | 'driver' | 'corporate') => {
    if (type === 'passenger') {
      setEmail('passenger.alex@veloce.io');
      setPassword('VelocePass2026!');
    } else if (type === 'driver') {
      setEmail('driver.sarah@veloce.io');
      setPassword('VeloceDriver2026!');
    } else {
      setEmail('corporate.commuter@veloce-enterprise.global');
      setPassword('VeloceCorp2026!');
    }
    setFormError(null);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Supabase Auth & DRF Sync
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Sign In to <span className="gradient-text">Veloce</span>
          </h1>
          <p className="text-sm text-slate-400">
            Access your spatiotemporal transit passes, driver routes, or enterprise subsidy.
          </p>
        </div>

        {/* Demo Quick Selectors */}
        <div className="glass-panel p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Quick Demo Identities</span>
            <span className="text-emerald-400 lowercase">click to autofill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('passenger')}
              className="px-2.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex flex-col items-center gap-1 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Passenger</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('driver')}
              className="px-2.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex flex-col items-center gap-1 transition-all"
            >
              <Car className="w-4 h-4" />
              <span>Driver</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('corporate')}
              className="px-2.5 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex flex-col items-center gap-1 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Corporate</span>
            </button>
          </div>
        </div>

        {/* Main Login Form Card */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Notice</p>
                <p className="mt-0.5 text-red-300/90">{formError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Commuter Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commuter@veloce.io"
                  className="veloce-input !pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please use the quick demo identities or sign up for a new account.'); }} className="text-xs text-emerald-400 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="veloce-input !pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full gradient-btn-primary py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Validating JWT Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Corridor</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-400">
            Don't have a Veloce commuter account?{' '}
            <Link to="/signup" className="text-emerald-400 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Cryptographic Architecture Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured via Supabase RS256/HS256 Bearer JWT Protocol</span>
        </div>

      </div>
    </div>
  );
};
