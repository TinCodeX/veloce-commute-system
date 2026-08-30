import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { CommuterRole, SignupMetadata } from '../types/auth';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Car, 
  Compass, 
  Building2, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export const Signup: React.FC = () => {
  const [role, setRole] = useState<CommuterRole>('passenger');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Driver fields
  const [vehicleMake, setVehicleMake] = useState('Tesla');
  const [vehicleModel, setVehicleModel] = useState('Model Y');
  const [licensePlate, setLicensePlate] = useState('VEL-2049');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('DL-908124');

  // Corporate fields
  const [companyName, setCompanyName] = useState('Acme Technologies Global');
  const [corporateDomain, setCorporateDomain] = useState('acme.corp');
  const [employeeId, setEmployeeId] = useState('EMP-4401');
  const [department, setDepartment] = useState('Product Engineering');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password || !fullName) {
      setFormError('Please fill out all required personal identity fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters in length.');
      return;
    }

    const metadata: SignupMetadata = {
      role,
      full_name: fullName,
      phone_number: phone,
      ...(role === 'driver' && {
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        license_plate: licensePlate,
        driver_license_number: driverLicenseNumber,
      }),
      ...(role === 'corporate' && {
        company_name: companyName,
        corporate_domain: corporateDomain,
        employee_id: employeeId,
        department,
      }),
    };

    setSubmitting(true);
    const res = await signup(email, password, metadata);
    setSubmitting(false);

    if (res.success) {
      if (role === 'driver') {
        navigate('/driver');
      } else if (role === 'corporate') {
        navigate('/corporate');
      } else {
        navigate('/passenger');
      }
    } else {
      setFormError(res.error || 'Failed to initialize commuter account.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Veloce Domain Provisioning
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Create Your <span className="gradient-text">Commuter Profile</span>
          </h1>
          <p className="text-sm text-slate-400">
            Select your platform role to configure PostGIS corridors and transit wallets.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2.5 p-1.5 glass-panel">
          <button
            type="button"
            onClick={() => setRole('passenger')}
            className={`py-3 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              role === 'passenger'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>Passenger / Rider</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`py-3 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              role === 'driver'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Car className="w-5 h-5" />
            <span>Veloce Driver</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('corporate')}
            className={`py-3 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              role === 'corporate'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Corporate B2B</span>
          </button>
        </div>

        {/* Signup Form Card */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Registration Issue</p>
                <p className="mt-0.5 text-red-300/90">{formError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Core Account Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="veloce-input !pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="veloce-input !pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address *
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Secure Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="veloce-input !pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Role-Tailored Domain Information */}
            {role === 'driver' && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Car className="w-4 h-4" />
                  <span>Veloce Driver Compliance & Vehicle Metadata</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Vehicle Make</label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="e.g. Tesla"
                      className="veloce-input text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Vehicle Model</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Model Y"
                      className="veloce-input text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">License Plate</label>
                    <input
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="e.g. VEL-4409"
                      className="veloce-input text-xs py-2 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Driver License ID</label>
                    <input
                      type="text"
                      value={driverLicenseNumber}
                      onChange={(e) => setDriverLicenseNumber(e.target.value)}
                      placeholder="e.g. DL-8874102"
                      className="veloce-input text-xs py-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'corporate' && (
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-3.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Building2 className="w-4 h-4" />
                  <span>Corporate Employer & Subsidy Profile</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="veloce-input text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Corporate Domain</label>
                    <input
                      type="text"
                      value={corporateDomain}
                      onChange={(e) => setCorporateDomain(e.target.value)}
                      placeholder="e.g. acme.com"
                      className="veloce-input text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Employee ID</label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. EMP-1092"
                      className="veloce-input text-xs py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Engineering"
                      className="veloce-input text-xs py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'passenger' && (
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatic $50.00 Welcome Commute Transit Wallet Credit will be provisioned on Django backend.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full gradient-btn-primary py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Provisioning Supabase Identity & DRF Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Commuter Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-400">
            Already have an active Veloce account?{' '}
            <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
