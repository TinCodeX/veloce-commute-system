import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building2, 
  DollarSign, 
  Leaf, 
  ShieldCheck, 
  Briefcase, 
  Award, 
  PieChart,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const CorporateDashboard: React.FC = () => {
  const { djangoUser } = useAuth();
  const [passData, setPassData] = useState<any>(null);
  const [loadingPass, setLoadingPass] = useState(true);

  useEffect(() => {
    const loadPass = async () => {
      try {
        setLoadingPass(true);
        const data = await api.getCorporatePass();
        setPassData(data);
      } catch (err) {
        console.error('Error loading corporate pass:', err);
      } finally {
        setLoadingPass(false);
      }
    };
    loadPass();
  }, []);

  const corpProfile = djangoUser?.corporate_profile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Corporate Hero Banner */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 via-slate-900/60 to-slate-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Enterprise Transit Subscription</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Corporate Portal: <span className="text-indigo-400">{corpProfile?.company_name || 'Veloce Enterprise'}</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Commuter Employee: <strong className="text-slate-200">{djangoUser?.first_name || 'Employee'} {djangoUser?.last_name || ''}</strong> ({corpProfile?.department || 'Engineering'})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>B2B KYC Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Monthly Subsidy */}
        <div className="glass-card p-5 space-y-3 border-indigo-500/20">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Employer Subsidy</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400 font-mono">
              ${corpProfile?.monthly_transit_subsidy ? Number(corpProfile.monthly_transit_subsidy).toFixed(2) : '150.00'}
            </span>
            <span className="text-xs text-slate-400">/ month</span>
          </div>
          <p className="text-[11px] text-slate-500">Funded 100% by employer mobility benefits</p>
        </div>

        {/* Subsidy Remaining */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Remaining Balance</span>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              ${corpProfile?.remaining_subsidy ? Number(corpProfile.remaining_subsidy).toFixed(2) : '105.00'}
            </span>
            <span className="text-xs text-slate-400">available</span>
          </div>
          <p className="text-[11px] text-slate-500">Resets on the 1st of every month</p>
        </div>

        {/* Carbon Reduction */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">ESG Carbon Offset</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">42.8</span>
            <span className="text-xs text-emerald-400 font-medium">kg CO2e</span>
          </div>
          <p className="text-[11px] text-slate-500">Corporate Scope 3 commuting reductions</p>
        </div>

        {/* Corporate Pass Status */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Commuter Badge</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-cyan-400 font-mono">
              {corpProfile?.employee_id || 'EMP-7701'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Valid on all Tier-1 corporate shuttles</p>
        </div>

      </div>

      {/* Corporate Details & Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Enterprise Transit Authorization Pass
              </h2>
              <p className="text-xs text-slate-400">
                Verified via DRF <code className="text-indigo-400">IsCorporateCommuter</code> at <code className="text-slate-300">/api/v1/corporate/transit-pass/</code>
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Active Authorization
            </span>
          </div>

          <div className="glass-card p-6 space-y-4">
            {loadingPass ? (
              <div className="flex items-center justify-center p-8 space-x-3 text-slate-400 text-sm">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                <span>Loading corporate policy rules from DRF backend...</span>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Organization</span>
                    <p className="text-white font-bold">{passData?.corporate_account || corpProfile?.company_name}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Eligible Corridors</span>
                    <p className="text-white font-bold">{passData?.eligible_routes || 'All Tier-1 Corporate Express Lines'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-indigo-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Automated Corporate Expense Settlement
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    All rides taken on authorized corridors are directly billed to your company's master account. No out-of-pocket expense reports required.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Department Roster */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Corporate Identity Record
            </h2>
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Employer Domain</span>
                <span className="font-mono text-slate-200">{corpProfile?.corporate_domain || 'veloce.global'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Department</span>
                <span className="text-slate-200">{corpProfile?.department || 'Engineering & Product'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Employee ID</span>
                <span className="font-mono text-indigo-300">{corpProfile?.employee_id || 'EMP-7701'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Escrow Billing</span>
                <span className="text-emerald-400 font-semibold">Corporate Subsidized</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
