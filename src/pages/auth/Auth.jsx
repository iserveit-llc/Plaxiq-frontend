import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks';
import { Input, Btn, ErrorAlert } from '../../components/shared/UI';

function AuthShell({ title, sub, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{background:'var(--bg)'}}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
            style={{background:'var(--blue)', boxShadow:'0 8px 24px rgba(59,130,246,0.4)'}}>P</div>
          <div>
            <div className="text-lg font-bold" style={{color:'var(--text)'}}>
              Plax<span style={{color:'var(--teal)'}}>iq</span>
            </div>
            <div className="text-[10px]" style={{color:'var(--text3)'}}>Revenue Intelligence</div>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{color:'var(--text)'}}>{title}</h1>
        <p className="text-sm mb-6" style={{color:'var(--text2)'}}>{sub}</p>
        {children}
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [mfaMode, setMfaMode] = useState(false);
  const { values, errors, loading, set, submit } = useForm({ email:'', password:'', mfaToken:'' });

  const onSubmit = submit(async (v) => {
    const r = await login(v);
    if (r?.mfaRequired) { setMfaMode(true); return; }
    navigate('/dashboard');
  });

  return (
    <AuthShell title="Welcome back" sub="Sign in to your revenue intelligence dashboard">
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorAlert message={errors._} />
        {!mfaMode ? (
          <>
            <Input label="Email" type="email" value={values.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@yourfirm.com" error={errors.email} autoComplete="email" required />
            <Input label="Password" type="password" value={values.password}
              onChange={e => set('password', e.target.value)}
              placeholder="••••••••" error={errors.password} autoComplete="current-password" required />
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-xs" style={{color:'var(--blue)'}}>
                Forgot password?
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-lg p-3 mb-2" style={{background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.2)'}}>
            <Input label="Authentication code" type="text" inputMode="numeric" maxLength={6}
              value={values.mfaToken} onChange={e => set('mfaToken', e.target.value)}
              placeholder="000000" className="mt-2" />
            <p className="text-xs mt-2" style={{color:'var(--text2)'}}>Enter the 6-digit code from your authenticator app</p>
          </div>
        )}
        <Btn type="submit" loading={loading} size="lg" className="w-full">
          {mfaMode ? 'Verify' : 'Sign in'}
        </Btn>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{borderColor:'var(--border)'}} />
        </div>
        <div className="relative flex justify-center text-xs" style={{color:'var(--text3)'}}>
          <span className="px-3" style={{background:'var(--bg)'}}>or</span>
        </div>
      </div>

      <Link to="/auth/register">
        <Btn variant="ghost" size="lg" className="w-full">Create free account</Btn>
      </Link>
      <p className="text-center text-xs mt-4" style={{color:'var(--text3)'}}>
        14-day free trial · No credit card required
      </p>
    </AuthShell>
  );
}

// ── REGISTER ──────────────────────────────────────────
export function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [step, setStep] = useState(1);
  const { values, errors, loading, set, submit } = useForm({
    firstName:'', lastName:'', email:'', password:'', orgName:'',
  });

  const onSubmit = submit(async (v) => {
    if (step === 1) { setStep(2); return; }
    // Call register API
    const { authAPI } = await import('../../utils/api');
    await authAPI.register(v);
    // Auto-login
    await login({ email: v.email, password: v.password });
    navigate('/dashboard');
  });

  return (
    <AuthShell title="Start your free trial" sub="14 days free · All features · No credit card">
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorAlert message={errors._} />

        {step === 1 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={values.firstName}
                onChange={e => set('firstName', e.target.value)}
                placeholder="Alex" error={errors.firstName} required />
              <Input label="Last name" value={values.lastName}
                onChange={e => set('lastName', e.target.value)}
                placeholder="Chen" error={errors.lastName} required />
            </div>
            <Input label="Work email" type="email" value={values.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@yourfirm.com" error={errors.email} required />
            <Input label="Password" type="password" value={values.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              error={errors.password} required />
          </>
        ) : (
          <Input label="Company name" value={values.orgName}
            onChange={e => set('orgName', e.target.value)}
            placeholder="Acme Staffing" error={errors.orgName} required />
        )}

        <div className="flex gap-3">
          {step === 2 && (
            <Btn type="button" variant="ghost" size="lg" className="flex-1"
              onClick={() => setStep(1)}>← Back</Btn>
          )}
          <Btn type="submit" loading={loading} size="lg" className="flex-1">
            {step === 1 ? 'Continue →' : 'Start free trial →'}
          </Btn>
        </div>
      </form>

      <p className="text-center text-xs mt-4">
        <span style={{color:'var(--text3)'}}>Already have an account? </span>
        <Link to="/auth/login" style={{color:'var(--blue)'}}>Sign in</Link>
      </p>
    </AuthShell>
  );
}

// ── FORGOT PASSWORD ───────────────────────────────────
export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { values, errors, loading, set, submit } = useForm({ email:'' });

  const onSubmit = submit(async (v) => {
    const { authAPI } = await import('../../utils/api');
    await authAPI.forgot(v.email);
    setSent(true);
  });

  if (sent) return (
    <AuthShell title="Check your email" sub="A reset link has been sent if an account exists.">
      <Link to="/auth/login"><Btn variant="ghost" size="lg" className="w-full">← Back to sign in</Btn></Link>
    </AuthShell>
  );

  return (
    <AuthShell title="Reset password" sub="Enter your email to receive a reset link">
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorAlert message={errors._} />
        <Input label="Email" type="email" value={values.email}
          onChange={e => set('email', e.target.value)}
          placeholder="you@yourfirm.com" error={errors.email} required />
        <Btn type="submit" loading={loading} size="lg" className="w-full">Send reset link →</Btn>
      </form>
      <p className="text-center text-xs mt-4">
        <Link to="/auth/login" style={{color:'var(--blue)'}}>← Back to sign in</Link>
      </p>
    </AuthShell>
  );
}

// ── CHECK EMAIL ───────────────────────────────────────
export function CheckEmailPage() {
  return (
    <AuthShell title="Check your email" sub="We sent a verification link to your email address.">
      <div className="text-center py-4 text-4xl mb-4">📨</div>
      <p className="text-sm text-center mb-6" style={{color:'var(--text2)'}}>
        Click the link in your email to verify your account and log in.
      </p>
      <Link to="/auth/login"><Btn variant="ghost" size="lg" className="w-full">Back to sign in</Btn></Link>
    </AuthShell>
  );
}
