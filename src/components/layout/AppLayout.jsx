import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to:'/dashboard',        icon:'⬡', label:'Dashboard'       },
  { to:'/modules/hot-reqs', icon:'🔥', label:'Hot Reqs'        },
  { to:'/modules/radar',    icon:'📡', label:'Contract Radar'  },
  { to:'/modules/margin',   icon:'📊', label:'Margin Monitor'  },
  { to:'/modules/health',   icon:'💜', label:'Client Health'   },
  { to:'/modules/pulse',    icon:'✦',  label:'Pulse AI'        },
];

const BOTTOM = [
  { to:'/contractors',       icon:'👤', label:'Contractors'  },
  { to:'/clients',           icon:'🏢', label:'Clients'      },
  { to:'/settings/billing',  icon:'💳', label:'Billing'      },
  { to:'/settings/profile',  icon:'⚙', label:'Settings'     },
];

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg mx-2 text-sm transition-all duration-150 ${
        isActive
          ? 'font-semibold'
          : 'hover:bg-white/5'
      }`
    }
    style={({ isActive }) => isActive
      ? { background:'var(--blue-dim)', color:'var(--blue)', border:'1px solid rgba(59,130,246,0.2)' }
      : { color:'var(--text2)', border:'1px solid transparent' }
    }>
      <span className="text-base w-5 text-center">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export function AppLayout() {
  const { user, org, logout, isTrial, trialDaysLeft } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full" style={{background:'var(--surface)', borderRight:'1px solid var(--border)'}}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{borderColor:'var(--border)'}}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0"
          style={{background:'var(--blue)', boxShadow:'0 4px 12px rgba(59,130,246,0.35)'}}>P</div>
        <div>
          <div className="text-sm font-bold" style={{color:'var(--text)'}}>
            Plax<span style={{color:'var(--teal)'}}>iq</span>
          </div>
          <div className="text-[10px]" style={{color:'var(--text3)'}}>{org?.name || 'Revenue Intelligence'}</div>
        </div>
      </div>

      {/* Trial banner */}
      {isTrial && trialDaysLeft !== null && (
        <div className="mx-3 mt-3">
          <button onClick={() => navigate('/settings/billing')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold"
            style={{
              background: trialDaysLeft <= 3 ? 'rgba(239,68,68,0.1)' : 'var(--blue-dim)',
              border: `1px solid ${trialDaysLeft <= 3 ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.25)'}`,
              color: trialDaysLeft <= 3 ? '#FCA5A5' : '#93C5FD',
            }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{background: trialDaysLeft <= 3 ? 'var(--red)' : 'var(--blue)'}} />
            {trialDaysLeft === 0 ? 'Trial expires today' : `${trialDaysLeft}d left in trial`}
          </button>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
        {NAV.map(n => <SidebarLink key={n.to} {...n} />)}
        <div className="mx-4 my-3 border-t" style={{borderColor:'var(--border)'}} />
        {BOTTOM.map(n => <SidebarLink key={n.to} {...n} />)}
      </nav>

      {/* User footer */}
      <div className="border-t p-3" style={{borderColor:'var(--border)'}}>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{background:'var(--blue)'}}>
            {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{color:'var(--text)'}}>
              {user?.first_name} {user?.last_name}
            </div>
            <div className="text-[10px] truncate capitalize" style={{color:'var(--text3)'}}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="text-xs px-2 py-1 rounded" style={{color:'var(--text3)'}}>
            Out
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{background:'var(--bg)'}}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-56 flex flex-col"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{background:'var(--surface)', borderColor:'var(--border)'}}>
          <button onClick={() => setSidebarOpen(true)} className="text-lg" style={{color:'var(--text2)'}}>☰</button>
          <span className="text-sm font-bold" style={{color:'var(--text)'}}>
            Plax<span style={{color:'var(--teal)'}}>iq</span>
          </span>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-y-auto" style={{background:'var(--bg)'}}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
