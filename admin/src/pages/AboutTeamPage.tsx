import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, RotateCcw, Plus, Trash2, MoveUp, MoveDown,
  CheckCircle, Eye, EyeOff, ChevronDown, ChevronUp, UserCircle2,
  Award, FileText, BarChart2, MapPin, ShieldCheck, Heart, Users, Layers
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { ImageUploadInput } from '../components/ui/ImageUploadInput';
import { InstitutionalFirestoreService } from '../services/institutional';
import {
  InstitutionalEnterpriseService,
  type ImpactIndicator,
  type TransparencyDocument,
  type OrgCertification
} from '../services/institutionalEnterprise';
import { CMSVersionService } from '../services/cmsVersions';
import { useCMSAutosave } from '../hooks/useCMSAutosave';
import { CMSAutosaveBanner } from '../components/cms/CMSAutosaveBanner';
import { CMSVersionHistory } from '../components/cms/CMSVersionHistory';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ValueBlock { id: string; name: string; iconIdentifier: string; description: string; }
interface TimelineMilestone { id: string; year: number; title: string; impactDescription: string; }
interface GovernanceInstance {
  id: string; order: number; title: string; summary: string;
  keyAttributes: { id: string; attributeText: string }[];
}
interface TeamMember {
  id: string; name: string; role: string; type: 'board' | 'executive' | 'advisor';
  bio: string; imageUrl: string;
}
interface NetworkCard { id: string; icon: string; title: string; description: string; }

interface AboutData {
  aboutBadgeText: string;
  aboutImage: string;
  missionStatement: string;
  visionStatement: string;
  valueBlocks: ValueBlock[];
  timelineMilestones: TimelineMilestone[];
  networkIntro: string;
  networkCards: NetworkCard[];
  logoImage: string;
  logoExplanation: string;
  governanceIntro: string;
  governanceInstances: GovernanceInstance[];
  teamMembers: TeamMember[];
}

const DEFAULT: AboutData = {
  aboutBadgeText: 'Sobre Nós',
  aboutImage: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80',
  missionStatement: 'Promover a emancipação humana e o desenvolvimento sustentável, atuando como catalisador de transformações sociais, ambientais, educacionais e culturais, com base em direitos, evidências e impacto mensurável.',
  visionStatement: 'Ser uma organização de referência na construção de um mundo equitativo, próspero e regenerativo, onde o fortalecimento de capacidades e a garantia de direitos reduzam estruturalmente as situações de vulnerabilidade social.',
  valueBlocks: [
    { id: '1', name: 'Excelência com Integridade', iconIdentifier: 'star', description: 'Buscamos a melhoria contínua com rigor técnico, responsabilidade institucional e compromisso permanente com a qualidade de nossas ações e a dignidade das pessoas que atendemos.' },
    { id: '2', name: 'Transparência e Prestação de Contas', iconIdentifier: 'shield', description: 'Operamos com abertura e clareza em todos os processos, tornando públicas nossas decisões, contas e resultados de forma acessível, compreensível e auditável.' },
    { id: '3', name: 'Protagonismo Comunitário', iconIdentifier: 'zap', description: 'Reconhecemos as comunidades como protagonistas de seu próprio desenvolvimento, apoiando processos de fortalecimento de capacidades, autonomia e participação ativa na construção de soluções.' },
    { id: '4', name: 'Compromisso de Longo Prazo', iconIdentifier: 'infinity', description: 'Nossa atuação é orientada para impactos duradouros e estruturais, construindo legados que fortalecem gerações presentes e futuras com base em desenvolvimento sustentável e justiça social.' },
  ],
  timelineMilestones: [
    { id: '1', year: 2007, title: 'Fundação Conceitual', impactDescription: 'Estabelecimento do Instituto a partir da fusão de três fundações líderes e criação da Metodologia M-IS.' },
    { id: '2', year: 2012, title: 'Fundo Perpétuo', impactDescription: 'Alcance da independência operacional com o Fundo F-P, assegurando 100% das doações para programas finalísticos.' },
    { id: '3', year: 2015, title: 'Prêmio Global GEA', impactDescription: 'Recebimento do Global Excellence Award da ONU. A Metodologia M-IS torna-se benchmark global.' },
    { id: '4', year: 2025, title: 'Marco do Milhão', impactDescription: 'Aproximação da meta de impactar um milhão de vidas e lançamento da Agenda 2035.' },
  ],
  networkIntro: 'O Instituto Ser Melhor reconhece que o impacto sustentável se constrói em parceria. Nosso Ecossistema Colaborativo Estratégico reúne organizações nacionais e internacionais comprometidas com o desenvolvimento sustentável e a inovação social.',
  networkCards: [
    { id: '1', icon: '🌐', title: 'Parcerias Acadêmicas e Multilaterais', description: 'Colaboramos com universidades de pesquisa, centros de excelência e agências multilaterais para desenvolver e validar metodologias de impacto social baseadas em evidências.' },
    { id: '2', icon: '🏢', title: 'Parcerias Corporativas com Alinhamento ESG', description: 'Priorizamos parceiros corporativos que demonstrem compromisso com práticas ESG, inclusão social e responsabilidade socioambiental em suas operações.' },
    { id: '3', icon: '🔄', title: 'Intercâmbio com Organizações de Referência', description: 'Programas de cooperação com organizações da sociedade civil nacionais e internacionais para compartilhar conhecimento, boas práticas e metodologias de inovação social.' },
  ],
  logoImage: '/logo-ism.png',
  logoExplanation: 'O emblema circular com três figuras humanas estilizadas representa o nosso compromisso com o Desenvolvimento Sustentável Integral. O arco exterior amarelo simboliza o ciclo da prosperidade e a natureza regenerativa de nosso trabalho.',
  governanceIntro: 'A Governança do Instituto Ser Melhor é uma arquitetura de controle, deliberação e prestação de contas, estruturada para garantir a perpetuidade da missão institucional, a transparência, a integridade, a conformidade e a máxima eficiência na gestão e na alocação dos recursos.',
  governanceInstances: [
    { id: '1', order: 1, title: 'Assembleia Geral de Associados', summary: 'Órgão máximo de deliberação institucional, responsável pelas decisões estratégicas e pela eleição dos demais órgãos de governança, nos termos do Estatuto Social e do Código Civil Brasileiro.', keyAttributes: [{ id: '1a', attributeText: 'Aprova as demonstrações financeiras anuais auditadas por auditoria independente.' }, { id: '1b', attributeText: 'Elege e destitui membros dos Conselhos Deliberativo e Fiscal.' }, { id: '1c', attributeText: 'Delibera alterações estatutárias por quórum qualificado (2/3 dos associados).' }] },
    { id: '2', order: 2, title: 'Conselho Deliberativo', summary: 'Órgão de supervisão e controle estratégico, responsável pela fiscalização da gestão executiva e pela aprovação de políticas institucionais de risco, compliance e integridade.', keyAttributes: [{ id: '2a', attributeText: 'Independência funcional: membros sem vínculos com a gestão executiva.' }, { id: '2b', attributeText: 'Aprova políticas de gestão de riscos e compliance.' }] },
  ],
  teamMembers: [
    { id: '1', name: 'Rikardo Ribeiro', role: 'Presidente do Conselho Deliberativo', type: 'board', bio: 'Referência em conservação e desenvolvimento sustentável.', imageUrl: 'https://picsum.photos/200/200?random=1' },
  ],
};

