import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { PassengerDashboard } from './pages/PassengerDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { CorporateDashboard } from './pages/CorporateDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected Passenger / Rider Route */}
              <Route
                path="/passenger"
                element={
                  <ProtectedRoute allowedRoles={['passenger', 'corporate']}>
                    <PassengerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Driver Cockpit Route */}
              <Route
                path="/driver"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Corporate B2B Portal Route */}
              <Route
                path="/corporate"
                element={
                  <ProtectedRoute allowedRoles={['corporate']}>
                    <CorporateDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected User Profile & JWT Inspector Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-600">
            <p>© 2026 Project Veloce • Spatiotemporal Mobility & Cryptographic Commute Network</p>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
