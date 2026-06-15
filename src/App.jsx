import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingScreen } from './components/shared/UI';
import './styles/globals.css';

// Pages
const HomePage     = () => <div>Home Page</div>; // 👈 NEW HOME PAGE

const LoginPage          = lazy(() => import('./pages/auth/Auth').then(m => ({ default: m.LoginPage })));
const RegisterPage       = lazy(() => import('./pages/auth/Auth').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/Auth').then(m => ({ default: m.ForgotPasswordPage })));
const CheckEmailPage     = lazy(() => import('./pages/auth/Auth').then(m => ({ default: m.CheckEmailPage })));

// App pages
const DashboardPage  = lazy(() => import('./pages/dashboard/Dashboard'));

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Suspense fallback={<LoadingScreen />}>
          <Routes>

            {/* ✅ PUBLIC HOME PAGE */}
            <Route path="/" element={<HomePage />} />

            {/* AUTH PAGES (NO AUTO REDIRECT FROM HOME) */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/check-email" element={<CheckEmailPage />} />

            {/* PROTECTED APP */}
            <Route element={<Protected><AppLayout /></Protected>}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
