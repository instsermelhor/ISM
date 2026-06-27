import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, ExternalLink, Radio } from 'lucide-react';

// URL do site principal — definida em .env.local (dev: localhost:3000)
const SITE_URL: string = (import.meta.env.VITE_SITE_URL as string) || 'http://localhost:3000';
const IS_DEV = import.meta.env.DEV;

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/conteudo/hero': 'Conteúdo / Hero & Home',
  '/conteudo/sobre': 'Conteúdo / Sobre & Equipe',
  '/conteudo/servicos': 'Conteúdo / Serviços',
  '/conteudo/blog': 'Conteúdo / Blog & Notícias',
  '/conteudo/leads': 'Conteúdo / Leads',
  // Financeiro
  '/financeiro': 'Financeiro / Visão Geral',
  '/financeiro/doacoes': 'Financeiro / Doações',
  '/financeiro/doadores': 'Financeiro / Doadores',
  '/financeiro/bancario': 'Financeiro / APIs Bancárias',
  '/financeiro/metas': 'Financeiro / Metas',
  // Gestão
  '/pipeline': 'Gestão / Pipeline Kanban',
  '/analytics': 'Gestão / Analytics',
  '/auditoria': 'Gestão / Auditoria',
  '/health': 'Gestão / Health Check',
  // Configurações
  '/configuracoes': 'Configurações / Site & SEO',
  '/usuarios': 'Configurações / Usuários',
};

const NOTIFICATIONS = [
  { id: 1, text: '4 novos leads aguardam resposta', type: 'warn', time: 'há 10min' },
  { id: 2, text: '"Agenda 2035" entrou em Revisão', type: 'info', time: 'há 1h' },
  { id: 3, text: 'Storage em 72% — atenção', type: 'warn', time: 'há 3h' },
];

interface TopBarProps {
  sidebarCollapsed?: boolean;
}

export const TopBar: React.FC<TopBarProps> = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [time, setTime] = useState(new Date());
  const breadcrumb = BREADCRUMB_MAP[location.pathname] ?? 'Painel';

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <header style={{
      height: 'var(--topbar-h)', background: 'white',
      borderBottom: '1px solid var(--gray-200)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 30
    }}>
      {/* Breadcrumb */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {breadcrumb}
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 1 }}>
          {greeting()}, <span style={{ color: 'var(--gray-900)', fontWeight: 700 }}>{user?.name?.split(' ')[0]}</span> 👋
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--gray-400)', pointerEvents: 'none' }} />
        <input
          placeholder="Busca rápida..."
          style={{
            paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
            border: '1px solid var(--gray-200)', borderRadius: 10,
            fontSize: 12, background: 'var(--gray-50)', outline: 'none',
            width: 180, color: 'var(--gray-700)', fontFamily: 'var(--font-sans)'
          }}
        />
      </div>

      {/* Environment badge */}
      {IS_DEV && (
        <span style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 700, color: '#92400e',
          background: '#fef3c7', border: '1px solid #fcd34d',
          borderRadius: 6, padding: '3px 8px', letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          <Radio size={10} />
          DEV
        </span>
      )}

      {/* View Site — aponta para VITE_SITE_URL */}
      <a
        href={SITE_URL}
        target="_blank"
        rel="noreferrer"
        title={`Abrir site principal (${SITE_URL})`}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 600, color: 'var(--brand-600)',
          textDecoration: 'none', padding: '6px 12px',
          border: '1px solid var(--brand-200)', borderRadius: 8,
          background: 'var(--brand-50)', transition: 'all 0.15s ease'
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'var(--brand-100)';
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--brand-400)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'var(--brand-50)';
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--brand-200)';
        }}
      >
        <ExternalLink size={13} />
        Ver Site
      </a>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowNotif(!showNotif)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: showNotif ? 'var(--gray-100)' : 'transparent',
            border: '1px solid var(--gray-200)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gray-600)', position: 'relative'
          }}
        >
          <Bell size={17} />
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 8, height: 8, borderRadius: '50%',
            background: '#ef4444', border: '2px solid white'
          }} />
        </button>

        {showNotif && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 8,
            width: 300, background: 'white', borderRadius: 14,
            border: '1px solid var(--gray-200)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            overflow: 'hidden', animation: 'scaleIn 0.2s ease'
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Notificações</span>
              <span style={{ fontSize: 11, color: 'var(--brand-600)', fontWeight: 600, cursor: 'pointer' }}>Marcar tudo como lido</span>
            </div>
            {NOTIFICATIONS.map(n => (
              <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-50)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                  background: n.type === 'warn' ? '#f59e0b' : '#3b82f6'
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: 'var(--gray-700)', lineHeight: 1.5 }}>{n.text}</p>
                  <p style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <img
        src={user?.avatarUrl}
        alt={user?.name}
        style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--gray-200)' }}
      />
    </header>
  );
};
