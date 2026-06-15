const BASE = process.env.REACT_APP_API_URL || 'https://api.plaxiq.com/api';

let _token = localStorage.getItem('plaxiq_token');

export const api = {
  setToken(t) {
    _token = t;
    if (t) localStorage.setItem('plaxiq_token', t);
    else { localStorage.removeItem('plaxiq_token'); localStorage.removeItem('plaxiq_refresh'); }
  },
  getToken: () => _token,

  async _req(method, path, body) {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (_token) headers['Authorization'] = `Bearer ${_token}`;
    const res = await fetch(`${BASE}${path}`, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || data.message || 'Request failed');
      err.status = res.status; err.data = data;
      throw err;
    }
    return data;
  },

  get:    (path)       => api._req('GET',    path),
  post:   (path, body) => api._req('POST',   path, body),
  patch:  (path, body) => api._req('PATCH',  path, body),
  delete: (path)       => api._req('DELETE', path),
};

// ── AUTH ──────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login',    data),
  register: (data) => api.post('/auth/register', data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
  forgot:   (email)=> api.post('/auth/forgot-password', { email }),
  reset:    (data) => api.post('/auth/reset-password',  data),
  verifyMFA:(token)=> api.post('/auth/mfa/verify', { token }),
};

// ── REQUIREMENTS ──────────────────────────────────────
export const reqAPI = {
  list:    (p={}) => api.get('/requirements?' + new URLSearchParams(p)),
  heatmap: ()     => api.get('/requirements/heatmap'),
  digest:  ()     => api.get('/requirements/digest'),
  matches: (id)   => api.get(`/requirements/${id}/bench-matches`),
  create:  (d)    => api.post('/requirements', d),
  update:  (id,d) => api.patch(`/requirements/${id}`, d),
  winloss: (id,d) => api.post(`/requirements/${id}/win-loss`, d),
};

// ── PLACEMENTS ────────────────────────────────────────
export const placementAPI = {
  list:   ()     => api.get('/placements'),
  radar:  ()     => api.get('/placements/radar'),
  margin: ()     => api.get('/placements/margin'),
  extend: (id,d) => api.post(`/placements/${id}/extend`, d),
};

// ── CLIENTS ───────────────────────────────────────────
export const clientAPI = {
  list:   ()   => api.get('/clients'),
  get:    (id) => api.get(`/clients/${id}`),
  create: (d)  => api.post('/clients', d),
  update: (id,d) => api.patch(`/clients/${id}`, d),
};

// ── CONTRACTORS ───────────────────────────────────────
export const contractorAPI = {
  list:   ()   => api.get('/contractors'),
  create: (d)  => api.post('/contractors', d),
  update: (id,d) => api.patch(`/contractors/${id}`, d),
};

// ── ORG ───────────────────────────────────────────────
export const orgAPI = {
  me:        ()  => api.get('/organisations/me'),
  dashboard: ()  => api.get('/organisations/health-dashboard'),
  actions:   ()  => api.get('/organisations/action-feed'),
};

// ── PULSE AI ──────────────────────────────────────────
export const pulseAPI = {
  chat:   (d) => api.post('/pulse/chat',   d),
  digest: ()  => api.post('/pulse/digest'),
};

// ── BILLING ───────────────────────────────────────────
export const billingAPI = {
  portal:   ()  => api.post('/billing/portal'),
  checkout: (d) => api.post('/billing/checkout', d),
};

// ── NOTIFICATIONS ─────────────────────────────────────
export const notifAPI = {
  list:    ()   => api.get('/notifications'),
  readAll: ()   => api.patch('/notifications/read-all'),
};
