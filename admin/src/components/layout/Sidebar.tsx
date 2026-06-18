import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Layers, Newspaper,
  Mail, Kanban, BarChart2, Activity, HeartPulse,
  Users, Globe, ChevronDown, LogOut, Menu, X, Zap,
  DollarSign, CreditCard, Landmark, Target, UserCheck
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  to: string;
  label: string;
  Icon: React.ElementType;
  roles?: ('ADMIN' | 'EDITOR' | 'VIEWER')[];
  badge?: string;
}

const NAV: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
    ]
  },
  {
    label: 'Conteúdo',
    items: [
      { to: '/conteudo/hero', label: 'Hero / Home', Icon: Zap, roles: ['ADMIN', 'EDITOR'] },
      { to: '/conteudo/sobre', label: 'Sobre / Equipe', Icon: Users, roles: ['ADMIN', 'EDITOR'] },
      { to: '/conteudo/servicos', label: 'Serviços', Icon: Layers, roles: ['ADMIN', 'EDITOR'] },
      { to: '/conteudo/blog', label: 'Blog / Notícias', Icon: Newspaper, roles: ['ADMIN', 'EDITOR'] },
      { to: '/conteudo/leads', label: 'Leads', Icon: Mail, badge: 'NEW' },
    ]
  },
  {
    label: 'Financeiro',
    items: [
      { to: '/financeiro',           label: 'Visão Geral',      Icon: DollarSign,  roles: ['ADMIN'] },
      { to: '/financeiro/doacoes',   label: 'Doações',          Icon: CreditCard,  roles: ['ADMIN'] },
      { to: '/financeiro/doadores',  label: 'Doadores',         Icon: UserCheck,   roles: ['ADMIN'] },
      { to: '/financeiro/bancario',  label: 'APIs Bancárias',   Icon: Landmark,    roles: ['ADMIN'] },
      { to: '/financeiro/metas',     label: 'Metas',            Icon: Target,      roles: ['ADMIN'] },
    ]
  },
  {
    label: 'Gestão',
    items: [
      { to: '/pipeline', label: 'Pipeline Kanban', Icon: Kanban },
      { to: '/analytics', label: 'Analytics', Icon: BarChart2 },
      { to: '/auditoria', label: 'Auditoria', Icon: Activity, roles: ['ADMIN'] },
      { to: '/health', label: 'Health Check', Icon: HeartPulse },
    ]
  },
  {
    label: 'Configurações',
    items: [
      { to: '/configuracoes', label: 'Site & SEO', Icon: Globe, roles: ['ADMIN'] },
      { to: '/usuarios', label: 'Usuários', Icon: Users, roles: ['ADMIN'] },
    ]
  },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const canSee = (item: NavItem): boolean => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role as any);
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'all 0.2s'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #16a34a, #4ade80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <img src="/logo-ism.png" alt="ISM" style={{ width: 24, height: 24, objectFit: 'contain' }} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>ISM Admin</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Painel Gestor</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {NAV.map(group => {
          const visibleItems = group.items.filter(canSee);
          if (!visibleItems.length) return null;
          return (
            <div key={group.label} style={{ marginBottom: 8 }}>
              {!collapsed && (
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)',
                  padding: '8px 12px 4px'
                }}>
                  {group.label}
                </div>
              )}
              {visibleItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center',
                    gap: 10, padding: collapsed ? '10px 14px' : '9px 12px',
                    borderRadius: 10, marginBottom: 2,
                    textDecoration: 'none', transition: 'all 0.15s',
                    background: isActive ? 'rgba(34,197,94,0.15)' : 'transparent',
                    color: isActive ? '#4ade80' : 'rgba(255,255,255,0.55)',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    position: 'relative'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div style={{
                          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                          width: 3, height: '60%', background: '#16a34a',
                          borderRadius: '0 4px 4px 0'
                        }} />
                      )}
                      <item.Icon size={17} style={{ flexShrink: 0 }} />
                      {!collapsed && (
                        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, flex: 1 }}>
                          {item.label}
                        </span>
                      )}
                      {!collapsed && item.badge && (
                        <span style={{
                          background: '#ef4444', color: 'white', fontSize: 9,
                          fontWeight: 800, padding: '2px 5px', borderRadius: 20
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '8px' : '10px 12px',
          borderRadius: 12, background: 'rgba(255,255,255,0.05)',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <img
            src={user?.avatarUrl}
            alt={user?.name}
            style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
          />
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{
                display: 'inline-block', marginTop: 2,
                background: user?.role === 'ADMIN' ? 'rgba(34,197,94,0.2)' : user?.role === 'EDITOR' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)',
                color: user?.role === 'ADMIN' ? '#4ade80' : user?.role === 'EDITOR' ? '#60a5fa' : '#c084fc',
                padding: '1px 6px', borderRadius: 20, fontSize: 9, fontWeight: 800, textTransform: 'uppercase'
              }}>
                {user?.role}
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 4, borderRadius: 6 }}
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        width: collapsed ? 68 : 'var(--sidebar-w)',
        background: 'var(--sidebar-bg)',
        height: '100vh', position: 'fixed', left: 0, top: 0,
        zIndex: 40, transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.04)'
      }}
        className="hidden-mobile"
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', right: -12, top: 72,
            width: 24, height: 24, borderRadius: '50%',
            background: '#1e2130', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1, transition: 'all 0.2s'
          }}
        >
          {collapsed ? <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronDown size={12} style={{ transform: 'rotate(90deg)' }} />}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile: Hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="show-mobile"
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 50,
          width: 40, height: 40, borderRadius: 10,
          background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <Menu size={18} />
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileOpen(false)} />
          <aside style={{
            position: 'relative', width: 260, background: 'var(--sidebar-bg)',
            height: '100%', display: 'flex', flexDirection: 'column',
            animation: 'slideIn 0.25s ease'
          }}>
            <button onClick={() => setMobileOpen(false)} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', borderRadius: 8, padding: 6, cursor: 'pointer'
            }}>
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <style>{`
        .hidden-mobile { display: flex !important; }
        .show-mobile { display: none !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
};
