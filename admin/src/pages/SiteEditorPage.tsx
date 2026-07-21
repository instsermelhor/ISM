import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor, Zap, Users, Layers, Heart, Globe, RefreshCw,
  ArrowRight, GitBranch, Clock, CheckCircle2, AlertCircle,
  FileText, Image, Settings2, BookOpen, Megaphone,
} from 'lucide-react';
import { InstitutionalFirestoreService } from '../services/institutional';
import { CMSVersionService, type CMSModuleId, type CMSVersionStatus } from '../services/cmsVersions';

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: CMSVersionStatus; version?: number }> = ({ status, version }) => {
  const color = CMSVersionService.statusColor(status);
  const label = CMSVersionService.statusLabel(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: `${color}18`, color, border: `1px solid ${color}40`,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {label}{version ? ` v${version}` : ''}
    </span>
  );
};

const SectionCard: React.FC<{
  id: CMSModuleId;
  title: string;
  desc: string;
  icon: React.ReactNode;
  accentColor: string;
  path: string;
  lastUpdate: string;
  versionStatus?: CMSVersionStatus;
  versionNumber?: number;
}> = ({ title, desc, icon, accentColor, path, lastUpdate, versionStatus, versionNumber }) => {
  const navigate = useNavigate();
  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: '1px solid #e5e7eb', borderLeft: `4px solid ${accentColor}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: 24,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#f3f4f6', padding: 10, borderRadius: 12 }}>{icon}</div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#111827' }}>{title}</h3>
          </div>
          {versionStatus && <StatusBadge status={versionStatus} version={versionNumber} />}
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: '0 0 16px 0' }}>{desc}</p>
      </div>

      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
          <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {lastUpdate}
        </div>
        <button
          onClick={() => navigate(path)}
          style={{
            background: `${accentColor}15`, color: accentColor,
            border: `1px solid ${accentColor}40`, borderRadius: 8,
            padding: '7px 14px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'background 0.15s',
          }}
        >
          Editar <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

interface ModuleStatus {
  lastUpdate: string;
  versionStatus?: CMSVersionStatus;
  versionNumber?: number;
}

export const SiteEditorPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<Record<string, ModuleStatus>>({});
  const [seeding, setSeeding] = useState(false);

  const checkSyncStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [page, services, donation, seo] = await Promise.all([
        InstitutionalFirestoreService.getPage(),
        InstitutionalFirestoreService.getServicesPage(),
        InstitutionalFirestoreService.getDonationSection(),
        InstitutionalFirestoreService.getSeoSettings(),
      ]);

      // Load version info in parallel
      const modules: CMSModuleId[] = ['hero', 'about', 'programs', 'donation', 'seo'];
      const versionResults = await Promise.all(
        modules.map(m => CMSVersionService.getLatestVersion(m).catch(() => null))
      );

      const formatTime = (ts: unknown) => {
        if (!ts) return 'Nunca editado';
        const d = (ts as any).toDate ? (ts as any).toDate() : new Date(ts as string);
        return d.toLocaleString('pt-BR');
      };

      const statusMap: Record<string, ModuleStatus> = {
        hero:     { lastUpdate: page     ? formatTime(page.updatedAt)           : 'Sem dados', versionStatus: versionResults[0]?.status, versionNumber: versionResults[0]?.version },
        about:    { lastUpdate: page     ? formatTime(page.updatedAt)           : 'Sem dados', versionStatus: versionResults[1]?.status, versionNumber: versionResults[1]?.version },
        programs: { lastUpdate: services ? formatTime(services.updatedAt)       : 'Sem dados', versionStatus: versionResults[2]?.status, versionNumber: versionResults[2]?.version },
        donation: { lastUpdate: donation ? formatTime((donation as any).updatedAt) : 'Sem dados', versionStatus: versionResults[3]?.status, versionNumber: versionResults[3]?.version },
        seo:      { lastUpdate: seo      ? formatTime((seo as any).updatedAt)   : 'Sem dados', versionStatus: versionResults[4]?.status, versionNumber: versionResults[4]?.version },
      };
      setSyncStatus(statusMap);
    } catch (e) {
      console.error('[SiteEditorPage] Erro ao carregar status:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkSyncStatus(); }, [checkSyncStatus]);

  const handleSeed = async () => {
    if (!confirm('Deseja mesmo redefinir o banco com dados padrão? Isso pode substituir alterações não salvas.')) return;
    setSeeding(true);
    try {
      await InstitutionalFirestoreService.seedInstitutionalData(true);
      await InstitutionalFirestoreService.saveDonationSection({
        badge: 'Contribua com o Instituto', title: 'Como Apoiar Nossa Causa',
        subtitle: 'Sua contribuição impulsiona projetos socioambientais transformadores em todo o país.',
        pixKey: 'apoio@institutosermelhor.org.br', bankName: 'Cora Sociedade de Crédito',
        benefits: ['Acesso a relatórios de impacto semestrais', 'Sua marca no mural de apoiadores', 'Dedução fiscal para pessoas jurídicas'],
      });
      await InstitutionalFirestoreService.saveSeoSettings({
        siteTitle: 'Instituto Ser Melhor — Emancipação & Sustentabilidade',
        siteDescription: 'Catalisador de impacto social e regenerativo nas áreas de educação, cultura e meio ambiente.',
        ogImage: 'https://picsum.photos/1200/630',
        keywords: 'ong, impacto social, sustentabilidade, educação, meio ambiente, terceiro setor',
        googleAnalyticsId: 'G-XXXXXXXXXX',
      });
      alert('Banco inicializado com sucesso!');
      checkSyncStatus();
    } catch (e) {
      console.error(e);
      alert('Erro ao inicializar dados.');
    } finally {
      setSeeding(false);
    }
  };

  // Seções primárias (site público)
  const primarySections = [
    { id: 'hero' as CMSModuleId, title: 'Hero / Home', desc: 'Primeira seção da página. Título, subtítulo, botões de CTA e imagens iniciais.', icon: <Zap size={20} color="#16a34a" />, path: '/site/hero', accentColor: '#16a34a' },
    { id: 'about' as CMSModuleId, title: 'Sobre / Equipe', desc: 'Valores institucionais, linha do tempo, equipe e membros de governança.', icon: <Users size={20} color="#2563eb" />, path: '/site/institucional', accentColor: '#2563eb' },
    { id: 'programs' as CMSModuleId, title: 'Projetos & Programas', desc: 'Programas sociais, estatísticas de impacto e apresentação de projetos.', icon: <Layers size={20} color="#d97706" />, path: '/site/projetos', accentColor: '#d97706' },
    { id: 'donation' as CMSModuleId, title: 'Seção de Doação', desc: 'Metas de doação, chaves Pix, informações bancárias e benefícios.', icon: <Heart size={20} color="#dc2626" />, path: '/site/doacoes', accentColor: '#dc2626' },
    { id: 'seo' as CMSModuleId, title: 'Site & SEO', desc: 'Título do site, metatags, OpenGraph, JSON-LD e Google Analytics.', icon: <Globe size={20} color="#7c3aed" />, path: '/site/seo', accentColor: '#7c3aed' },
  ];

  // Contagem de módulos publicados
  const publishedCount = Object.values(syncStatus).filter(s => s.versionStatus === 'PUBLISHED').length;
  const draftCount = Object.values(syncStatus).filter(s => s.versionStatus === 'DRAFT').length;
  const unversionedCount = primarySections.length - publishedCount - draftCount;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 0' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Monitor size={28} style={{ color: '#16a34a' }} />
            CMS — Editor do Site
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Gerencie todo o conteúdo da plataforma digital do Instituto Ser Melhor
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={checkSyncStatus} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#374151' }}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Atualizar
          </button>
          <button onClick={handleSeed} disabled={seeding}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', color: 'white', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            🚀 {seeding ? 'Processando...' : 'Seed / Restaurar Padrões'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Módulos Publicados', value: publishedCount, icon: <CheckCircle2 size={18} color="#16a34a" />, color: '#16a34a' },
          { label: 'Em Rascunho', value: draftCount, icon: <GitBranch size={18} color="#f59e0b" />, color: '#f59e0b' },
          { label: 'Sem Versão', value: unversionedCount, icon: <AlertCircle size={18} color="#9ca3af" />, color: '#9ca3af' },
          { label: 'Total de Módulos', value: primarySections.length, icon: <Layers size={18} color="#2563eb" />, color: '#2563eb' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            {stat.icon}
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Sections */}
      <h2 style={{ fontSize: 15, fontWeight: 800, color: '#374151', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileText size={16} /> Módulos do Site Público
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 32 }}>
        {primarySections.map(s => (
          <SectionCard
            key={s.id} {...s}
            lastUpdate={loading ? 'Carregando...' : (syncStatus[s.id]?.lastUpdate ?? 'Nunca editado')}
            versionStatus={syncStatus[s.id]?.versionStatus}
            versionNumber={syncStatus[s.id]?.versionNumber}
          />
        ))}
      </div>

      {/* CMS Enterprise Info Banner */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)', borderRadius: 14, border: '1px solid #bbf7d0', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Settings2 size={18} color="#16a34a" />
          <strong style={{ fontSize: 14, color: '#15803d' }}>CMS Enterprise — Recursos Ativos</strong>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['✅ Versionamento de Conteúdo', '✅ Histórico de Alterações', '✅ Autosave de Rascunho', '✅ SEO Manager JSON-LD', '✅ Controle por Permissões RBAC', '✅ Auditoria Imutável'].map(f => (
            <span key={f} style={{ background: 'white', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#374151', fontWeight: 600 }}>{f}</span>
          ))}
        </div>
      </div>

    </div>
  );
};
