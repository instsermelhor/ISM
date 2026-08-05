/**
 * CommunityExpansionPage.tsx — G001, G002, G003 & E002: Gestão de Expansão Institucional
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * Painel Administrativo do ISM com 4 abas:
 *   - Famílias Assistidas (G002) — cadastros, aprovações, benefícios
 *   - Voluntários & Horas (G003) — validação de horas sociais, certificados
 *   - Mapa de Atuação (G001) — presença nacional por município e pilar
 *   - Parceiros ESG (E002) — candidaturas corporativas e Tiers
 */

import React, { useState } from 'react';
import {
  HeartHandshake,
  Award,
  MapPin,
  Building2,
  CheckCircle2,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-react';

// ── Tipos locais ──────────────────────────────────────────────────────────────

type FamilyStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'SUSPENDED';
type BenefitType = 'CESTA_ALIMENTAR' | 'APOIO_PSICOSSOCIAL' | 'REFORCO_ESCOLAR' | 'KIT_MATERIAL_ESCOLAR';

interface FamilyRecord {
  id: string;
  protocolNumber: string;
  responsibleName: string;
  cpf: string;
  nis?: string;
  phone: string;
  city: string;
  state: string;
  familyMembersCount: number;
  monthlyIncomePerCapita: number;
  status: FamilyStatus;
  registeredAt: string;
  benefits: { id: string; type: BenefitType; title: string; status: string }[];
}

interface ActivityLog {
  id: string;
  opportunityTitle: string;
  date: string;
  hoursSpent: number;
  status: 'APROVADO' | 'PENDENTE';
  description: string;
}

interface VolunteerRecord {
  id: string;
  registrationNumber: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  areasOfInterest: string[];
  totalHoursApproved: number;
  totalHoursPending: number;
  registeredAt: string;
  activityLogs: ActivityLog[];
}

interface MunicipalityRecord {
  id: string;
  name: string;
  state: string;
  region: string;
  primaryPillar: string;
  beneficiaries: number;
  projects: number;
  sroi: number;
  since: number;
}

// ── Dados Iniciais ─────────────────────────────────────────────────────────────

const INIT_FAMILIES: FamilyRecord[] = [
  {
    id: 'ben-001', protocolNumber: 'ISM-FAM-2026-0104', responsibleName: 'Maria das Graças Silva',
    cpf: '123.456.789-00', nis: '128.49021.10-4', phone: '(11) 98765-4321',
    city: 'São Paulo', state: 'SP', familyMembersCount: 4, monthlyIncomePerCapita: 340.0,
    status: 'ACTIVE', registeredAt: '2025-03-15',
    benefits: [{ id: 'b1', type: 'CESTA_ALIMENTAR', title: 'Cesta Nutricional Mensal', status: 'DISPONIVEL' }],
  },
  {
    id: 'ben-002', protocolNumber: 'ISM-FAM-2026-0842', responsibleName: 'Carlos Eduardo Oliveira',
    cpf: '987.654.321-11', nis: '109.87654.32-1', phone: '(11) 97777-6666',
    city: 'São Paulo', state: 'SP', familyMembersCount: 3, monthlyIncomePerCapita: 500.0,
    status: 'UNDER_REVIEW', registeredAt: '2026-08-05',
    benefits: [{ id: 'b2', type: 'CESTA_ALIMENTAR', title: 'Cesta Emergencial', status: 'EM_PROCESSAMENTO' }],
  },
  {
    id: 'ben-003', protocolNumber: 'ISM-FAM-2026-0315', responsibleName: 'Joana Ferreira Lima',
    cpf: '456.123.789-33', phone: '(31) 99321-7788',
    city: 'Belo Horizonte', state: 'MG', familyMembersCount: 5, monthlyIncomePerCapita: 280.0,
    status: 'UNDER_REVIEW', registeredAt: '2026-08-01',
    benefits: [
      { id: 'b3', type: 'APOIO_PSICOSSOCIAL', title: 'Atendimento Psicossocial', status: 'EM_PROCESSAMENTO' },
      { id: 'b4', type: 'REFORCO_ESCOLAR', title: 'Reforço Escolar', status: 'EM_PROCESSAMENTO' },
    ],
  },
];

const INIT_VOLUNTEERS: VolunteerRecord[] = [
  {
    id: 'vol-001', registrationNumber: 'ISM-VOL-2026-0014', name: 'Ana Beatriz Souza',
    email: 'voluntario@exemplo.com', phone: '(11) 99887-7665', cpf: '321.654.987-00',
    areasOfInterest: ['EDUCACAO', 'TECNOLOGIA'], totalHoursApproved: 42, totalHoursPending: 4,
    registeredAt: '2025-02-10',
    activityLogs: [
      { id: 'l1', opportunityTitle: 'Educador de Reforço Escolar', date: '2026-08-04', hoursSpent: 4, status: 'PENDENTE', description: 'Revisão de matemática para prova.' },
      { id: 'l2', opportunityTitle: 'Mentor de Tecnologia', date: '2026-07-28', hoursSpent: 3, status: 'APROVADO', description: 'Aula online de introdução ao HTML.' },
    ],
  },
  {
    id: 'vol-002', registrationNumber: 'ISM-VOL-2026-0027', name: 'Fernando Guimarães',
    email: 'fernando@exemplo.com', phone: '(11) 91111-2222', cpf: '111.222.333-44',
    areasOfInterest: ['MEIO_AMBIENTE'], totalHoursApproved: 18, totalHoursPending: 6,
    registeredAt: '2026-02-20',
    activityLogs: [
      { id: 'l3', opportunityTitle: 'Mutirão de Plantio — Cerrado em Pé', date: '2026-08-03', hoursSpent: 6, status: 'PENDENTE', description: 'Plantio de 200 mudas nativas.' },
      { id: 'l4', opportunityTitle: 'Mutirão de Plantio — Cerrado em Pé', date: '2026-07-20', hoursSpent: 6, status: 'APROVADO', description: 'Recuperação de nascente.' },
    ],
  },
];

const INIT_MUNICIPALITIES: MunicipalityRecord[] = [
  { id: 'manaus-am', name: 'Manaus', state: 'AM', region: 'NORTE', primaryPillar: 'AMBIENTAL', beneficiaries: 4800, projects: 6, sroi: 4.8, since: 2012 },
  { id: 'belem-pa', name: 'Belém', state: 'PA', region: 'NORTE', primaryPillar: 'AMBIENTAL', beneficiaries: 3200, projects: 4, sroi: 4.1, since: 2015 },
  { id: 'fortaleza-ce', name: 'Fortaleza', state: 'CE', region: 'NORDESTE', primaryPillar: 'SOCIAL', beneficiaries: 6100, projects: 8, sroi: 4.5, since: 2009 },
  { id: 'natal-rn', name: 'Natal', state: 'RN', region: 'NORDESTE', primaryPillar: 'EDUCACAO', beneficiaries: 2400, projects: 3, sroi: 3.9, since: 2017 },
  { id: 'recife-pe', name: 'Recife', state: 'PE', region: 'NORDESTE', primaryPillar: 'CULTURAL', beneficiaries: 5200, projects: 7, sroi: 4.2, since: 2010 },
  { id: 'salvador-ba', name: 'Salvador', state: 'BA', region: 'NORDESTE', primaryPillar: 'CULTURAL', beneficiaries: 7400, projects: 9, sroi: 4.6, since: 2008 },
  { id: 'goiania-go', name: 'Goiânia', state: 'GO', region: 'CENTRO_OESTE', primaryPillar: 'AMBIENTAL', beneficiaries: 3800, projects: 5, sroi: 4.0, since: 2014 },
  { id: 'belo-horizonte-mg', name: 'Belo Horizonte', state: 'MG', region: 'SUDESTE', primaryPillar: 'SOCIAL', beneficiaries: 8200, projects: 11, sroi: 4.7, since: 2007 },
  { id: 'sao-paulo-sp', name: 'São Paulo', state: 'SP', region: 'SUDESTE', primaryPillar: 'SOCIAL', beneficiaries: 9100, projects: 13, sroi: 4.9, since: 2009 },
  { id: 'rio-de-janeiro-rj', name: 'Rio de Janeiro', state: 'RJ', region: 'SUDESTE', primaryPillar: 'CULTURAL', beneficiaries: 6800, projects: 9, sroi: 4.3, since: 2011 },
  { id: 'curitiba-pr', name: 'Curitiba', state: 'PR', region: 'SUL', primaryPillar: 'AMBIENTAL', beneficiaries: 4100, projects: 6, sroi: 4.2, since: 2013 },
  { id: 'porto-alegre-rs', name: 'Porto Alegre', state: 'RS', region: 'SUL', primaryPillar: 'EDUCACAO', beneficiaries: 3600, projects: 5, sroi: 4.0, since: 2016 },
];

const PILLAR_COLORS: Record<string, string> = {
  SOCIAL: '#3b82f6', AMBIENTAL: '#22c55e', EDUCACAO: '#f59e0b', CULTURAL: '#a855f7',
};

// ── Componente Principal ──────────────────────────────────────────────────────

type ActiveTab = 'FAMILIES' | 'VOLUNTEERS' | 'MAP' | 'ESG';

export const CommunityExpansionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('FAMILIES');
  const [families, setFamilies] = useState<FamilyRecord[]>(INIT_FAMILIES);
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>(INIT_VOLUNTEERS);

  const handleApproveFamily = (id: string) => {
    setFamilies(prev => prev.map(b => b.id === id ? { ...b, status: 'ACTIVE' as FamilyStatus } : b));
  };

  const handleApproveHours = (volId: string, logId: string) => {
    setVolunteers(prev => prev.map(v => {
      if (v.id !== volId) return v;
      let delta = 0;
      const logs = v.activityLogs.map(l => {
        if (l.id === logId && l.status === 'PENDENTE') { delta = l.hoursSpent; return { ...l, status: 'APROVADO' as const }; }
        return l;
      });
      return { ...v, activityLogs: logs, totalHoursApproved: v.totalHoursApproved + delta, totalHoursPending: Math.max(0, v.totalHoursPending - delta) };
    }));
  };

  const totalBeneficiaries = INIT_MUNICIPALITIES.reduce((a, m) => a + m.beneficiaries, 0);
  const underReview = families.filter(f => f.status === 'UNDER_REVIEW').length;
  const pendingHours = volunteers.reduce((a, v) => a + v.totalHoursPending, 0);

  return (
    <div style={{ padding: 28, background: 'var(--bg-main, #0b0f19)', minHeight: '100vh', color: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartHandshake size={24} color="#4ade80" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Expansão Institucional & Comunidade</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>G001 · G002 · G003 · E002 — Painel Gestor Integrado</p>
          </div>
        </div>

        {/* KPIs rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 20 }}>
          {[
            { label: 'Famílias em Análise', value: underReview, color: '#fbbf24', icon: <Clock size={18} /> },
            { label: 'Horas a Validar', value: `${pendingHours}h`, color: '#c084fc', icon: <Award size={18} /> },
            { label: 'Municípios Ativos', value: INIT_MUNICIPALITIES.length, color: '#60a5fa', icon: <MapPin size={18} /> },
            { label: 'Beneficiários Total', value: totalBeneficiaries.toLocaleString('pt-BR'), color: '#4ade80', icon: <Users size={18} /> },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ color: kpi.color }}>{kpi.icon}</span>
                {kpi.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: kpi.color, fontFamily: 'monospace' }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {([
          { key: 'FAMILIES', label: `Famílias (${families.length})`, color: '#4ade80', icon: <HeartHandshake size={15} />, badge: underReview ? `${underReview} pendentes` : null },
          { key: 'VOLUNTEERS', label: `Voluntários (${volunteers.length})`, color: '#c084fc', icon: <Award size={15} />, badge: pendingHours ? `${pendingHours}h a validar` : null },
          { key: 'MAP', label: `Mapa de Atuação (${INIT_MUNICIPALITIES.length})`, color: '#60a5fa', icon: <MapPin size={15} />, badge: null },
          { key: 'ESG', label: 'Parceiros ESG', color: '#fbbf24', icon: <Building2 size={15} />, badge: null },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as ActiveTab)}
            style={{
              background: activeTab === t.key ? `${t.color}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === t.key ? t.color : 'rgba(255,255,255,0.1)'}`,
              color: activeTab === t.key ? t.color : 'rgba(255,255,255,0.6)',
              borderRadius: 12, padding: '9px 16px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}
          >
            {t.icon} {t.label}
            {t.badge && <span style={{ background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ── TAB 1: FAMÍLIAS ASSISTIDAS (G002) ─────────────────────────────────── */}
      {activeTab === 'FAMILIES' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Famílias Assistidas — Cadastro e Aprovações</h3>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              Ativos: <strong style={{ color: '#4ade80' }}>{families.filter(f => f.status === 'ACTIVE').length}</strong>&nbsp;|&nbsp;
              Em Análise: <strong style={{ color: '#fbbf24' }}>{families.filter(f => f.status === 'UNDER_REVIEW').length}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {families.map(f => (
              <div key={f.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${f.status === 'ACTIVE' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>{f.responsibleName}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{f.protocolNumber}</span>
                    <span style={{ background: f.status === 'ACTIVE' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)', color: f.status === 'ACTIVE' ? '#4ade80' : '#fbbf24', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                      {f.status === 'ACTIVE' ? 'ATIVO' : 'EM ANÁLISE'}
                    </span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 4 }}>
                    CPF: {f.cpf} {f.nis ? `| NIS: ${f.nis}` : ''} | Tel: {f.phone}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                    {f.city}/{f.state} · {f.familyMembersCount} pessoas · Renda per capita: <strong style={{ color: '#4ade80' }}>R$ {f.monthlyIncomePerCapita.toFixed(2)}/mês</strong>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {f.benefits.map(b => (
                      <span key={b.id} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '3px 8px', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                        {b.title} — <span style={{ color: b.status === 'DISPONIVEL' ? '#4ade80' : '#fbbf24' }}>{b.status}</span>
                      </span>
                    ))}
                  </div>
                </div>
                {f.status === 'UNDER_REVIEW' && (
                  <button onClick={() => handleApproveFamily(f.id)} style={{ background: '#22c55e', color: '#0f172a', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <CheckCircle2 size={16} /> Aprovar Cadastro
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: VOLUNTÁRIOS & VALIDAÇÃO DE HORAS (G003) ────────────────────── */}
      {activeTab === 'VOLUNTEERS' && (
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 18 }}>Voluntários Registrados & Validação de Horas Sociais</h3>
          {volunteers.map(v => (
            <div key={v.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>{v.name}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#c084fc' }}>{v.registrationNumber}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{v.email} | CPF: {v.cpf}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {v.areasOfInterest.map(a => (
                      <span key={a} style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{a}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>APROVADAS</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace' }}>{v.totalHoursApproved}h</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>PENDENTES</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace' }}>{v.totalHoursPending}h</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Lançamentos de Horas</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {v.activityLogs.map(log => (
                    <div key={log.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{log.opportunityTitle}</span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginLeft: 8 }}>{log.date} — {log.description}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>+{log.hoursSpent}h</span>
                        {log.status === 'PENDENTE' ? (
                          <button onClick={() => handleApproveHours(v.id, log.id)} style={{ background: '#22c55e', color: '#0f172a', border: 'none', borderRadius: 6, padding: '5px 12px', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                            Validar Horas
                          </button>
                        ) : (
                          <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 700 }}>✓ VALIDADAS</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: MAPA DE ATUAÇÃO (G001) ─────────────────────────────────────── */}
      {activeTab === 'MAP' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Municípios de Atuação Nacional</h3>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              Total: <strong style={{ color: '#60a5fa' }}>{INIT_MUNICIPALITIES.length}</strong> municípios · {totalBeneficiaries.toLocaleString('pt-BR')} beneficiários
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {INIT_MUNICIPALITIES.map(m => {
              const pillarColor = PILLAR_COLORS[m.primaryPillar] || '#6b7280';
              return (
                <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${pillarColor}44`, borderRadius: 14, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>{m.name} / {m.state}</span>
                    <span style={{ background: `${pillarColor}22`, color: pillarColor, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{m.primaryPillar}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                    Região: {m.region} · Desde {m.since}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, marginTop: 8 }}>
                    <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>Beneficiários</span><br /><strong style={{ color: '#4ade80' }}>{m.beneficiaries.toLocaleString('pt-BR')}</strong></div>
                    <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>Projetos</span><br /><strong style={{ color: '#60a5fa' }}>{m.projects}</strong></div>
                    <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>SROI</span><br /><strong style={{ color: '#fbbf24' }}>{m.sroi}×</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: PARCEIROS ESG (E002) ────────────────────────────────────────── */}
      {activeTab === 'ESG' && (
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 18 }}>Candidaturas de Parceiros Corporativos ESG</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { tier: 'Tier 1 — Estratégico', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.35)', desc: 'Aporte ≥ R$ 50K/ano | SROI mínimo 4.5× | Engajamento pleno com metas ESG da ONU', investment: 'R$ 50.000+/ano', open: true },
              { tier: 'Tier 2 — Mantenedor', color: '#60a5fa', borderColor: 'rgba(96,165,250,0.35)', desc: 'Aporte de R$ 20K–50K/ano | Visibilidade em eventos e relatórios institucionais', investment: 'R$ 20.000–50.000/ano', open: true },
              { tier: 'Tier 3 — Apoiador Local', color: '#4ade80', borderColor: 'rgba(34,197,94,0.35)', desc: 'Aporte até R$ 20K/ano | Apoio pontual em ações e eventos comunitários locais', investment: 'Até R$ 20.000/ano', open: true },
            ].map(tier => (
              <div key={tier.tier} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${tier.borderColor}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: tier.color }}>{tier.tier}</span>
                  <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10 }}>VAGAS ABERTAS</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '0 0 14px', lineHeight: 1.6 }}>{tier.desc}</p>
                <div style={{ fontSize: 13, color: tier.color, fontWeight: 700, marginBottom: 14 }}>
                  <TrendingUp size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  {tier.investment}
                </div>
                <button style={{ background: `${tier.color}22`, border: `1px solid ${tier.borderColor}`, color: tier.color, borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  Ver Candidaturas
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
