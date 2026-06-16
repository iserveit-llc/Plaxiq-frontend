import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../hooks';
import { billingAPI, contractorAPI, clientAPI } from '../../utils/api';

import {
  Card,
  Btn,
  Empty
} from '../../components/shared/UI';

/* ───────────────────────── BILLING ───────────────────────── */

const PLANS = [
  { key:'starter', name:'Starter', price:'$29.99', users:'2 users', contractors:'10 contractors' },
  { key:'growth', name:'Growth', price:'$49.99', users:'5 users', contractors:'50 contractors' },
  { key:'scale', name:'Scale', price:'$99.99', users:'15 users', contractors:'150 contractors' },
  { key:'agency_pro', name:'Agency Pro', price:'$199.99', users:'Unlimited', contractors:'Unlimited' },
];

export function BillingPage() {
  const { org } = useAuth();

  const handlePortal = async () => {
    try {
      const r = await billingAPI.portal();
      if (r.url) window.location.href = r.url;
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCheckout = async (tier) => {
    try {
      const r = await billingAPI.checkout({ tier, interval: 'monthly' });
      if (r.url) window.location.href = r.url;
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1>Billing</h1>

      <Card>
        <div>Current plan: {org?.tier || 'trial'}</div>
        <Btn onClick={handlePortal}>Manage billing</Btn>
      </Card>

      <div className="grid gap-4 mt-4">
        {PLANS.map(p => {
          const isCurrent = org?.tier === p.key;

          return (
            <div key={p.key} className="p-4 border rounded">
              <div className="font-bold">{p.name}</div>
              <div>{p.price}</div>

              <div className="text-xs mt-2">
                {p.users} · {p.contractors}
              </div>

              {!isCurrent && (
                <Btn onClick={() => handleCheckout(p.key)}>
                  Upgrade
                </Btn>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── PROFILE ───────────────────────── */

export function ProfilePage() {
  const { user, org, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1>Profile</h1>

      <Card>
        <div>{user?.first_name} {user?.last_name}</div>
        <div>{user?.email}</div>
        <div>{org?.name}</div>
      </Card>

      <div className="space-y-3 mt-4">
        <Btn onClick={() => navigate('/settings/billing')}>
          Billing
        </Btn>

        <Btn variant="danger" onClick={handleLogout}>
          Sign out
        </Btn>
      </div>
    </div>
  );
}

/* ───────────────────────── CONTRACTORS ───────────────────────── */

export function ContractorsPage() {
  const { data, loading } = useData(() => contractorAPI.list(), []);

  const contractors = data?.contractors || [];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1>Contractors</h1>

      {loading ? (
        <div>Loading...</div>
      ) : contractors.length === 0 ? (
        <Empty icon="👤" title="No contractors" />
      ) : (
        contractors.map(c => (
          <div key={c.id} className="p-3 border rounded mb-2">
            <div>{c.first_name} {c.last_name}</div>
            <div className="text-xs">{c.email}</div>
          </div>
        ))
      )}
    </div>
  );
}

/* ───────────────────────── CLIENTS ───────────────────────── */

export function ClientsPage() {
  const { data, loading } = useData(() => clientAPI.list(), []);

  const clients = data?.clients || [];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1>Clients</h1>

      {loading ? (
        <div>Loading...</div>
      ) : clients.length === 0 ? (
        <Empty icon="🏢" title="No clients" />
      ) : (
        clients.map(c => (
          <div key={c.id} className="p-3 border rounded mb-2">
            <div>{c.name}</div>
            <div className="text-xs">{c.primary_contact_name}</div>
          </div>
        ))
      )}
    </div>
  );
}

/* ───────────────────────── REFERRALS ───────────────────────── */

export function ReferralsPage() {
  const { user } = useAuth();

  const referralLink =
    `https://plaxiq.com?ref=${user?.id?.slice(0,8) || 'xxxxx'}`;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1>Refer & Earn</h1>

      <Card>
        <div className="font-mono text-sm">
          {referralLink}
        </div>
      </Card>
    </div>
  );
}
