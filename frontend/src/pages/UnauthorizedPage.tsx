import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Compass, Car, Building2 } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();
  const requiredRoles = location.state?.requiredRoles || [];

  const getTargetDashboard = () => {
    switch (role) {
      case 'driver':
        return { path: '/driver', label: 'Driver Cockpit', icon: Car };
      case 'corporate':
        return { path: '/corporate', label: 'Corporate Portal', icon: Building2 };
      case 'passenger':
      default:
        return { path: '/passenger', label: 'Passenger Hub', icon: Compass };
    }
  };

  const target = getTargetDashboard();
  const IconComponent = target.icon;

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6">
      <div className="glass-card max-w-md w-full p-8 text-center space-y-6 border-amber-500/30">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Corridor Access Restricted</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your authenticated commuter profile has role <strong className="text-amber-400 uppercase">{role}</strong>. This corridor view requires permissions for:{' '}
            <strong className="text-slate-200">{requiredRoles.join(', ') || 'different commuter role'}</strong>.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to={target.path}
            className="w-full gradient-btn-primary py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            <IconComponent className="w-4 h-4" />
            <span>Return to Your {target.label}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
