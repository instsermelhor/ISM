import React, { useState, useMemo } from 'react';
import {
  Plus, Trash2, Search, Shield, Eye, Edit3, Crown,
  CheckCircle, XCircle, Clock, Send, RefreshCw,
  Lock, Unlock, ChevronDown, AlertTriangle, Copy,
  UserCheck, UserX, Users, Key, Bell, Activity
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

interface Permission {
  module: string;
  key: string;
  label: string;
  admin: boolean;
  editor: boolean;
  viewer: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  department: string;
  phone?: string;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
  invitedBy?: string;
  twoFactorEnabled: boolean;
  customPermissions: string[]; // extra permission keys granted beyond role
  restrictedPermissions: string[]; // permission keys revoked within role
  notes?: string;
}

interface Invite {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  sentBy: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  detail: string;
  ip: string;
  at: string;
}

// ─── Permission Matrix ────────────────────────────────────────────────────────
const PERMISSIONS: Permission[] = [
  // Conteúdo
  { module: 'Conteúdo', key: 'content.hero.view',       label: 'Ver Hero/Home',            admin: true,  editor: true,  viewer: true  },
  { module: 'Conteúdo', key: 'content.hero.edit',       label: 'Editar Hero/Home',         admin: true,  editor: true,  viewer: false },
  { module: 'Conteúdo', key: 'content.about.view',      label: 'Ver Sobre & Equipe',       admin: true,  editor: true,  viewer: true  },
  { module: 'Conteúdo', key: 'content.about.edit',      label: 'Editar Sobre & Equipe',    admin: true,  editor: true,  viewer: false },
  { module: 'Conteúdo', key: 'content.services.view',   label: 'Ver Serviços',             admin: true,  editor: true,  viewer: true  },
  { module: 'Conteúdo', key: 'content.services.edit',   label: 'Editar Serviços',          admin: true,  editor: true,  viewer: false },
  { module: 'Conteúdo', key: 'content.blog.view',       label: 'Ver Blog',                 admin: true,  editor: true,  viewer: true  },
  { module: 'Conteúdo', key: 'content.blog.publish',    label: 'Publicar Posts',           admin: true,  editor: false, viewer: false },
  { module: 'Conteúdo', key: 'content.blog.draft',      label: 'Criar/Editar Rascunhos',  admin: true,  editor: true,  viewer: false },
  // Financeiro
  { module: 'Financeiro', key: 'financial.view',        label: 'Ver Painel Financeiro',    admin: true,  editor: false, viewer: false },
  { module: 'Financeiro', key: 'financial.donations',   label: 'Ver Doações',              admin: true,  editor: false, viewer: false },
  { module: 'Financeiro', key: 'financial.donors',      label: 'Ver Doadores',             admin: true,  editor: false, viewer: false },
  { module: 'Financeiro', key: 'financial.banking',     label: 'APIs Bancárias',           admin: true,  editor: false, viewer: false },
  { module: 'Financeiro', key: 'financial.goals',       label: 'Metas Financeiras',        admin: true,  editor: false, viewer: false },
  // Analytics
  { module: 'Analytics', key: 'analytics.view',         label: 'Ver Analytics',            admin: true,  editor: true,  viewer: true  },
  { module: 'Analytics', key: 'analytics.export',       label: 'Exportar Dados',           admin: true,  editor: false, viewer: false },
  // Leads
  { module: 'Leads',     key: 'leads.view',             label: 'Ver Leads',                admin: true,  editor: true,  viewer: false },
  { module: 'Leads',     key: 'leads.reply',            label: 'Responder Leads',          admin: true,  editor: true,  viewer: false },
  { module: 'Leads',     key: 'leads.delete',           label: 'Excluir Leads',            admin: true,  editor: false, viewer: false },
  // Gestão
  { module: 'Gestão',    key: 'mgmt.pipeline',          label: 'Pipeline Editorial',       admin: true,  editor: true,  viewer: false },
  { module: 'Gestão',    key: 'mgmt.audit',             label: 'Log de Auditoria',         admin: true,  editor: false, viewer: false },
  { module: 'Gestão',    key: 'mgmt.health',            label: 'Saúde do Sistema',         admin: true,  editor: false, viewer: false },
  // Usuários
  { module: 'Usuários',  key: 'users.view',             label: 'Ver Usuários',             admin: true,  editor: false, viewer: false },
  { module: 'users',     key: 'users.invite',           label: 'Convidar Usuários',        admin: true,  editor: false, viewer: false },
  { module: 'Usuários',  key: 'users.edit',             label: 'Editar Usuários',          admin: true,  editor: false, viewer: false },
  { module: 'Usuários',  key: 'users.delete',           label: 'Excluir Usuários',         admin: true,  editor: false, viewer: false },
  // Configurações
  { module: 'Config',    key: 'settings.view',          label: 'Ver Configurações',        admin: true,  editor: false, viewer: false },
  { module: 'Config',    key: 'settings.edit',          label: 'Editar Configurações',     admin: true,  editor: false, viewer: false },
];

const MODULES = [...new Set(PERMISSIONS.map(p => p.module))];

// ─── Default data ─────────────────────────────────────────────────────────────
const SEED_USERS: AdminUser[] = [
  {
    id: '1', name: 'Rikardo Ribeiro', email: 'admin@institutosermelhor.org',
    role: 'ADMIN', status: 'ACTIVE', department: 'Diretoria',
    avatarUrl: 'https://ui-avatars.com/api/?name=Rikardo+Ribeiro&background=16a34a&color=fff&size=80',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    loginCount: 342, createdAt: '2024-01-01', invitedBy: 'Sistema',
    twoFactorEnabled: true, customPermissions: [], restrictedPermissions: [], notes: 'Fundador e Administrador Principal.',
  },
  {
    id: '2', name: 'Ana Lima', email: 'ana.lima@institutosermelhor.org',
    role: 'EDITOR', status: 'ACTIVE', department: 'Comunicação',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Lima&background=3b82f6&color=fff&size=80',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    loginCount: 87, createdAt: '2024-02-15', invitedBy: 'Rikardo Ribeiro',
    twoFactorEnabled: false, customPermissions: ['financial.view'], restrictedPermissions: [],
    notes: 'Responsável pelo blog e mídias sociais.',
  },
  {
    id: '3', name: 'Carlos Mendes', email: 'carlos.mendes@institutosermelhor.org',
    role: 'EDITOR', status: 'ACTIVE', department: 'Programas',
    avatarUrl: 'https://ui-avatars.com/api/?name=Carlos+Mendes&background=8b5cf6&color=fff&size=80',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    loginCount: 45, createdAt: '2024-03-01', invitedBy: 'Rikardo Ribeiro',
    twoFactorEnabled: true, customPermissions: [], restrictedPermissions: ['content.blog.draft'],
  },
  {
    id: '4', name: 'Sofia Costa', email: 'sofia.costa@institutosermelhor.org',
    role: 'VIEWER', status: 'ACTIVE', department: 'Pesquisa',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sofia+Costa&background=f59e0b&color=fff&size=80',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    loginCount: 12, createdAt: '2024-04-10', invitedBy: 'Rikardo Ribeiro',
    twoFactorEnabled: false, customPermissions: ['analytics.view'], restrictedPermissions: [],
  },
  {
    id: '5', name: 'Pedro Alves', email: 'pedro.alves@institutosermelhor.org',
    role: 'VIEWER', status: 'INACTIVE',
    department: 'Voluntários',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    loginCount: 3, createdAt: '2024-05-20', invitedBy: 'Ana Lima',
    twoFactorEnabled: false, customPermissions: [], restrictedPermissions: [],
  },
];

const SEED_INVITES: Invite[] = [
  { id: 'i1', email: 'novo.editor@parceiro.com', role: 'EDITOR', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 69).toISOString(), status: 'PENDING', sentBy: 'Rikardo Ribeiro' },
  { id: 'i2', email: 'consultor@externo.org', role: 'VIEWER', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'EXPIRED', sentBy: 'Ana Lima' },
];

