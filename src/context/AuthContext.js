import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, api } from '../utils/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [org,  setOrg]      = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const d = await authAPI.me();
      setUser(d.user);
      setOrg({
        id:          d.user.org_id,
        name:        d.user.org_name,
        tier:        d.user.subscription_tier,
        status:      d.user.subscription_status,
        trialEndsAt: d.user.trial_ends_at,
        aiEnabled:   d.user.ai_processing_enabled,
      });
    } catch {
      setUser(null); setOrg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (api.getToken()) loadMe();
    else setLoading(false);
  }, [loadMe]);

  const login = async (creds) => {
    const d = await authAPI.login(creds);
    if (d.mfaRequired) return { mfaRequired: true };
    api.setToken(d.accessToken);
    if (d.refreshToken) localStorage.setItem('plaxiq_refresh', d.refreshToken);
    setUser(d.user);
    setOrg({
      id:          d.user.org_id,
      name:        d.user.org_name,
      tier:        d.user.subscription_tier,
      status:      d.user.subscription_status,
      trialEndsAt: d.user.trial_ends_at,
      aiEnabled:   d.user.ai_processing_enabled,
    });
    return d;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    api.setToken(null);
    setUser(null); setOrg(null);
  };

  const isTrial    = org?.status === 'trialing';
  const isPastDue  = org?.status === 'past_due';
  const isOwner    = user?.role === 'owner';
  const isAdmin    = ['owner','admin'].includes(user?.role);
  const trialDaysLeft = isTrial && org?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(org.trialEndsAt) - Date.now()) / 86400000))
    : null;

  const hasFeature = (f) => {
    const map = {
      pulse_ai:    ['growth','scale','agency_pro'],
      ats_sync:    ['growth','scale','agency_pro'],
      white_label: ['scale','agency_pro'],
    };
    return map[f]?.includes(org?.tier) ?? true;
  };

  return (
    <Ctx.Provider value={{ user, org, loading, login, logout, loadMe,
      isTrial, isPastDue, isOwner, isAdmin, trialDaysLeft, hasFeature }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
};
