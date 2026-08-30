import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { CommuterRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: CommuterRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // Prevent flicker during initial session hydration
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 p-8">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div className="absolute w-8 h-8 rounded-full bg-emerald-500/10 blur-sm" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300 tracking-wide uppercase">Veloce Identity Guard</p>
          <p className="text-xs text-slate-500 mt-1">Hydrating cryptographic commute session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role authorization check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" state={{ requiredRoles: allowedRoles, currentRole: role }} replace />;
  }

  return <>{children}</>;
};