const SEED_LOGS: ActivityLog[] = [
  { id: 'l1', userId: '1', userName: 'Rikardo Ribeiro', action: 'LOGIN', detail: 'Login bem-sucedido com 2FA.', ip: '189.100.xx.xx', at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'l2', userId: '2', userName: 'Ana Lima', action: 'CONTENT_EDIT', detail: 'Editou seção Hero/Home.', ip: '200.140.xx.xx', at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'l3', userId: '1', userName: 'Rikardo Ribeiro', action: 'USER_INVITE', detail: 'Convidou novo.editor@parceiro.com como EDITOR.', ip: '189.100.xx.xx', at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: 'l4', userId: '3', userName: 'Carlos Mendes', action: 'POST_PUBLISH', detail: 'Publicou post "Relatório de Impacto 2024".', ip: '201.100.xx.xx', at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 'l5', userId: '4', userName: 'Sofia Costa', action: 'LOGIN', detail: 'Login sem 2FA.', ip: '177.200.xx.xx', at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string; icon: React.ReactNode; description: string }> = {
  ADMIN:  { label: 'Admin',  color: '#b45309', bg: '#fef3c7', icon: <Crown size={12} />,  description: 'Acesso total a todos os módulos e configurações.' },
  EDITOR: { label: 'Editor', color: '#1d4ed8', bg: '#eff6ff', icon: <Edit3 size={12} />,  description: 'Cria e edita conteúdo. Sem acesso financeiro ou a usuários.' },
  VIEWER: { label: 'Viewer', color: '#166534', bg: '#f0fdf4', icon: <Eye size={12} />,    description: 'Somente leitura. Ideal para consultores externos.' },
};

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ACTIVE:    { label: 'Ativo',      color: '#166534', bg: '#f0fdf4', icon: <CheckCircle size={11} /> },
  INACTIVE:  { label: 'Inativo',    color: '#6b7280', bg: '#f3f4f6', icon: <XCircle size={11} /> },
  PENDING:   { label: 'Pendente',   color: '#92400e', bg: '#fef3c7', icon: <Clock size={11} /> },
  SUSPENDED: { label: 'Suspenso',   color: '#991b1b', bg: '#fff1f2', icon: <Lock size={11} /> },
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
const iS: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'white' };
const tS: React.CSSProperties = { ...iS, resize: 'vertical', minHeight: 72, lineHeight: 1.6 };
const bPri: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.3)', transition: 'all 0.15s' };
const bSec: React.CSSProperties = { ...bPri, background: 'white', color: '#374151', boxShadow: 'none', border: '1px solid #e5e7eb' };
const bDan: React.CSSProperties = { ...bPri, background: '#fff1f2', color: '#ef4444', boxShadow: 'none', border: '1px solid #fecdd3' };

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', ...style }}>{children}</div>
);

