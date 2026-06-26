import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingScreen } from './components/shared/UI';
import './styles/globals.css';
//added comments
// Auth pages
const LoginPage          = lazy(() => import('./pages/auth/Auth').then(m => ({ default: m.LoginPage })));
const RegisterPage       = lazy(() => import('./pages/auth/Auth').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/Auth').then(m => ({ default: m.ForgotPasswordPage })));
const CheckEmailPage     = lazy(() => import('./pages/auth/Auth').then(m => ({ default: m.CheckEmailPage })));

// App pages
const DashboardPage  = lazy(() => import('./pages/dashboard/Dashboard'));
const HotReqsPage    = lazy(() => import('./pages/modules/Modules').then(m => ({ default: m.HotReqsPage })));
const RadarPage      = lazy(() => import('./pages/modules/Modules').then(m => ({ default: m.RadarPage })));
const MarginPage     = lazy(() => import('./pages/modules/Modules').then(m => ({ default: m.MarginPage })));
const HealthPage     = lazy(() => import('./pages/modules/Modules').then(m => ({ default: m.HealthPage })));
const PulsePage      = lazy(() => import('./pages/modules/Modules').then(m => ({ default: m.PulsePage })));
const BillingPage    = lazy(() => import('./pages/settings/Settings').then(m => ({ default: m.BillingPage })));
const ProfilePage    = lazy(() => import('./pages/settings/Settings').then(m => ({ default: m.ProfilePage })));
const ContractorsPage= lazy(() => import('./pages/settings/Settings').then(m => ({ default: m.ContractorsPage })));
const ClientsPage    = lazy(() => import('./pages/settings/Settings').then(m => ({ default: m.ClientsPage })));
const ReferralsPage  = lazy(() => import('./pages/settings/Settings').then(m => ({ default: m.ReferralsPage })));

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Suspense fallback={<LoadingScreen />}>
          <Routes>

            {/* Public routes */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/login" element={<Public><LoginPage /></Public>} />
            <Route path="/auth/register" element={<Public><RegisterPage /></Public>} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/check-email" element={<CheckEmailPage />} />

            {/* Protected routes */}
            <Route element={<Protected><AppLayout /></Protected>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/modules/hot-reqs" element={<HotReqsPage />} />
              <Route path="/modules/radar" element={<RadarPage />} />
              <Route path="/modules/margin" element={<MarginPage />} />
              <Route path="/modules/health" element={<HealthPage />} />
              <Route path="/modules/pulse" element={<PulsePage />} />
              <Route path="/contractors" element={<ContractorsPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/settings/billing" element={<BillingPage />} />
              <Route path="/settings/profile" element={<ProfilePage />} />
              <Route path="/settings/referrals" element={<ReferralsPage />} />
            </Route>

            {/* FIXED: avoid forcing dashboard redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
