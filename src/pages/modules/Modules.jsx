import React, { useState } from 'react';
import { useData } from '../../hooks';
import { reqAPI } from '../../utils/api';

import {
  StatCard,
  Empty,
  Input,
} from '../../components/shared/UI';

/* ═══════════════════════════════════════════════
   HOT REQS PAGE (FIXED)
═══════════════════════════════════════════════ */

export function HotReqsPage() {
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');

  const { data, loading } = useData(() => reqAPI.list(), []);
  const { data: heatmap } = useData(() => reqAPI.heatmap(), []);

  const reqs = data?.requirements || [];
  const summary = data?.summary || {};

  const filtered = reqs.filter(r =>
    !search ||
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  const agingColor = (d) =>
    d <= 4 ? 'var(--green)' :
    d <= 9 ? 'var(--amber)' :
    d <= 14 ? 'var(--red)' :
    '#FF2222';

  const agingBg = (d) =>
    d <= 4 ? 'var(--green-dim)' :
    d <= 9 ? 'var(--amber-dim)' :
    'var(--red-dim)';

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">🔥 Hot Req Tracker</h1>
          <p className="text-xs">
            ${((summary.totalRevenueAtRisk || 0) / 1000).toFixed(1)}K at risk · {summary.total || 0} open reqs
          </p>
        </div>

        <div className="flex gap-2">
          {['list', 'heatmap'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="text-xs px-3 py-1.5 rounded-lg capitalize"
              style={{
                background: view === v ? 'var(--blue-dim)' : 'var(--elevated)',
                color: view === v ? 'var(--blue)' : 'var(--text2)',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="At risk"
          value={`$${((summary.totalRevenueAtRisk || 0) / 1000).toFixed(1)}K`}
          color="var(--red)"
        />
        <StatCard
          label="Critical"
          value={(summary.byAgingCategory?.critical || 0) + (summary.byAgingCategory?.overdue || 0)}
          color="var(--red)"
        />
        <StatCard
          label="Aging"
          value={summary.byAgingCategory?.aging || 0}
          color="var(--amber)"
        />
        <StatCard
          label="Avg age"
          value={`${Math.round(summary.avgDaysOpen || 0)}d`}
          color="var(--text2)"
        />
      </div>

      {/* HEATMAP */}
      {view === 'heatmap' && (
        <div className="mb-5 p-4 rounded-xl">
          <div className="flex flex-wrap gap-2">
            {(heatmap || []).map(r => (
              <div
                key={r.id}
                className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{
                  background: agingBg(r.days_open || 0),
                  color: agingColor(r.days_open || 0),
                }}
              >
                {r.days_open || 0}d
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="mb-4">
        <Input
          placeholder="Search reqs or clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* LIST */}
      {loading ? (
        <div className="py-12 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <Empty icon="📋" title="No open requirements" />
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="p-4 rounded-xl">
              <div className="text-sm font-semibold">{r.title}</div>
              <div className="text-xs">{r.client_name}</div>
              <div className="text-xs font-mono">
                ${(Number(r.revenue_at_risk || 0)).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