const F: React.FC<{ label: string; hint?: string; required?: boolean; children: React.ReactNode }> = ({ label, hint, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
      {hint && <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>— {hint}</span>}
    </label>
    {children}
  </div>
);

const Badge: React.FC<{ label: string; color: string; bg: string; icon?: React.ReactNode }> = ({ label, color, bg, icon }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, color, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
    {icon}{label}
  </span>
);

function timeAgo(iso?: string): string {
  if (!iso) return 'Nunca';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora mesmo';
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} dias atrás`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

// ─── User Modal ───────────────────────────────────────────────────────────────
const UserModal: React.FC<{
  user: Partial<AdminUser> | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (u: AdminUser) => void;
}> = ({ user, isNew, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<AdminUser>>(user || { role: 'VIEWER', status: 'ACTIVE', customPermissions: [], restrictedPermissions: [], twoFactorEnabled: false, department: '', loginCount: 0, createdAt: new Date().toISOString().split('T')[0] });
  const [activeSection, setActiveSection] = useState<'info' | 'permissions'>('info');
  const set = (k: keyof AdminUser, v: any) => setForm(p => ({ ...p, [k]: v }));
  const role = (form.role ?? 'VIEWER') as Role;

  const effectivePerms = useMemo(() => {
    return PERMISSIONS.map(p => {
      const base = role === 'ADMIN' ? p.admin : role === 'EDITOR' ? p.editor : p.viewer;
      const extra = (form.customPermissions ?? []).includes(p.key);
      const revoked = (form.restrictedPermissions ?? []).includes(p.key);
      const effective = revoked ? false : extra ? true : base;
      return { ...p, base, extra, revoked, effective };
    });
  }, [form.customPermissions, form.restrictedPermissions, role]);

  const toggleCustom = (key: string, hasBase: boolean) => {
    if (hasBase) {
      // Revoke from base
      const revoked = form.restrictedPermissions ?? [];
      set('restrictedPermissions', revoked.includes(key) ? revoked.filter(k => k !== key) : [...revoked, key]);
    } else {
      // Grant beyond base
      const custom = form.customPermissions ?? [];
      set('customPermissions', custom.includes(key) ? custom.filter(k => k !== key) : [...custom, key]);
    }
  };

  const handleSave = () => {
    if (!form.name?.trim() || !form.email?.trim()) { alert('Nome e e-mail são obrigatórios.'); return; }
    onSave({ ...form as AdminUser, id: form.id ?? Date.now().toString() });
  };

  const grouped = MODULES.map(mod => ({ mod, perms: effectivePerms.filter(p => p.module === mod) }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 80px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#111827' }}>{isNew ? '👤 Novo Usuário' : '✏️ Editar Usuário'}</h2>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6b7280' }}>{isNew ? 'Preencha os dados e defina as permissões' : `Editando: ${form.email}`}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1 }}>✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, padding: '16px 28px 0' }}>
          {(['info', 'permissions'] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: activeSection === s ? '#16a34a' : '#f3f4f6', color: activeSection === s ? 'white' : '#6b7280', transition: 'all 0.15s' }}>
              {s === 'info' ? '📋 Informações' : '🔑 Permissões'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {activeSection === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <F label="Nome Completo" required><input value={form.name ?? ''} onChange={e => set('name', e.target.value)} style={iS} placeholder="Ex: Ana Lima" /></F>
                <F label="E-mail" required><input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} style={iS} placeholder="email@institutosermelhor.org" /></F>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <F label="Papel (Role)">
                  <select value={form.role} onChange={e => set('role', e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                    {(['ADMIN', 'EDITOR', 'VIEWER'] as Role[]).map(r => (
                      <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                    ))}
                  </select>
                </F>
                <F label="Status">
                  <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                    {(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] as UserStatus[]).map(s => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </F>
                <F label="Departamento"><input value={form.department ?? ''} onChange={e => set('department', e.target.value)} style={iS} placeholder="Ex: Comunicação" /></F>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <F label="Telefone" hint="opcional"><input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} style={iS} placeholder="+55 11 9..." /></F>
                <F label="URL do Avatar" hint="opcional"><input value={form.avatarUrl ?? ''} onChange={e => set('avatarUrl', e.target.value)} style={iS} placeholder="https://..." /></F>
              </div>
              <F label="Notas Internas" hint="Visível apenas para admins"><textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} style={tS} placeholder="Observações sobre este usuário..." /></F>

              {/* Role description */}
              <div style={{ background: ROLE_CONFIG[role].bg, border: `1px solid ${ROLE_CONFIG[role].color}30`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: ROLE_CONFIG[role].color, fontSize: 20 }}>{role === 'ADMIN' ? '👑' : role === 'EDITOR' ? '✏️' : '👁️'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: ROLE_CONFIG[role].color }}>{ROLE_CONFIG[role].label}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{ROLE_CONFIG[role].description}</div>
                </div>
              </div>

              {/* 2FA toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={16} color="#16a34a" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Autenticação em 2 Fatores (2FA)</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>Aumenta a segurança da conta contra acessos não autorizados</div>
                  </div>
                </div>
                <button onClick={() => set('twoFactorEnabled', !form.twoFactorEnabled)}
                  style={{ width: 44, height: 24, borderRadius: 99, border: 'none', background: form.twoFactorEnabled ? '#16a34a' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: form.twoFactorEnabled ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>
          )}

          {activeSection === 'permissions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                  Permissões herdadas do papel <strong>{ROLE_CONFIG[role].label}</strong>. Você pode conceder permissões adicionais (<span style={{ color: '#16a34a', fontWeight: 700 }}>verde</span>) ou revogar as padrão (<span style={{ color: '#ef4444', fontWeight: 700 }}>vermelho</span>).
                </p>
              </div>

              {grouped.map(({ mod, perms }) => (
                <div key={mod} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ background: '#f9fafb', padding: '10px 14px', fontWeight: 800, fontSize: 12, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{mod}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {perms.map((p, i) => (
                      <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < perms.length - 1 ? '1px solid #f3f4f6' : 'none', background: p.effective ? p.extra ? '#f0fdf4' : 'white' : p.revoked ? '#fff1f2' : 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.effective ? '#16a34a' : '#d1d5db', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: '#374151' }}>{p.label}</span>
                          {p.extra && <span style={{ background: '#dcfce7', color: '#166534', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>+EXTRA</span>}
                          {p.revoked && <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>REVOGADO</span>}
                          {p.base && !p.extra && !p.revoked && <span style={{ background: '#f3f4f6', color: '#6b7280', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 99 }}>PADRÃO</span>}
                        </div>
                        <button onClick={() => toggleCustom(p.key, p.base)}
                          style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', ...(p.base ? { borderColor: p.revoked ? '#bbf7d0' : '#fecdd3', background: p.revoked ? '#f0fdf4' : '#fff1f2', color: p.revoked ? '#166534' : '#ef4444' } : { borderColor: p.extra ? '#fecdd3' : '#bbf7d0', background: p.extra ? '#fff1f2' : '#f0fdf4', color: p.extra ? '#ef4444' : '#166534' }) }}>
                          {p.base ? (p.revoked ? '+ Restaurar' : '- Revogar') : (p.extra ? '- Remover' : '+ Conceder')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            {(form.customPermissions?.length ?? 0) > 0 && <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 8 }}>+{form.customPermissions?.length} permissão(ões) extra(s)</span>}
            {(form.restrictedPermissions?.length ?? 0) > 0 && <span style={{ color: '#ef4444', fontWeight: 700 }}>{form.restrictedPermissions?.length} revogação(ões)</span>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={bSec}>Cancelar</button>
            <button onClick={handleSave} style={bPri}><CheckCircle size={14} />{isNew ? 'Criar Usuário' : 'Salvar Alterações'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Invite Modal ─────────────────────────────────────────────────────────────
const InviteModal: React.FC<{ onClose: () => void; onSend: (i: Invite) => void }> = ({ onClose, onSend }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('EDITOR');
  const [sent, setSent] = useState(false);
  const [link] = useState(`https://admin.institutosermelhor.org/invite/${Math.random().toString(36).slice(2)}`);

  const handleSend = () => {
    if (!email.includes('@')) { alert('E-mail inválido.'); return; }
    setSent(true);
    onSend({ id: Date.now().toString(), email, role, sentAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), status: 'PENDING', sentBy: 'Rikardo Ribeiro' });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#16a34a,#4ade80)', padding: '24px 28px' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>✉️</div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'white' }}>Convidar Novo Usuário</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Um link de acesso será enviado por e-mail por 72 horas</p>
        </div>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!sent ? (
            <>
              <F label="E-mail do Convidado" required><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={iS} placeholder="novo.usuario@email.com" autoFocus /></F>
              <F label="Papel (Role)">
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['ADMIN', 'EDITOR', 'VIEWER'] as Role[]).map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      style={{ flex: 1, padding: '10px 4px', borderRadius: 10, border: `2px solid ${role === r ? ROLE_CONFIG[r].color : '#e5e7eb'}`, background: role === r ? ROLE_CONFIG[r].bg : 'white', color: role === r ? ROLE_CONFIG[r].color : '#6b7280', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span>{r === 'ADMIN' ? '👑' : r === 'EDITOR' ? '✏️' : '👁️'}</span>
                      {ROLE_CONFIG[r].label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, padding: '6px 10px', background: ROLE_CONFIG[role].bg, borderRadius: 8 }}>{ROLE_CONFIG[role].description}</div>
              </F>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={onClose} style={{ ...bSec, flex: 1, justifyContent: 'center' }}>Cancelar</button>
                <button onClick={handleSend} style={{ ...bPri, flex: 1, justifyContent: 'center' }}><Send size={14} /> Enviar Convite</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28 }}>✅</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 6 }}>Convite enviado!</div>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>O link expira em 72 horas. Você também pode copiá-lo manualmente:</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px' }}>
                <code style={{ flex: 1, fontSize: 10, color: '#374151', wordBreak: 'break-all', textAlign: 'left' }}>{link}</code>
                <button onClick={() => navigator.clipboard.writeText(link)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }}><Copy size={14} /></button>
              </div>
              <button onClick={onClose} style={{ ...bPri, margin: '16px auto 0', display: 'flex' }}>Fechar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(SEED_USERS);
  const [invites, setInvites] = useState<Invite[]>(SEED_INVITES);
  const [logs] = useState<ActivityLog[]>(SEED_LOGS);
  const [activeTab, setActiveTab] = useState<'users' | 'invites' | 'matrix' | 'activity'>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [showNewUser, setShowNewUser] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [matrixRole, setMatrixRole] = useState<Role>('EDITOR');

  const filtered = useMemo(() => users.filter(u =>
    (u.name + u.email + u.department).toLowerCase().includes(search.toLowerCase()) &&
    (!roleFilter || u.role === roleFilter) &&
    (!statusFilter || u.status === statusFilter)
  ), [users, search, roleFilter, statusFilter]);

  const saveUser = (u: AdminUser) => {
    setUsers(prev => prev.some(x => x.id === u.id) ? prev.map(x => x.id === u.id ? u : x) : [...prev, u]);
    setEditUser(null); setShowNewUser(false);
  };
  const deleteUser = (id: string) => { if (!confirm('Excluir permanentemente este usuário?')) return; setUsers(prev => prev.filter(u => u.id !== id)); };
  const toggleStatus = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u));
  const resendInvite = (id: string) => setInvites(prev => prev.map(i => i.id === id ? { ...i, sentAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), status: 'PENDING' } : i));
  const cancelInvite = (id: string) => { if (!confirm('Cancelar este convite?')) return; setInvites(prev => prev.filter(i => i.id !== id)); };

  const stats = [
    { label: 'Total de Usuários', value: users.length, icon: <Users size={16} />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Ativos', value: users.filter(u => u.status === 'ACTIVE').length, icon: <UserCheck size={16} />, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Convites Pendentes', value: invites.filter(i => i.status === 'PENDING').length, icon: <Bell size={16} />, color: '#d97706', bg: '#fef3c7' },
    { label: 'Com 2FA Ativo', value: users.filter(u => u.twoFactorEnabled).length, icon: <Shield size={16} />, color: '#7c3aed', bg: '#f5f3ff' },
  ];

  const TABS = [
    { id: 'users' as const, label: '👥 Usuários', count: users.length },
    { id: 'invites' as const, label: '✉️ Convites', count: invites.filter(i => i.status === 'PENDING').length },
    { id: 'matrix' as const, label: '🔑 Matriz RBAC', count: null },
    { id: 'activity' as const, label: '📊 Atividade', count: logs.length },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Modals */}
      {(showNewUser || editUser) && (
        <UserModal user={editUser ?? {}} isNew={showNewUser} onClose={() => { setEditUser(null); setShowNewUser(false); }} onSave={saveUser} />
      )}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSend={inv => { setInvites(p => [...p, inv]); setShowInvite(false); }} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0 }}>👥 Gestão de Usuários</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Gerencie equipe, papéis RBAC, permissões granulares e convites de acesso</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowInvite(true)} style={bSec}><Send size={14} /> Convidar</button>
          <button onClick={() => setShowNewUser(true)} style={bPri}><Plus size={14} /> Novo Usuário</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, overflow: 'hidden' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, fontWeight: 600 }}>{s.label}</div></div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 5, background: 'white', padding: 5, borderRadius: 14, border: '1px solid #e5e7eb', marginBottom: 16, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', transition: 'all 0.18s', background: activeTab === t.id ? '#16a34a' : 'transparent', color: activeTab === t.id ? 'white' : '#6b7280', boxShadow: activeTab === t.id ? '0 2px 8px rgba(22,163,74,0.28)' : 'none' }}>
            {t.label}
            {t.count !== null && <span style={{ background: activeTab === t.id ? 'rgba(255,255,255,0.25)' : '#e5e7eb', color: activeTab === t.id ? 'white' : '#374151', borderRadius: 99, padding: '1px 6px', fontSize: 10, fontWeight: 800 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ══ USERS ══ */}
      {activeTab === 'users' && (
        <Card>
          {/* Filters */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou departamento…" style={{ ...iS, paddingLeft: 32 }} />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} style={{ ...iS, width: 130, cursor: 'pointer' }}>
              <option value="">Todos os papéis</option>
              {(['ADMIN', 'EDITOR', 'VIEWER'] as Role[]).map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} style={{ ...iS, width: 140, cursor: 'pointer' }}>
              <option value="">Todos os status</option>
              {(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] as UserStatus[]).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Usuário', 'Papel', 'Departamento', 'Último Acesso', 'Status', '2FA', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const rc = ROLE_CONFIG[u.role];
                  const sc = STATUS_CONFIG[u.status];
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {/* User */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u.avatarUrl
                            ? <img src={u.avatarUrl} alt={u.name} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            : <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
                          }
                          <div>
                            <div style={{ fontWeight: 700, color: '#111827' }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: '#6b7280' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td style={{ padding: '14px 16px' }}>
                        <Badge label={rc.label} color={rc.color} bg={rc.bg} icon={rc.icon} />
                        {(u.customPermissions.length > 0 || u.restrictedPermissions.length > 0) && (
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>
                            {u.customPermissions.length > 0 && <span style={{ color: '#16a34a' }}>+{u.customPermissions.length} extra </span>}
                            {u.restrictedPermissions.length > 0 && <span style={{ color: '#ef4444' }}>-{u.restrictedPermissions.length} revogado</span>}
                          </div>
                        )}
                      </td>
                      {/* Dept */}
                      <td style={{ padding: '14px 16px', color: '#374151' }}>{u.department}</td>
                      {/* Last login */}
                      <td style={{ padding: '14px 16px', color: '#6b7280', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {timeAgo(u.lastLoginAt)}
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{u.loginCount} logins</div>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}><Badge label={sc.label} color={sc.color} bg={sc.bg} icon={sc.icon} /></td>
                      {/* 2FA */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {u.twoFactorEnabled
                          ? <span title="2FA Ativo"><Shield size={16} color="#16a34a" /></span>
                          : <span title="Sem 2FA"><Shield size={16} color="#d1d5db" /></span>}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditUser(u); setShowNewUser(false); }} title="Editar"
                            style={{ ...bSec, padding: '6px 10px' }}><Edit3 size={13} /></button>
                          <button onClick={() => toggleStatus(u.id)} title={u.status === 'ACTIVE' ? 'Suspender' : 'Reativar'}
                            style={{ ...bSec, padding: '6px 10px', color: u.status === 'ACTIVE' ? '#ef4444' : '#16a34a', borderColor: u.status === 'ACTIVE' ? '#fecdd3' : '#bbf7d0', background: u.status === 'ACTIVE' ? '#fff1f2' : '#f0fdf4' }}>
                            {u.status === 'ACTIVE' ? <Lock size={13} /> : <Unlock size={13} />}
                          </button>
                          <button onClick={() => deleteUser(u.id)} title="Excluir" style={{ ...bDan, padding: '6px 10px' }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>Nenhum usuário encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ══ INVITES ══ */}
      {activeTab === 'invites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Convites Enviados</div>
              <button onClick={() => setShowInvite(true)} style={bPri}><Plus size={13} /> Novo Convite</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {invites.map(inv => {
                const rc = ROLE_CONFIG[inv.role];
                const isExpired = inv.status === 'EXPIRED' || new Date(inv.expiresAt) < new Date();
                const isAccepted = inv.status === 'ACCEPTED';
                const statusLabel = isAccepted ? 'Aceito' : isExpired ? 'Expirado' : 'Pendente';
                const statusColor = isAccepted ? '#16a34a' : isExpired ? '#ef4444' : '#d97706';
                const statusBg = isAccepted ? '#f0fdf4' : isExpired ? '#fff1f2' : '#fef3c7';
                return (
                  <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fafafa', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✉️</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{inv.email}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Enviado por {inv.sentBy} · {timeAgo(inv.sentAt)}</div>
                        <div style={{ fontSize: 11, color: isExpired ? '#ef4444' : '#9ca3af', marginTop: 1 }}>
                          Expira: {new Date(inv.expiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge label={rc.label} color={rc.color} bg={rc.bg} />
                      <Badge label={statusLabel} color={statusColor} bg={statusBg} />
                      {!isAccepted && (
                        <>
                          {!isExpired && <button onClick={() => resendInvite(inv.id)} style={{ ...bSec, padding: '6px 10px', fontSize: 11 }}><RefreshCw size={12} /> Reenviar</button>}
                          <button onClick={() => cancelInvite(inv.id)} style={{ ...bDan, padding: '6px 10px', fontSize: 11 }}><Trash2 size={12} /></button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {invites.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 14 }}>Nenhum convite enviado.</div>}
            </div>
          </Card>
        </div>
      )}

      {/* ══ RBAC MATRIX ══ */}
      {activeTab === 'matrix' && (
        <Card>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Matriz de Permissões RBAC</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Visão comparativa das permissões por papel. Clique no papel para detalhar.</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['ADMIN', 'EDITOR', 'VIEWER'] as Role[]).map(r => (
                <button key={r} onClick={() => setMatrixRole(r)}
                  style={{ padding: '6px 14px', borderRadius: 10, border: `2px solid ${matrixRole === r ? ROLE_CONFIG[r].color : '#e5e7eb'}`, background: matrixRole === r ? ROLE_CONFIG[r].bg : 'white', color: matrixRole === r ? ROLE_CONFIG[r].color : '#6b7280', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {ROLE_CONFIG[r].label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 200 }}>Módulo / Permissão</th>
                  {(['ADMIN', 'EDITOR', 'VIEWER'] as Role[]).map(r => (
                    <th key={r} style={{ padding: '10px 20px', textAlign: 'center', fontWeight: 700, color: ROLE_CONFIG[r].color, borderBottom: '1px solid #e5e7eb', background: ROLE_CONFIG[r].bg, opacity: matrixRole === r ? 1 : 0.5 }}>
                      {ROLE_CONFIG[r].label}
                      <div style={{ fontSize: 10, fontWeight: 400, color: '#6b7280' }}>{users.filter(u => u.role === r).length} usuário(s)</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(mod => (
                  <React.Fragment key={mod}>
                    <tr><td colSpan={4} style={{ padding: '10px 16px 4px', fontWeight: 800, fontSize: 11, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb' }}>{mod}</td></tr>
                    {PERMISSIONS.filter(p => p.module === mod).map((p, i, arr) => (
                      <tr key={p.key} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : '1px solid #e5e7eb' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '9px 16px', color: '#374151' }}>{p.label}</td>
                        {(['admin', 'editor', 'viewer'] as const).map(rk => {
                          const role = rk.toUpperCase() as Role;
                          const has = p[rk];
                          return (
                            <td key={rk} style={{ padding: '9px 20px', textAlign: 'center', opacity: matrixRole === role ? 1 : 0.4 }}>
                              {has
                                ? <CheckCircle size={16} color="#16a34a" />
                                : <XCircle size={16} color="#d1d5db" />}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div style={{ padding: '14px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}><CheckCircle size={14} color="#16a34a" /> Permissão incluída no papel</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}><XCircle size={14} color="#d1d5db" /> Sem acesso (pode ser concedido individualmente)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}><Key size={14} color="#7c3aed" /> Permissão extra pode ser delegada na tela do usuário</div>
          </div>
        </Card>
      )}

      {/* ══ ACTIVITY ══ */}
      {activeTab === 'activity' && (
        <Card>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Log de Atividades</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Registro de ações dos usuários no painel</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9ca3af' }}>
              <Activity size={13} /> {logs.length} eventos
            </div>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {logs.map((l, i) => {
              const u = users.find(x => x.id === l.userId);
              return (
                <div key={l.id} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < logs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    {u?.avatarUrl
                      ? <img src={u.avatarUrl} alt={l.userName} style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>}
                    {i < logs.length - 1 && <div style={{ width: 1, flex: 1, background: '#f3f4f6', marginTop: 6 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: i < logs.length - 1 ? 0 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>
                        {l.userName}
                        <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 6 }}>— {l.detail}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>{timeAgo(l.at)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }}>{l.action}</span>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>IP: {l.ip}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
