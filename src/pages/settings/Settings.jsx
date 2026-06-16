import React from 'react';
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
  { key:'starter', name:'Starter', price:'$29.99', users:'2 users', contractors:'10 contractors', features:['All 4 modules','Mobile app'] },
  { key:'growth', name:'Growth', price:'$49.99', users:'5 users', contractors:'50 contractors', features:['Pulse AI','ATS sync'], popular:true },
  { key:'scale', name:'Scale', price:'$99.99', users:'15 users', contractors:'150 contractors', features:['White-label reports','Priority support'] },
  { key:'agency_pro', name:'Agency Pro', price:'$199.99', users:'Unlimited', contractors:'Unlimited', features:['Full API access','Dedicated CSM'] },
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
      <h1 className="text-xl font-bold mb-1">💳 Billing & Plan</h1>
      <p className="text-xs mb-6">One price for your whole team — not per seat</p>

      <Card className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase mb-1">Current plan</div>
          <div className="text-lg font-bold capitalize">
            {org?.tier?.replace('_',' ') || 'Trial'}
          </div>
          <div className="text-xs mt-0.5 capitalize">
            {org?.status || 'trialing'}
          </div>
        </div>
        <Btn onClick={handlePortal} variant="ghost">Manage billing →</Btn>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map(p => {
          const isCurrent = org?.tier === p.key;

          return (
            <div key={p.key} className="p-5 rounded-xl relative">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xl font-black">{p.price}/mo</span>
              </div>

              <div className="text-xs mb-4">
                <div>{p.users} · {p.contractors}</div>
                {p.features.map(f => <div key={f}>· {f}</div>)}
              </div>

              {!isCurrent && (
                <Btn onClick={() => handleCheckout(p.key)} size="sm" className="w-full">
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
    <div className="flex justify-between py-3 border-b">
      <span className="text-xs uppercase">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1>⚙ Profile & Settings</h1>

      <div className="p-4 rounded-xl">
        <div className="text-base font-bold">
          {user?.first_name} {user?.last_name}
        </div>
        <div className="text-xs">{user?.email}</div>
      </div>

      <Card className="mb-4">
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Role" value={user?.role} />
        <InfoRow label="Org" value={org?.name} />
        <InfoRow label="Plan" value={org?.tier?.replace('_',' ')} />
        <InfoRow label="MFA" value={user?.mfa_enabled ? 'Enabled' : 'Disabled'} />
      </Card>

      <div className="space-y-3">
        <Btn onClick={() => navigate('/settings/billing')}>Billing</Btn>
        <Btn variant="danger" onClick={handleLogout}>Sign out</Btn>
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
      <h1>👤 Contractors</h1>

      {showForm && (
        <Card className="mb-5">
          <ErrorAlert message={err} />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input label="First name" value={formData.firstName}
              onChange={e => setFormData(p=>({...p,firstName:e.target.value}))} />

            <Input label="Last name" value={formData.lastName}
              onChange={e => setFormData(p=>({...p,lastName:e.target.value}))} />

            <Input label="Email" value={formData.email}
              onChange={e => setFormData(p=>({...p,email:e.target.value}))} />

            <Input label="Bill rate" type="number"
              value={formData.billRate}
              onChange={e => setFormData(p=>({...p,billRate:e.target.value}))} />

            <Input label="Pay rate" type="number"
              value={formData.payRate}
              onChange={e => setFormData(p=>({...p,payRate:e.target.value}))} />
          </div>

          <div className="flex gap-3 mt-4">
            <Btn onClick={() => setShowForm(false)}>Cancel</Btn>
            <Btn onClick={handleAdd} loading={saving}>Save</Btn>
          </div>
        </Card>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : contractors.length === 0 ? (
        <Empty icon="👤" title="No contractors yet" />
      ) : (
        <div className="space-y-2">
          {contractors.map(c => (
            <div key={c.id} className="p-4 rounded-xl">
              <div className="font-semibold">{c.first_name} {c.last_name}</div>
              <div className="text-xs">{c.email}</div>
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
      <h1>🏢 Clients</h1>

      {loading ? (
        <div>Loading…</div>
      ) : clients.length === 0 ? (
        <Empty icon="🏢" title="No clients yet" />
      ) : (
        <div className="space-y-2">
          {clients.map(c => (
            <div key={c.id} className="p-4 rounded-xl">
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs">{c.primary_contact_name}</div>
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
      <h1>🎁 Refer & Earn</h1>

      <Card>
        <div>{referralLink}</div>
      </Card>
    </div>
  );
}
