import React from 'react';
import { clsx } from 'clsx';

// ── LOADING SCREEN ────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{background:'var(--bg)'}}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
          style={{background:'var(--blue)', boxShadow:'0 8px 24px rgba(59,130,246,0.4)'}}>P</div>
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{borderColor:'var(--border2)', borderTopColor:'var(--blue)'}} />
      </div>
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────
export function Card({ children, className, onClick, hover = false }) {
  const base = 'rounded-xl border p-4 transition-all duration-150';
  const style = { background:'var(--surface)', borderColor:'var(--border)' };
  if (onClick || hover) {
    return (
      <button onClick={onClick} className={clsx(base,'cursor-pointer hover:border-white/20 text-left w-full',className)} style={style}>
        {children}
      </button>
    );
  }
  return <div className={clsx(base, className)} style={style}>{children}</div>;
}

// ── STAT CARD ─────────────────────────────────────────
export function StatCard({ label, value, color, delta, deltaType, onClick }) {
  const deltaColor = deltaType === 'up' ? 'var(--green)' : deltaType === 'down' ? 'var(--red)' : 'var(--text3)';
  return (
    <Card onClick={onClick} hover={!!onClick} className="min-h-[90px]">
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:'var(--text3)'}}>{label}</div>
      <div className="text-2xl font-bold font-mono mb-1" style={{color: color || 'var(--text)'}}>{value}</div>
      {delta && <div className="text-xs" style={{color: deltaColor}}>{delta}</div>}
    </Card>
  );
}

// ── BADGE ─────────────────────────────────────────────
const BADGE_STYLES = {
  green:    { bg:'var(--green-dim)', color:'#6EE7B7',  border:'rgba(16,185,129,0.2)' },
  amber:    { bg:'var(--amber-dim)', color:'#FCD34D',  border:'rgba(245,158,11,0.2)' },
  red:      { bg:'var(--red-dim)',   color:'#FCA5A5',  border:'rgba(239,68,68,0.2)'  },
  blue:     { bg:'var(--blue-dim)',  color:'#93C5FD',  border:'rgba(59,130,246,0.2)' },
  teal:     { bg:'var(--teal-dim)',  color:'var(--teal)', border:'rgba(34,211,238,0.2)' },
  muted:    { bg:'rgba(255,255,255,0.05)', color:'var(--text2)', border:'var(--border)' },
  critical: { bg:'rgba(239,68,68,0.2)', color:'#FEE2E2', border:'rgba(239,68,68,0.35)' },
};

export function Badge({ label, type = 'muted', className }) {
  const s = BADGE_STYLES[type] || BADGE_STYLES.muted;
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border', className)}
      style={{background:s.bg, color:s.color, borderColor:s.border}}>
      {label}
    </span>
  );
}

export function agingBadgeType(days) {
  if (days <= 4)  return 'green';
  if (days <= 9)  return 'amber';
  if (days <= 14) return 'red';
  return 'critical';
}

export function ragType(rag) {
  return rag === 'green' ? 'green' : rag === 'amber' ? 'amber' : 'red';
}

// ── BUTTON ────────────────────────────────────────────
export function Btn({ children, onClick, type='button', variant='primary', size='md', loading, disabled, className }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2';
  const sizes = { sm:'px-3 py-1.5 text-xs', md:'px-4 py-2 text-sm', lg:'px-5 py-2.5 text-base' };
  const variants = {
    primary: 'text-white disabled:opacity-50',
    ghost:   'border text-sm',
    danger:  'border text-sm',
  };
  const primaryStyle  = { background:'var(--blue)', boxShadow:'0 4px 16px rgba(59,130,246,0.3)' };
  const ghostStyle    = { borderColor:'var(--border2)', color:'var(--text)' };
  const dangerStyle   = { borderColor:'rgba(239,68,68,0.3)', color:'#F87171', background:'rgba(239,68,68,0.1)' };
  const styleMap = { primary: primaryStyle, ghost: ghostStyle, danger: dangerStyle };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={clsx(base, sizes[size], variants[variant], className)}
      style={styleMap[variant]}>
      {loading ? <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{borderColor:'rgba(255,255,255,0.3)',borderTopColor:'#fff'}} /> : children}
    </button>
  );
}

// ── INPUT ─────────────────────────────────────────────
export function Input({ label, error, hint, className, inputClassName, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && <label className="text-[10px] font-bold uppercase tracking-widest" style={{color:'var(--text3)'}}>{label}</label>}
      <input
        className={clsx('w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all', inputClassName)}
        style={{
          background:'var(--elevated)', border:'1px solid var(--border)',
          color:'var(--text)',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
        onBlur={e  => e.target.style.borderColor = error ? '#EF4444' : 'var(--border)'}
        {...props}
      />
      {error && <span className="text-xs" style={{color:'var(--red)'}}>{error}</span>}
      {hint && !error && <span className="text-xs" style={{color:'var(--text3)'}}>{hint}</span>}
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────
export function SectionHead({ title, action, actionLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-bold" style={{color:'var(--text)'}}>{title}</span>
      {action && (
        <button onClick={action} className="text-xs font-semibold" style={{color:'var(--blue)'}}>{actionLabel} →</button>
      )}
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────
export function Empty({ icon, title, desc, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">{icon}</span>
      <span className="text-sm font-semibold" style={{color:'var(--text2)'}}>{title}</span>
      {desc && <span className="text-xs text-center max-w-xs" style={{color:'var(--text3)'}}>{desc}</span>}
      {action && <Btn onClick={action} className="mt-2">{actionLabel}</Btn>}
    </div>
  );
}

// ── PULSE DOT ─────────────────────────────────────────
export function PulseDot({ color = 'var(--teal)', size = 7 }) {
  return <span className="rounded-full animate-pulse-dot inline-block flex-shrink-0"
    style={{width:size, height:size, background:color}} />;
}

// ── ERROR ALERT ───────────────────────────────────────
export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg p-3 text-sm" style={{background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.25)', color:'#FCA5A5'}}>
      {message}
    </div>
  );
}

// ── TRIAL BANNER ─────────────────────────────────────
export function TrialBanner({ daysLeft, onUpgrade }) {
  if (daysLeft === null) return null;
  const urgent = daysLeft <= 3;
  return (
    <div className="flex items-center gap-3 rounded-lg px-4 py-2.5 cursor-pointer mb-4" onClick={onUpgrade}
      style={{
        background: urgent ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)',
        border: `1px solid ${urgent ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
      }}>
      <PulseDot color={urgent ? 'var(--red)' : 'var(--blue)'} />
      <span className="text-xs font-semibold flex-1" style={{color: urgent ? '#FCA5A5' : '#93C5FD'}}>
        {daysLeft === 0 ? 'Trial expires today — upgrade now' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in trial · Click to upgrade`}
      </span>
      <span className="text-xs font-bold" style={{color:'var(--blue)'}}>Upgrade →</span>
    </div>
  );
}
