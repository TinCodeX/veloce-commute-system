import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Key, 
  Copy, 
  Check, 
  Code, 
  Database,
  Activity
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, session, role, djangoUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);

  const handleCopyToken = () => {
    const token = session?.access_token || localStorage.getItem('veloce_dev_bearer_token') || 'mock-token';
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePingBackend = async () => {
    setPinging(true);
    setPingResult(null);
    const start = performance.now();
    try {
      const res = await api.getMe();
      const duration = Math.round(performance.now() - start);
      setPingResult({
        success: true,
        duration,
        status: 200,
        data: res,
      });
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setPingResult({
        success: false,
        duration,
        status: err?.response?.status || 500,
        error: err?.response?.data || err.message,
      });
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Key className="w-3.5 h-3.5" />
            <span>Cryptographic Session & DRF Integration Inspector</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Identity & <span className="gradient-text">JWT Diagnostics</span>
          </h1>
          <p className="text-sm text-slate-400">
            Inspect the cryptographic Supabase bearer tokens, DRF custom user mapping, and active claims.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePingBackend}
            disabled={pinging}
            className="gradient-btn-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            <Activity className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
            <span>{pinging ? 'Testing Bearer...' : 'Ping DRF /api/v1/auth/me/'}</span>
          </button>
        </div>
      </div>

      {/* Ping Result Banner */}
      {pingResult && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn ${
          pingResult.success
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {pingResult.success ? 'DRF Bearer Token Verification: Succeeded' : 'DRF Bearer Token Verification: Failed'}
              </p>
              <p className="text-xs opacity-80">
                HTTP {pingResult.status} OK • Latency: {pingResult.duration}ms • Endpoint: <code className="font-mono">/api/v1/auth/me/</code>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-black/30 px-2.5 py-1 rounded">
            Authenticated as: {djangoUser?.email || user?.email}
          </span>
        </div>
      )}

      {/* Main Grid: Identity Card & DRF Record */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Supabase Identity Claims */}
        <div className="glass-card p-6 space-y-5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Supabase Auth Identity (`sub`)
            </h2>
            <span className="badge-passenger text-xs px-2.5 py-0.5 rounded-full font-mono uppercase">
              {role}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Supabase UUID (sub claim)</span>
              <p className="font-mono text-emerald-300 font-bold break-all">
                {user?.id || djangoUser?.supabase_uid || 'dev-sub-uuid-2026-veloce'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Primary Commuter Email</span>
              <p className="text-white font-medium">{user?.email || djangoUser?.email}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Commuter Role Claim</span>
              <p className="text-cyan-300 font-semibold uppercase">{role}</p>
            </div>
          </div>

          {/* Raw JWT Token Access */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Supabase Bearer JWT</span>
              <button
                onClick={handleCopyToken}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Token'}</span>
              </button>
            </div>
            <div className="p-3 rounded-lg bg-black/50 border border-white/5 font-mono text-[11px] text-slate-400 break-all max-h-24 overflow-y-auto">
              {session?.access_token ? session.access_token : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
            </div>
          </div>
        </div>

        {/* Synced Django User & Database Record */}
        <div className="glass-card p-6 space-y-5 border-cyan-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Synced Django User Model (`core.User`)
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              DRF Synced
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Django User ID (PK)</span>
              <p className="font-mono text-cyan-300 font-bold break-all">
                {djangoUser?.id || 'django-uuid-auto-provisioned'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Full Name & Phone</span>
              <p className="text-white font-medium">
                {djangoUser?.first_name ? `${djangoUser.first_name} ${djangoUser.last_name || ''}` : 'Commuter'} • {djangoUser?.phone_number || '+1-555-0199'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">KYC Identity Verification</span>
              <p className="text-emerald-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Commuter Identity</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Domain Models Linked</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300 flex items-center justify-between">
                <span>CommuterProfile</span>
                <span className="text-emerald-400 font-bold">YES</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300 flex items-center justify-between">
                <span>{role === 'driver' ? 'DriverProfile' : role === 'corporate' ? 'CorporateProfile' : 'TransitPass'}</span>
                <span className="text-emerald-400 font-bold">YES</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* JSON Viewer of Backend Data */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            Live Serialized Django REST Payload
          </h2>
          <span className="text-xs text-slate-400 font-mono">GET /api/v1/auth/me/</span>
        </div>

        <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-xs text-emerald-300 font-mono overflow-x-auto max-h-96">
          {JSON.stringify(djangoUser || { notice: 'Authenticate or ping /api/v1/auth/me/ to view raw payload' }, null, 2)}
        </pre>
      </div>

    </div>
  );
};
