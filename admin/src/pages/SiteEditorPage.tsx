import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Zap, Users, Layers, Heart, Globe, RefreshCw, ArrowRight } from 'lucide-react';
import { InstitutionalFirestoreService } from '../services/institutional';

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'white',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    padding: 24,
    ...style
  }}>
    {children}
  </div>
);

export const SiteEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({});
  const [seeding, setSeeding] = useState(false);

  const checkSyncStatus = async () => {
    setLoading(true);
    try {
      const [page, services, donation, seo] = await Promise.all([
        InstitutionalFirestoreService.getPage(),
        InstitutionalFirestoreService.getServicesPage(),
        InstitutionalFirestoreService.getDonationSection(),
        InstitutionalFirestoreService.getSeoSettings()
      ]);

      const formatTime = (ts: any) => {
        if (!ts) return 'Nunca editado';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleString('pt-BR');
      };

      setSyncStatus({
        hero: page ? formatTime(page.updatedAt) : 'Sem dados (necessita Seed)',
        about: page ? formatTime(page.updatedAt) : 'Sem dados (necessita Seed)',
        projects: services ? formatTime(services.updatedAt) : 'Sem dados (necessita Seed)',
        donation: donation ? formatTime((donation as any).updatedAt) : 'Sem dados (necessita Seed)',
        seo: seo ? formatTime((seo as any).updatedAt) : 'Sem dados (necessita Seed)'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, []);

  const handleSeed = async () => {
    if (!confirm('Deseja mesmo redefinir o banco com dados padrão? Isso pode substituir alterações não salvas.')) return;
    setSeeding(true);
    try {
      await InstitutionalFirestoreService.seedInstitutionalData(true);
      
      // Also seed donation and seo sections with default content
      await InstitutionalFirestoreService.saveDonationSection({
        badge: 'Contribua com o Instituto',
        title: 'Como Apoiar Nossa Causa',
        subtitle: 'Sua contribuição impulsiona projetos socioambientais transformadores em todo o país.',
        pixKey: 'apoio@institutosermelhor.org.br',
        bankName: 'Cora Sociedade de Crédito',
        benefits: [
          'Acesso a relatórios de impacto semestrais',
          'Sua marca no mural de apoiadores do Instituto',
          'Dedução fiscal para pessoas jurídicas'
        ]
      });

      await InstitutionalFirestoreService.saveSeoSettings({
        siteTitle: 'Instituto Ser Melhor — Emancipação & Sustentabilidade',
        siteDescription: 'Catalisador de impacto social e regenerativo nas áreas de educação, cultura e meio ambiente.',
        ogImage: 'https://picsum.photos/1200/630',
        keywords: 'ong, impacto social, sustentabilidade, educação, meio ambiente, terceiro setor',
        googleAnalyticsId: 'G-XXXXXXXXXX'
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

  const sections = [
    {
      id: 'hero',
      title: 'Hero / Home',
      desc: 'Primeira seção da página. Título, subtítulo, botões e imagens iniciais.',
      icon: <Zap size={22} color="#16a34a" />,
      path: '/site/hero',
      lastUpdate: syncStatus.hero
    },
    {
      id: 'about',
      title: 'Sobre / Equipe',
      desc: 'Valores institucionais, história/linha do tempo, equipe e membros de governança.',
      icon: <Users size={22} color="#2563eb" />,
      path: '/site/institucional',
      lastUpdate: syncStatus.about
    },
    {
      id: 'projects',
      title: 'Projetos & Programas',
      desc: 'Seção onde os principais projetos e estatísticas da instituição são apresentados.',
      icon: <Layers size={22} color="#d97706" />,
      path: '/site/projetos',
      lastUpdate: syncStatus.projects
    },
    {
      id: 'donation',
      title: 'Seção de Doação',
      desc: 'Metas, chaves Pix, informações bancárias e benefícios para apoiadores.',
      icon: <Heart size={22} color="#dc2626" />,
      path: '/site/doacoes',
      lastUpdate: syncStatus.donation
    },
    {
      id: 'seo',
      title: 'Site & SEO',
      desc: 'Título do site, metatags, palavras-chave, Google Analytics e imagem de compartilhamento.',
      icon: <Globe size={22} color="#7c3aed" />,
      path: '/site/seo',
      lastUpdate: syncStatus.seo
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Monitor size={28} style={{ color: '#16a34a' }} /> Editor do Site Principal
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Gerencie a comunicação visual e dados que alimentam a landing page institucional</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={checkSyncStatus} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#374151' }}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Atualizar Status
          </button>
          <button onClick={handleSeed} disabled={seeding}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', color: 'white', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            🚀 {seeding ? 'Processando...' : 'Seed / Restaurar Padrões'}
          </button>
        </div>
      </div>

      {/* Grid of Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {sections.map(s => (
          <Card key={s.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', transition: 'all 0.2s', borderLeft: `4px solid ${s.id === 'hero' ? '#16a34a' : s.id === 'about' ? '#2563eb' : s.id === 'projects' ? '#d97706' : s.id === 'donation' ? '#dc2626' : '#7c3aed'}` }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ background: '#f3f4f6', padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#111827' }}>{s.title}</h3>
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, margin: '0 0 16px 0' }}>{s.desc}</p>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
                Último Sync: <span style={{ color: '#4b5563', display: 'block', marginTop: 2 }}>{loading ? 'Carregando...' : s.lastUpdate}</span>
              </div>
              <button onClick={() => navigate(s.path)}
                style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                Editar <ArrowRight size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
