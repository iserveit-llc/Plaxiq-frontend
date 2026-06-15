import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData, useForm } from '../../hooks';
import { reqAPI, placementAPI, orgAPI, pulseAPI } from '../../utils/api';
import { StatCard, SectionHead, Badge, agingBadgeType, ragType, Empty, Btn, Input, ErrorAlert, PulseDot } from '../../components/shared/UI';

// ══════════════════════════════════════════════════════
// HOT REQS PAGE
// ══════════════════════════════════════════════════════
export function HotReqsPage() {
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const { data, loading, refetch } = useData(() => reqAPI.list(), []);
  const { data: heatmap } = useData(() => reqAPI.heatmap(), []);

  const reqs = data?.requirements || [];
  const summary = data?.summary || {};
  const filtered = reqs.filter(r =>
    !search || r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  const agingColor = (d) => d <= 4 ? 'var(--green)' : d <= 9 ? 'var(--amber)' : d <= 14 ? 'var(--red)' : '#FF2222';
  const agingBg    = (d) => d <= 4 ? 'var(--green-dim)' : d <= 9 ? 'var(--amber-dim)' : 'var(--red-dim)';

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{color:'var(--text)'}}>🔥 Hot Req Tracker</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--text3)'}}>
            ${((summary.totalRevenueAtRisk||0)/1000).toFixed(1)}K at risk · {summary.total||0} open reqs
          </p>
        </div>
        <div className="flex gap-2">
          {['list','heatmap'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className="text-xs px-3 py-1.5 rounded-lg capitalize"
              style={{
                background: view===v ? 'var(--blue-dim)' : 'var(--elevated)',
                color: view===v ? 'var(--blue)' : 'var(--text2)',
                border: `1px solid ${view===v ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
              }}>{v}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="At risk" value={`$${((summary.totalRevenueAtRisk||0)/1000).toFixed(1)}K`} color="var(--red)" />
        <StatCard label="Critical" value={(summary.byAgingCategory?.critical||0)+(summary.byAgingCategory?.overdue||0)} color="var(--red)" />
        <StatCard label="Aging" value={summary.byAgingCategory?.aging||0} color="var(--amber)" />
        <StatCard label="Avg age" value={`${Math.round(summary.avgDaysOpen||0)}d`} color="var(--text2)" />
      </div>

      {/* Heatmap */}
      {view === 'heatmap' && (
        <div className="mb-5 p-4 rounded-xl" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          <SectionHead title="Aging heat map" />
          <div className="flex gap-4 mb-4 text-xs" style={{color:'var(--text3)'}}>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{background:'var(--green-dim)'}} />Fresh 0–4d</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{background:'var(--amber-dim)'}} />Aging 5–9d</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{background:'var(--red-dim)'}} />Critical 10d+</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(heatmap||[]).map(r => (
              <div key={r.id} className="w-14 h-14 rounded-xl flex items-center justify-center font-bold font-mono text-sm border"
                style={{background:agingBg(r.days_open), color:agingColor(r.days_open), borderColor:agingColor(r.days_open)+'40'}}>
                {r.days_open}d
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <Input placeholder="Search reqs or clients…" value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {/* List */}
      {loading ? <div className="py-12 text-center text-sm" style={{color:'var(--text3)'}}>Loading…</div>
        : filtered.length === 0 ? <Empty icon="📋" title="No open requirements" desc="Add your first requirement to start tracking revenue at risk." />
        : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="p-4 rounded-xl" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{background:agingColor(r.days_open)}} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{color:'var(--text)'}}>{r.title}</div>
                    <div className="text-xs mt-0.5" style={{color:'var(--text2)'}}>{r.client_name} {r.req_number && `· ${r.req_number}`}</div>
                  </div>
                  <Badge label={`${r.days_open}d`} type={agingBadgeType(r.days_open)} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:'var(--text3)'}}>Revenue at risk</div>
                    <div className="text-xl font-bold font-mono" style={{color:agingColor(r.days_open)}}>
                      ${parseFloat(r.revenue_at_risk||0).toLocaleString(undefined,{maximumFractionDigits:0})}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {r.bill_rate && <span className="text-xs font-mono" style={{color:'var(--text3)'}}>Bill: ${r.bill_rate}/hr</span>}
                    {r.bench_match_count > 0 && (
                      <Badge label={`${r.bench_match_count} bench match${r.bench_match_count!==1?'es':''}`} type="teal" />
                    )}
                  </div>
                </div>
                {r.skills_required?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {r.skills_required.slice(0,5).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{background:'var(--overlay)', color:'var(--text2)', border:'1px solid var(--border)'}}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// CONTRACT RADAR PAGE
// ══════════════════════════════════════════════════════
export function RadarPage() {
  const { data, loading } = useData(() => placementAPI.radar(), []);
  const placements = data?.placements || [];
  const summary = data?.summary || {};
  const alerts = data?.alerts || {};

  const urgencyColor = (u) => u==='critical' ? 'var(--red)' : u==='urgent' ? 'var(--amber)' : u==='watch' ? 'var(--blue)' : 'var(--text3)';
  const urgencyType  = (u) => u==='critical' ? 'red' : u==='urgent' ? 'amber' : u==='watch' ? 'blue' : 'muted';

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{color:'var(--text)'}}>📡 Contract Radar</h1>
      <p className="text-xs mb-5" style={{color:'var(--text3)'}}>90/60/30-day countdown · Visa compliance tracking</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Ending in 7d"   value={summary.endingIn7Days||0}   color="var(--red)"   />
        <StatCard label="Ending in 30d"  value={summary.endingIn30Days||0}  color="var(--amber)" />
        <StatCard label="Visa alerts"    value={alerts.visaAlertsCount||0}  color="var(--red)"   />
        <StatCard label="Active"         value={summary.totalActive||0}     color="var(--text)"  />
      </div>

      {loading ? <div className="py-12 text-center text-sm" style={{color:'var(--text3)'}}>Loading…</div>
        : placements.length === 0 ? <Empty icon="📡" title="No active contracts" desc="Add placements to start tracking contract end dates." />
        : (
          <div className="space-y-3">
            {placements.map(p => (
              <div key={p.id} className="p-4 rounded-xl"
                style={{
                  background: p.urgency_level==='critical' ? 'rgba(239,68,68,0.05)' : 'var(--surface)',
                  border: `1px solid ${p.urgency_level==='critical' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                }}>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-3xl font-black font-mono flex-shrink-0"
                    style={{color:urgencyColor(p.urgency_level), minWidth:'52px', textAlign:'right'}}>
                    {p.days_to_end}d
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{color:'var(--text)'}}>{p.contractor_name}</div>
                    <div className="text-xs" style={{color:'var(--text2)'}}>{p.client_name}</div>
                    <div className="text-xs mt-0.5" style={{color:'var(--text3)'}}>{p.role_title}</div>
                  </div>
                  <Badge label={p.urgency_level} type={urgencyType(p.urgency_level)} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{color:'var(--text3)'}}>
                  <span>Ends: {new Date(p.end_date).toLocaleDateString()}</span>
                  <span>Visa: {p.visa_type?.toUpperCase()||'N/A'}</span>
                  {p.extension_probability && (
                    <span style={{color: p.extension_probability>=70?'var(--green)':p.extension_probability>=40?'var(--amber)':'var(--red)'}}>
                      Ext prob: {p.extension_probability}%
                    </span>
                  )}
                </div>
                {p.visa_alert && (
                  <div className="mt-3 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{background:'var(--red-dim)', color:'#FCA5A5', border:'1px solid rgba(239,68,68,0.2)'}}>
                    ⚠️ Visa expiring soon — attorney action may be required
                  </div>
                )}
                {p.i9_action_needed && (
                  <div className="mt-2 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{background:'var(--amber-dim)', color:'#FCD34D', border:'1px solid rgba(245,158,11,0.2)'}}>
                    📋 I-9 reverification required
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MARGIN MONITOR PAGE
// ══════════════════════════════════════════════════════
export function MarginPage() {
  const { data, loading } = useData(() => placementAPI.margin(), []);
  const placements = data?.placements || [];
  const summary    = data?.summary || {};

  const marginColor = (p) => p < 12 ? 'var(--red)' : p < 16 ? 'var(--amber)' : 'var(--green)';
  const fillPct     = (p) => Math.min(100, (p / 30) * 100);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{color:'var(--text)'}}>📊 Margin Monitor</h1>
      <p className="text-xs mb-5" style={{color:'var(--text3)'}}>True margin per contractor — bill minus pay minus burden</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Monthly revenue" value={`$${((summary.totalMonthlyRevenue||0)/1000).toFixed(1)}K`} color="var(--green)" />
        <StatCard label="Avg margin"      value={`${(summary.avgMarginPct||0).toFixed(1)}%`} color={marginColor(summary.avgMarginPct||0)} />
        <StatCard label="Below floor"     value={summary.belowFloorCount||0} color="var(--red)" />
        <StatCard label="Placements"      value={summary.activePlacementCount||0} color="var(--text)" />
      </div>

      {loading ? <div className="py-12 text-center text-sm" style={{color:'var(--text3)'}}>Loading…</div>
        : placements.length === 0 ? <Empty icon="📊" title="No active placements" desc="Add placements to track margins in real time." />
        : (
          <div className="space-y-3">
            {placements.map(p => (
              <div key={p.id} className="p-4 rounded-xl"
                style={{
                  background: p.below_floor ? 'rgba(239,68,68,0.04)' : 'var(--surface)',
                  border: `1px solid ${p.below_floor ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="text-sm font-semibold" style={{color:'var(--text)'}}>{p.contractor_name}</div>
                    <div className="text-xs" style={{color:'var(--text2)'}}>{p.client_name}</div>
                  </div>
                  <span className="text-2xl font-black font-mono flex-shrink-0"
                    style={{color:marginColor(p.gross_margin_pct||0)}}>
                    {parseFloat(p.gross_margin_pct||0).toFixed(1)}%
                  </span>
                </div>
                {/* Bar */}
                <div className="h-1.5 rounded-full mb-3" style={{background:'var(--border2)'}}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{width:`${fillPct(p.gross_margin_pct||0)}%`, background:marginColor(p.gross_margin_pct||0)}} />
                </div>
                <div className="flex justify-between text-[11px] font-mono" style={{color:'var(--text3)'}}>
                  <span>Bill: ${p.bill_rate}/hr</span>
                  <span>Pay: ${p.pay_rate}/hr</span>
                  <span>Rev: ${((p.monthly_revenue||0)/1000).toFixed(1)}K/mo</span>
                </div>
                {p.below_floor && (
                  <div className="mt-3 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{background:'var(--red-dim)', color:'#FCA5A5', border:'1px solid rgba(239,68,68,0.2)'}}>
                    ⚠️ Below {p.margin_floor_pct}% floor — action needed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// CLIENT HEALTH PAGE
// ══════════════════════════════════════════════════════
export function HealthPage() {
  const { data, loading } = useData(() => orgAPI.dashboard(), []);
  const clients = data?.clients || [];
  const summary = data?.summary || {};

  const ragColor = (r) => r==='green' ? 'var(--green)' : r==='amber' ? 'var(--amber)' : 'var(--red)';

  const DimBar = ({ label, val }) => (
    <div className="flex items-center gap-3">
      <span className="text-[11px] min-w-[100px]" style={{color:'var(--text3)'}}>{label}</span>
      <div className="flex-1 h-1 rounded-full" style={{background:'var(--border2)'}}>
        <div className="h-full rounded-full"
          style={{width:`${val||0}%`, background: val>=70?'var(--green)':val>=40?'var(--amber)':'var(--red)'}} />
      </div>
      <span className="text-[11px] font-mono min-w-[24px] text-right" style={{color:'var(--text2)'}}>{val||0}</span>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{color:'var(--text)'}}>💜 Client Health</h1>
      <p className="text-xs mb-5" style={{color:'var(--text3)'}}>RAG scoring across 5 dimensions · Churn prediction</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="🔴 At risk" value={summary.red||0}   color="var(--red)"   />
        <StatCard label="🟡 Watch"   value={summary.amber||0} color="var(--amber)" />
        <StatCard label="🟢 Healthy" value={summary.green||0} color="var(--green)" />
      </div>

      {loading ? <div className="py-12 text-center text-sm" style={{color:'var(--text3)'}}>Loading…</div>
        : clients.length === 0 ? <Empty icon="🏢" title="No clients yet" desc="Add your first client to see health scores." />
        : (
          <div className="space-y-4">
            {clients.map(c => (
              <div key={c.id} className="p-4 rounded-xl" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{background:ragColor(c.rag)}} />
                  <span className="text-sm font-bold flex-1" style={{color:'var(--text)'}}>{c.name}</span>
                  <span className="text-xl font-black font-mono" style={{color:ragColor(c.rag)}}>
                    {c.overall_score||0}/100
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <DimBar label="Responsiveness" val={c.responsiveness_score} />
                  <DimBar label="Fill rate"      val={c.fill_rate_score} />
                  <DimBar label="Margin quality" val={c.margin_quality_score} />
                  <DimBar label="Payment health" val={c.payment_health_score} />
                  <DimBar label="Warmth"         val={c.relationship_warmth_score} />
                </div>
                <div className="flex justify-between text-[11px] pt-3 border-t" style={{borderColor:'var(--border)', color:'var(--text3)'}}>
                  <span>{c.active_placements||0} placements</span>
                  <span>${((c.monthly_revenue||0)/1000).toFixed(1)}K/mo</span>
                  {c.churn_probability && (
                    <span style={{color:c.churn_probability>50?'var(--red)':'var(--text3)'}}>
                      {c.churn_probability}% churn risk
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// PULSE AI PAGE
// ══════════════════════════════════════════════════════
const CHIPS = [
  'What needs my attention today?',
  'Which reqs are most at risk?',
  'Contracts ending this month?',
  'Show below-floor margins',
  'Which clients should I call?',
  '90-day revenue forecast?',
];

export function PulsePage() {
  const { hasFeature, org } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I'm Plaxiq Pulse — your AI revenue intelligence agent.\n\nI have full access to your open requirements, active placements, contract end dates, client health scores, and margin data.\n\nWhat would you like to know?",
    ts: new Date().toISOString(),
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [digestLoading, setDigestLoading] = useState(false);
  const bottomRef = useRef(null);

  const scrollDown = () => setTimeout(() => bottomRef.current?.scrollIntoView({behavior:'smooth'}), 100);

  const addMsg = useCallback((role, content) => {
    setMessages(m => [...m, { role, content, ts: new Date().toISOString() }]);
    scrollDown();
  }, []);

  const send = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const history = messages.map(m => ({role:m.role, content:m.content}));
    addMsg('user', text);
    setInput('');
    setLoading(true);
    try {
      const r = await pulseAPI.chat({ message: text, history: history.slice(-10) });
      addMsg('assistant', r.response);
    } catch (e) {
      addMsg('assistant', `Sorry — ${e.message || 'something went wrong'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, addMsg]);

  const getDigest = async () => {
    setDigestLoading(true);
    try {
      const r = await pulseAPI.digest();
      addMsg('assistant', `📋 Daily Digest\n\n${r.digest}`);
    } catch (e) {
      addMsg('assistant', `Could not generate digest: ${e.message}`);
    } finally {
      setDigestLoading(false);
    }
  };

  if (!hasFeature('pulse_ai')) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background:'var(--bg)'}}>
      <div className="max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{background:'var(--teal-dim)', border:'1px solid rgba(34,211,238,0.3)'}}>✦</div>
        <h2 className="text-xl font-bold mb-2" style={{color:'var(--text)'}}>Plaxiq Pulse AI</h2>
        <p className="text-sm mb-6" style={{color:'var(--text2)'}}>
          Pulse AI is available on Growth plan and above. Upgrade to get your AI revenue intelligence agent.
        </p>
        <Btn onClick={() => navigate('/settings/billing')} size="lg">
          Upgrade to Growth — $49.99/mo →
        </Btn>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{background:'var(--bg)'}}>
      {/* Suggested chips */}
      <div className="border-b px-4 py-3" style={{background:'var(--surface)', borderColor:'var(--border)'}}>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CHIPS.map(c => (
            <button key={c} onClick={() => send(c)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{background:'var(--elevated)', border:'1px solid var(--border)', color:'var(--text2)'}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role==='user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{background: m.role==='user' ? 'var(--blue)' : 'var(--teal)', color:'var(--bg)'}}>
              {m.role==='user' ? 'Y' : '✦'}
            </div>
            <div className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={{
                background: m.role==='user' ? 'var(--blue-dim)' : 'var(--elevated)',
                border: `1px solid ${m.role==='user' ? 'rgba(59,130,246,0.2)' : 'var(--border2)'}`,
                color: m.role==='user' ? '#BFDBFE' : 'var(--text)',
                borderBottomRightRadius: m.role==='user' ? 4 : 16,
                borderBottomLeftRadius:  m.role==='user' ? 16 : 4,
              }}>
              {m.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < m.content.split('\n').length-1 && <br/>}</span>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{background:'var(--teal)', color:'var(--bg)'}}>✦</div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
              style={{background:'var(--elevated)', border:'1px solid var(--border2)'}}>
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full" style={{background:'var(--teal)', opacity:0.4+i*0.2}} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4" style={{background:'var(--surface)', borderColor:'var(--border)'}}>
        {!org?.aiEnabled && (
          <div className="mb-3 px-3 py-2 rounded-lg text-xs font-semibold"
            style={{background:'var(--amber-dim)', color:'var(--amber)', border:'1px solid rgba(245,158,11,0.2)'}}>
            AI processing is disabled. Enable in Settings → Profile.
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={getDigest} disabled={digestLoading}
            className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-lg"
            style={{background:'var(--elevated)', border:'1px solid var(--border)'}}>
            {digestLoading ? <span className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{borderColor:'var(--border2)',borderTopColor:'var(--teal)'}} /> : '📋'}
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && send(input)}
            placeholder="Ask Pulse anything…"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{background:'var(--elevated)', border:'1px solid var(--border2)', color:'var(--text)'}}
          />
          <button onClick={() => send(input)} disabled={!input.trim()||loading}
            className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white disabled:opacity-40"
            style={{background:'var(--blue)', boxShadow:'0 4px 12px rgba(59,130,246,0.35)'}}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
