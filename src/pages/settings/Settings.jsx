import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../hooks';
import { billingAPI, contractorAPI, clientAPI } from '../../utils/api';

import {
  Card,
  Btn,
  Input,
  Badge,
  Empty,
  ErrorAlert
} from '../../components/shared/UI';

// ── BILLING ───────────────────────────────────────────
const PLANS = [
  { key:'starter',    name:'Starter',    price:'$29.99', users:'2 users',  contractors:'10 contractors',  features:['All 4 modules','Mobile app'] },
  { key:'growth',     name:'Growth',     price:'$49.99', users:'5 users',  contractors:'50 contractors',  features:['Pulse AI','ATS sync'], popular:true },
  { key:'scale',      name:'Scale',      price:'$99.99', users:'15 users', contractors:'150 contractors', features:['White-label reports','Priority support'] },
  { key:'agency_pro', name:'Agency Pro', price:'$199.99',users:'Unlimited',contractors:'Unlimited',       features:['Full API access','Dedicated CSM'] },
];

export function BillingPage() {
  const { org } = useAuth();

  const handlePortal = async () => {
    try {
      const r = await billingAPI.portal();
      if (r.url) window.location.href = r.url;
    } catch (e) { alert(e.message); }
  };

  const handleCheckout = async (tier) => {
    try {
      const r = await billingAPI.checkout({ tier, interval: 'monthly' });
      if (r.url) window.location.href = r.url;
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{color:'var(--text)'}}>💳 Billing & Plan</h1>
      <p className="text-xs mb-6" style={{color:'var(--text3)'}}>One price for your whole team — not per seat</p>

      <Card className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'var(--text3)'}}>Current plan</div>
          <div className="text-lg font-bold capitalize" style={{color:'var(--text)'}}>{org?.tier?.replace('_',' ') || 'Trial'}</div>
          <div className="text-xs mt-0.5 capitalize" style={{color: org?.status==='past_due' ? 'var(--red)' : 'var(--text2)'}}>
            {org?.status || 'trialing'}
          </div>
        </div>
        <Btn onClick={handlePortal} variant="ghost">Manage billing →</Btn>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map(p => {
          const isCurrent = org?.tier === p.key;

          return (
            <div
              key={p.key}
              className="p-5 rounded-xl relative"
              style={{
                background: p.popular ? 'var(--blue-dim)' : 'var(--surface)',
                border: `1px solid ${
                  isCurrent
                    ? 'rgba(59,130,246,0.5)'
                    : p.popular
                    ? 'rgba(59,130,246,0.3)'
                    : 'var(--border)'
                }`,
              }}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{background:'var(--blue)', color:'#fff'}}>
                  Most popular
                </span>
              )}

              {isCurrent && (
                <span className="absolute -top-2.5 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{background:'var(--green)', color:'#fff'}}>
                  Current
                </span>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold" style={{color:'var(--text)'}}>{p.name}</span>
                <span className="text-xl font-black font-mono" style={{color:'var(--text)'}}>
                  {p.price}
                  <span className="text-xs font-normal text-gray-500">/mo</span>
                </span>
              </div>

              <div className="text-xs mb-4 space-y-1" style={{color:'var(--text2)'}}>
                <div>· {p.users} · {p.contractors}</div>
                {p.features.map(f => <div key={f}>· {f}</div>)}
              </div>

              {!isCurrent && (
                <Btn
                  onClick={() => handleCheckout(p.key)}
                  size="sm"
                  className="w-full"
                  variant={p.popular ? 'primary' : 'ghost'}
                >
                  Upgrade to {p.name}
                </Btn>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────
export function ProfilePage() {
  const { user, org, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-3 border-b" style={{borderColor:'var(--border)'}}>
      <span className="text-xs font-semibold uppercase tracking-wider" style={{color:'var(--text3)'}}>{label}</span>
      <span className="text-sm" style={{color:'var(--text)'}}>{value}</span>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6" style={{color:'var(--text)'}}>⚙ Profile & Settings</h1>

      <div className="flex items-center gap-4 mb-6 p-4 rounded-xl"
        style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
          style={{background:'var(--blue)'}}>
          {(user?.first_name?.[0]||'') + (user?.last_name?.[0]||'')}
        </div>

        <div>
          <div className="text-base font-bold" style={{color:'var(--text)'}}>
            {user?.first_name} {user?.last_name}
          </div>
          <div className="text-xs" style={{color:'var(--text2)'}}>{user?.email}</div>
          <div className="text-xs mt-0.5 capitalize" style={{color:'var(--text3)'}}>
            {user?.role} · {org?.name}
          </div>
        </div>
      </div>

      <Card className="mb-4">
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Role" value={user?.role} />
        <InfoRow label="Organisation" value={org?.name} />
        <InfoRow label="Plan" value={org?.tier?.replace('_',' ')} />
        <InfoRow label="MFA" value={user?.mfa_enabled ? '✅ Enabled' : '❌ Disabled'} />
      </Card>

      <div className="space-y-3">
        <Btn variant="ghost" size="lg" className="w-full" onClick={() => navigate('/settings/billing')}>
          💳 Billing & Plan
        </Btn>

        <Btn variant="ghost" size="lg" className="w-full" onClick={() => navigate('/settings/referrals')}>
          🎁 Refer & Earn — $20 per referral
        </Btn>

        <Btn variant="danger" size="lg" className="w-full" onClick={handleLogout}>
          Sign out
        </Btn>
      </div>
    </div>
  );
}

// ── CONTRACTORS ───────────────────────────────────────
export function ContractorsPage() {
  const { data, loading, refetch } = useData(() => contractorAPI.list(), []);

  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName:'', lastName:'', email:'', visaType:'h1b', billRate:'', payRate:''
  });

  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState('');

  const contractors = data?.contractors || [];

  const handleAdd = async () => {
    setSaving(true);
    setErr('');

    try {
      await contractorAPI.create({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        visa_type: formData.visaType,
        default_bill_rate: parseFloat(formData.billRate) || 0,
        default_pay_rate: parseFloat(formData.payRate) || 0,
      });

      setShowForm(false);
      setFormData({ firstName:'', lastName:'', email:'', visaType:'h1b', billRate:'', payRate:'' });
      refetch();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{color:'var(--text)'}}>👤 Contractors</h1>
        <Btn onClick={() => setShowForm(!showForm)} size="sm">+ Add contractor</Btn>
      </div>

      {showForm && (
        <Card className="mb-5">
          <ErrorAlert message={err} />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input label="First name" value={formData.firstName}
              onChange={e => setFormData(p=>({...p,firstName:e.target.value}))} />

            <Input label="Last name" value={formData.lastName}
              onChange={e => setFormData(p=>({...p,lastName:e.target.value}))} />

            <Input label="Email" type="email" value={formData.email}
              onChange={e => setFormData(p=>({...p,email:e.target.value}))} />

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest"
                style={{color:'var(--text3)'}}>Visa type</label>

              <select
                value={formData.visaType}
                onChange={e => setFormData(p=>({...p,visaType:e.target.value}))}
                className="rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{background:'var(--elevated)', border:'1px solid var(--border)', color:'var(--text)'}}
              >
                {['h1b','opt','ead','gc','citizen','tn','other'].map(v =>
                  <option key={v} value={v}>{v.toUpperCase()}</option>
                )}
              </select>
            </div>

            <Input label="Bill rate ($/hr)" type="number"
              value={formData.billRate}
              onChange={e => setFormData(p=>({...p,billRate:e.target.value}))} />

            <Input label="Pay rate ($/hr)" type="number"
              value={formData.payRate}
              onChange={e => setFormData(p=>({...p,payRate:e.target.value}))} />
          </div>

          <div className="flex gap-3 mt-4">
            <Btn onClick={() => setShowForm(false)} variant="ghost">Cancel</Btn>
            <Btn onClick={handleAdd} loading={saving}>Save contractor</Btn>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm" style={{color:'var(--text3)'}}>Loading…</div>
      ) : contractors.length === 0 ? (
        <Empty icon="👤" title="No contractors yet"
          desc="Add your first contractor to start tracking placements."
          action={() => setShowForm(true)} actionLabel="Add contractor"
        />
      ) : (
        <div className="space-y-2">
          {contractors.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl"
              style={{background:'var(--surface)', border:'1px solid var(--border)'}}>

              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{background:'var(--blue)'}}>
                {(c.first_name?.[0]||'')+(c.last_name?.[0]||'')}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{color:'var(--text)'}}>
                  {c.first_name} {c.last_name}
                </div>
                <div className="text-xs" style={{color:'var(--text2)'}}>{c.email}</div>
              </div>

              <Badge label={c.visa_type?.toUpperCase()||'—'} type="blue" />

              <div className="text-xs font-mono text-right" style={{color:'var(--text3)'}}>
                <div>Bill: ${c.default_bill_rate||0}/hr</div>
                <div>Pay: ${c.default_pay_rate||0}/hr</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CLIENTS ───────────────────────────────────────────
export function ClientsPage() {
  const { data, loading, refetch } = useData(() => clientAPI.list(), []);

  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name:'', contactName:'', contactEmail:'', industry:'technology'
  });

  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState('');

  const clients = data?.clients || [];

  const handleAdd = async () => {
    setSaving(true);
    setErr('');

    try {
      await clientAPI.create({
        name: formData.name,
        primary_contact_name: formData.contactName,
        primary_contact_email: formData.contactEmail,
        industry: formData.industry,
      });

      setShowForm(false);
      setFormData({ name:'', contactName:'', contactEmail:'', industry:'technology' });
      refetch();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{color:'var(--text)'}}>🏢 Clients</h1>
        <Btn onClick={() => setShowForm(!showForm)} size="sm">+ Add client</Btn>
      </div>

      {showForm && (
        <Card className="mb-5">
          <ErrorAlert message={err} />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input label="Company name" value={formData.name}
              onChange={e => setFormData(p=>({...p,name:e.target.value}))} />

            <Input label="Contact name" value={formData.contactName}
              onChange={e => setFormData(p=>({...p,contactName:e.target.value}))} />

            <Input label="Contact email" type="email" value={formData.contactEmail}
              onChange={e => setFormData(p=>({...p,contactEmail:e.target.value}))} />
          </div>

          <div className="flex gap-3 mt-4">
            <Btn onClick={() => setShowForm(false)} variant="ghost">Cancel</Btn>
            <Btn onClick={handleAdd} loading={saving}>Save client</Btn>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm" style={{color:'var(--text3)'}}>Loading…</div>
      ) : clients.length === 0 ? (
        <Empty icon="🏢" title="No clients yet"
          desc="Add your first client to start tracking health and revenue."
          action={() => setShowForm(true)} actionLabel="Add client"
        />
      ) : (
        <div className="space-y-2">
          {clients.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl"
              style={{background:'var(--surface)', border:'1px solid var(--border)'}}>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{color:'var(--text)'}}>{c.name}</div>
                <div className="text-xs" style={{color:'var(--text2)'}}>
                  {c.primary_contact_name} · {c.primary_contact_email}
                </div>
              </div>

              <div className="text-xs font-mono text-right" style={{color:'var(--text3)'}}>
                <div>{c.active_placements||0} placements</div>
                <div>${((c.monthly_revenue||0)/1000).toFixed(1)}K/mo</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── REFERRALS ─────────────────────────────────────────
export function ReferralsPage() {
  const { user } = useAuth();
  const referralLink = `https://plaxiq.com?ref=${user?.id?.slice(0,8)||'xxxxx'}`;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2" style={{color:'var(--text)'}}>🎁 Refer & Earn</h1>
      <p className="text-sm mb-6" style={{color:'var(--text2)'}}>
        Earn $20 credit for every IT staffing firm you refer to Plaxiq.
      </p>

      <Card className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'var(--text3)'}}>
          Your referral link
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg"
          style={{background:'var(--elevated)', border:'1px solid var(--border)'}}>
          <span className="flex-1 text-sm font-mono truncate" style={{color:'var(--text)'}}>
            {referralLink}
          </span>

          <Btn size="sm" variant="ghost"
            onClick={() => navigator.clipboard.writeText(referralLink)}>
            Copy
          </Btn>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[['$20','Per referral'],['Unlimited','Referrals'],['Instant','Credit applied']].map(([v,l]) => (
          <Card key={l}>
            <div className="text-2xl font-black mb-1" style={{color:'var(--blue)'}}>{v}</div>
            <div className="text-xs" style={{color:'var(--text3)'}}>{l}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
