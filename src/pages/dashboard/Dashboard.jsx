import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../hooks';
import { reqAPI, placementAPI, orgAPI } from '../../utils/api';
import {
  StatCard,
  SectionHead,
  Badge,
  agingBadgeType,
  Empty,
  PulseDot,
  TrialBanner
} from '../../components/shared/UI';

function ActionCard({ dot, title, sub, badge, badgeType, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all hover:border-white/15"
      style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: dot }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
          {title}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text2)' }}>
          {sub}
        </div>
      </div>
      {badge && <Badge label={badge} type={badgeType} />}
    </button>
  );
}

export default function DashboardPage() {
  const { user, org, isTrial, trialDaysLeft } = useAuth();
  const navigate = useNavigate();

  const { data: digest } = useData(() => reqAPI.digest(), []);
  const { data: margin } = useData(() => placementAPI.margin(), []);
  const { data: radar } = useData(() => placementAPI.radar(), []);
  const { data: health } = useData(() => orgAPI.dashboard(), []);
  const { data: actions } = useData(() => orgAPI.actions(), []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? '☀️ Good morning'
      : hour < 17
      ? '👋 Good afternoon'
      : '🌙 Good evening';

  const atRisk = digest?.summary?.totalRevenueAtRisk || 0;
  const critCount = digest?.summary?.criticalReqCount || 0;
  const avgMargin = margin?.summary?.avgMarginPct || 0;
  const activeRev = margin?.summary?.totalMonthlyRevenue || 0;
  const endingSoon = radar?.summary?.endingIn30Days || 0;
  const redClients = health?.summary?.red || 0;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            {greeting}, {user?.first_name}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
            {org?.name}
          </p>
        </div>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <TrialBanner
          daysLeft={trialDaysLeft}
          onUpgrade={() => navigate('/settings/billing')}
        />
      )}

      {/* Revenue at risk */}
      <button
        onClick={() => navigate('/modules/hot-reqs')}
        className="w-full p-5 rounded-2xl text-left transition-all hover:border-white/15"
        style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <PulseDot color={atRisk > 20000 ? 'var(--red)' : 'var(--amber)'} size={8} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
            Revenue at risk
          </span>
        </div>

        <div
          className="text-5xl font-black font-mono tracking-tight mb-1"
          style={{ color: atRisk > 20000 ? 'var(--red)' : 'var(--amber)' }}
        >
          ${(atRisk / 1000).toFixed(1)}K
        </div>

        <div className="text-sm" style={{ color: 'var(--text2)' }}>
          {critCount} critical req{critCount !== 1 ? 's' : ''} · View details →
        </div>
      </button>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Active billing"
          value={`$${(activeRev / 1000).toFixed(1)}K/mo`}
          color="var(--green)"
          delta={`${margin?.summary?.activePlacementCount || 0} placements`}
          onClick={() => navigate('/modules/margin')}
        />

        <StatCard
          label="Avg margin"
          value={`${avgMargin.toFixed(1)}%`}
          color={
            avgMargin < 12
              ? 'var(--red)'
              : avgMargin < 16
              ? 'var(--amber)'
              : 'var(--green)'
          }
          delta={`${margin?.summary?.belowFloorCount || 0} below floor`}
          onClick={() => navigate('/modules/margin')}
        />

        <StatCard
          label="Ending in 30d"
          value={endingSoon}
          color={endingSoon > 3 ? 'var(--amber)' : 'var(--text)'}
          delta="contracts"
          onClick={() => navigate('/modules/radar')}
        />

        <StatCard
          label="Client alerts"
          value={redClients}
          color={redClients > 0 ? 'var(--red)' : 'var(--text)'}
          delta={`${health?.summary?.amber || 0} watching`}
          onClick={() => navigate('/modules/health')}
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <SectionHead
            title="⚡ Actions needed today"
            action={() => navigate('/modules/pulse')}
            actionLabel="Ask Pulse AI"
          />

          {actions?.length ? (
            <div className="space-y-2">
              {actions.slice(0, 3).map((a, i) => (
                <ActionCard
                  key={i}
                  dot={a.priority === 'high' ? 'var(--red)' : 'var(--amber)'}
                  title={a.title}
                  sub={a.body}
                  badge={a.priority === 'high' ? 'Urgent' : undefined}
                  badgeType="red"
                />
              ))}
            </div>
          ) : (
            <Empty
              icon="✅"
              title="No urgent actions"
              desc="All requirements and contracts are on track."
            />
          )}
        </div>

        {/* Critical reqs */}
        <div>
          <SectionHead
            title="🔥 Critical reqs"
            action={() => navigate('/modules/hot-reqs')}
            actionLabel="View all"
          />

          {digest?.criticalReqs?.length ? (
            <div className="space-y-2">
              {digest.criticalReqs.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: r.days_open > 14 ? 'var(--red)' : 'var(--amber)' }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {r.title}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--text2)' }}>
                      {r.client_name}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <Badge label={`${r.days_open}d`} type={agingBadgeType(r.days_open)} />
                    <div
                      className="text-[11px] font-bold font-mono mt-1"
                      style={{ color: 'var(--red)' }}
                    >
                      ${(parseFloat(r.revenue_at_risk || 0) / 1000).toFixed(1)}K
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              icon="📋"
              title="No critical reqs"
              desc="All open requirements are within acceptable age."
            />
          )}
        </div>
      </div>

      {/* Pulse CTA */}
      <button
        onClick={() => navigate('/modules/pulse')}
        className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
        style={{ background: 'var(--teal-dim)', border: '1px solid rgba(34,211,238,0.2)' }}
      >
        <PulseDot color="var(--teal)" size={8} />
        <div className="flex-1">
          <div className="text-sm font-bold" style={{ color: 'var(--teal)' }}>
            ✦ Plaxiq Pulse AI
          </div>
          <div className="text-xs" style={{ color: 'var(--text2)' }}>
            Ask anything about your revenue
          </div>
        </div>
        <span style={{ color: 'var(--teal)' }}>→</span>
      </button>
    </div>
  );
}
