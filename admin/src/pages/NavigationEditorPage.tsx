import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Globe, LayoutList, Mail, Phone, MapPin } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { NavigationService, type SiteNavigationData, type SiteFooterData } from '../services/navigationService';

export const NavigationEditorPage: React.FC = () => {
  const [nav, setNav] = useState<SiteNavigationData | null>(null);
  const [footer, setFooter] = useState<SiteFooterData | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      NavigationService.getOrSeedNavigation(),
      NavigationService.getOrSeedFooter(),
    ]).then(([navData, footerData]) => {
      setNav(navData);
      setFooter(footerData);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (nav) await NavigationService.saveNavigation(nav);
      if (footer) await NavigationService.saveFooter(footer);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Erro ao salvar navegação:', e);
      alert('Erro ao salvar configurações de navegação.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !nav || !footer) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Carregando menus de navegação...</div>;
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <SaveBar isDirty={true} isSaving={saving} saved={saved} onSave={handleSave} />

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Globe color="#16a34a" size={28} /> Navegação & Menus do Site
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>
          Gerencie os menus do cabeçalho (Header) e as informações do rodapé (Footer) do site institucional.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('header')}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'header' ? '#16a34a' : 'white',
            color: activeTab === 'header' ? 'white' : '#374151',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          Menu Superior (Header)
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'footer' ? '#16a34a' : 'white',
            color: activeTab === 'footer' ? 'white' : '#374151',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          Rodapé (Footer) & Contatos
        </button>
      </div>

      {activeTab === 'header' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0' }}>Itens do Menu Principal</h2>
          {nav.items.map((item, idx) => (
            <div key={item.id} style={{ padding: 16, border: '1px solid #f3f4f6', borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>LABEL DO MENU</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={e => {
                      const newItems = [...nav.items];
                      newItems[idx].label = e.target.value;
                      setNav({ ...nav, items: newItems });
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>LINK / ÂNCORA (OPCIONAL)</label>
                  <input
                    type="text"
                    value={item.href || ''}
                    onChange={e => {
                      const newItems = [...nav.items];
                      newItems[idx].href = e.target.value;
                      setNav({ ...nav, items: newItems });
                    }}
                    placeholder="ex: #transparency"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'footer' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0' }}>Informações de Contato do Rodapé</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>E-MAIL DE CONTATO</label>
              <input
                type="email"
                value={footer.email}
                onChange={e => setFooter({ ...footer, email: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>TELEFONE / WHATSAPP</label>
              <input
                type="text"
                value={footer.phone}
                onChange={e => setFooter({ ...footer, phone: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>SLOGAN / TAGLINE</label>
            <textarea
              value={footer.tagline}
              onChange={e => setFooter({ ...footer, tagline: e.target.value })}
              rows={2}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: 13, color: '#15803d', fontWeight: 700, margin: 0 }}>
              🌐 Gerenciamento Dinâmico de Redes Sociais
            </p>
            <p style={{ fontSize: 12, color: '#166534', margin: '4px 0 0 0' }}>
              As redes sociais (quantidade ilimitada, ordenação, visibilidade no Header/Footer) agora são gerenciadas centralmente em{' '}
              <a href="/configuracoes?tab=social" style={{ fontWeight: 800, textDecoration: 'underline', color: '#15803d' }}>
                Configurações do Site → Redes Sociais
              </a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