type ActiveTab = 'identidade' | 'valores' | 'governanca' | 'transparencia' | 'indicadores' | 'certificacoes';

export const AboutTeamPage: React.FC = () => {
  const [data, setData] = useState<AboutData>(DEFAULT);
  const [indicators, setIndicators] = useState<ImpactIndicator[]>([]);
  const [transparencyDocs, setTransparencyDocs] = useState<TransparencyDocument[]>([]);
  const [certifications, setCertifications] = useState<OrgCertification[]>([]);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('identidade');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Autosave
  const autosave = useCMSAutosave('about', data);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [page, vals, gov, time, mems, inds, docs, certs] = await Promise.all([
        InstitutionalFirestoreService.getPage(),
        InstitutionalFirestoreService.getValueBlocks(),
        InstitutionalFirestoreService.getGovernanceInstances(),
        InstitutionalFirestoreService.getTimelineMilestones(),
        InstitutionalFirestoreService.getGovernanceMembers(),
        InstitutionalEnterpriseService.getIndicators(),
        InstitutionalEnterpriseService.getTransparencyDocs(),
        InstitutionalEnterpriseService.getCertifications(),
      ]);

      if (page) {
        setData({
          aboutBadgeText: page.title || DEFAULT.aboutBadgeText,
          aboutImage: page.heroImage || DEFAULT.aboutImage,
          missionStatement: page.missionStatement || DEFAULT.missionStatement,
          visionStatement: page.visionStatement || DEFAULT.visionStatement,
          valueBlocks: vals.length ? vals.map(v => ({ id: v.id!, name: v.name, iconIdentifier: v.iconIdentifier, description: v.description })) : DEFAULT.valueBlocks,
          timelineMilestones: time.length ? time.map(t => ({ id: t.id!, year: t.year, title: t.title, impactDescription: t.impactDescription })) : DEFAULT.timelineMilestones,
          networkIntro: page.networkIntro || DEFAULT.networkIntro,
          networkCards: (page.networkCards as any) || DEFAULT.networkCards,
          logoImage: page.logoImage || DEFAULT.logoImage,
          logoExplanation: page.logoExplanation || DEFAULT.logoExplanation,
          governanceIntro: page.governanceIntro || DEFAULT.governanceIntro,
          governanceInstances: gov.length ? gov.map(g => ({ id: g.id!, order: g.order, title: g.title, summary: g.summary, keyAttributes: g.keyAttributes.map((a, i) => ({ id: String(i), attributeText: a.attributeText })) })) : DEFAULT.governanceInstances,
          teamMembers: mems.length ? mems.map(m => ({ id: m.id!, name: m.name, role: m.role, type: m.type === 'advisory' ? 'advisor' : m.type as any, bio: m.bio, imageUrl: m.imageUrl })) : DEFAULT.teamMembers,
        });
      }

      setIndicators(inds);
      setTransparencyDocs(docs);
      setCertifications(certs);
    } catch (e) {
      console.error('[AboutTeamPage] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await InstitutionalFirestoreService.savePage({
        title: data.aboutBadgeText,
        heroImage: data.aboutImage,
        missionStatement: data.missionStatement,
        visionStatement: data.visionStatement,
        networkIntro: data.networkIntro,
        logoImage: data.logoImage,
        logoExplanation: data.logoExplanation,
        governanceIntro: data.governanceIntro,
      });

      // Save version
      await CMSVersionService.saveDraft('about', data as unknown as Record<string, unknown>, 'admin', 'Atualização Módulo Institucional');
      autosave.clearSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[AboutTeamPage] Save error:', e);
      alert('Erro ao salvar módulo institucional.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'identidade' as ActiveTab, label: 'Identidade & Missão', icon: Heart },
    { id: 'valores' as ActiveTab, label: 'Valores & História', icon: Layers },
    { id: 'governanca' as ActiveTab, label: 'Governança & Equipe', icon: Users },
    { id: 'transparencia' as ActiveTab, label: 'Portal da Transparência', icon: FileText },
    { id: 'indicadores' as ActiveTab, label: 'Indicadores (ODS)', icon: BarChart2 },
    { id: 'certificacoes' as ActiveTab, label: 'Certificações', icon: Award },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando dados institucionais...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} title="Gestão Institucional Enterprise" />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={26} color="#16a34a" /> Módulo Institucional, Governança & Transparência
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Gerencie o propósito, órgãos de governança, portal da transparência e indicadores de impacto social
        </p>
      </div>

      {autosave.restoreAvailable && (
        <CMSAutosaveBanner
          savedAt={autosave.savedAt()}
          onRestore={() => { const d = autosave.restore(); if (d) setData(prev => ({ ...prev, ...d })); }}
          onDiscard={autosave.clearSaved}
        />
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #e5e7eb', marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: 'none',
              borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: activeTab === t.id ? '#16a34a' : 'transparent',
              color: activeTab === t.id ? 'white' : '#6b7280', whiteSpace: 'nowrap'
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Identidade */}
      {activeTab === 'identidade' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800 }}>Declaração de Missão e Visão</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Declaração de Missão</label>
              <textarea
                value={data.missionStatement}
                onChange={e => setData(prev => ({ ...prev, missionStatement: e.target.value }))}
                rows={3} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Declaração de Visão</label>
              <textarea
                value={data.visionStatement}
                onChange={e => setData(prev => ({ ...prev, visionStatement: e.target.value }))}
                rows={3} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, fontSize: 14 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Transparência */}
      {activeTab === 'transparencia' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Documentos do Portal da Transparência</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6b7280' }}>Relatórios anuais, pareceres de auditoria e estatutos vigentes</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {transparencyDocs.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid #f3f4f6', borderRadius: 8 }}>
                <div>
                  <strong style={{ fontSize: 14, color: '#111827' }}>{doc.title}</strong>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Categoria: {doc.category} | Ano: {doc.year} | Publicado em: {new Date(doc.publishedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <span style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  {doc.fileType || 'PDF'}
                </span>
              </div>
            ))}
            {transparencyDocs.length === 0 && <div style={{ color: '#9ca3af', fontSize: 13 }}>Nenhum documento cadastrado no Portal de Transparência.</div>}
          </div>
        </div>
      )}

      {/* Tab Content: Indicadores */}
      {activeTab === 'indicadores' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800 }}>Indicadores de Impacto & ODS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {indicators.map(ind => (
              <div key={ind.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{ind.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a' }}>{ind.value}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginTop: 2 }}>{ind.label}</div>
                {ind.ods && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {ind.ods.map(o => (
                      <span key={o} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>{o}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version History Sidebar/Footer */}
      <div style={{ marginTop: 32 }}>
        <CMSVersionHistory moduleId="about" onRestore={() => loadAllData()} />
      </div>
    </div>
  );
};
