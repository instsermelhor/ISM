/**
 * PWAInstallBanner.tsx — F001: Banner de Instalação do App PWA
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Banner amigável oferecendo a instalação do App PWA do Instituto Ser Melhor na tela inicial.
 */

import React, { useState, useEffect } from 'react';
import { Download, X, Heart, ShieldCheck, Smartphone } from 'lucide-react';
import { PWARegisterService } from '../../services/pwaRegisterService';

export const PWAInstallBanner: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Não exibe se já estiver instalado em modo standalone
    if (PWARegisterService.isStandalone()) return;

    PWARegisterService.initInstallListener(() => {
      setCanInstall(true);
    });
  }, []);

  const handleInstallClick = async () => {
    const accepted = await PWARegisterService.promptInstall();
    if (accepted) {
      setCanInstall(false);
    }
  };

  if (!canInstall || dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 9990,
        maxWidth: 480, margin: '0 auto', background: '#052e16',
        color: 'white', borderRadius: 20, padding: '16px 20px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)', border: '1px solid #166534',
        display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Inter, system-ui, sans-serif',
      }}
      role="banner"
      aria-label="Instalação do Aplicativo"
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: '#16a34a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0,
      }}>
        <Smartphone size={24} color="white" />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
          Instalar App ISM <span style={{ fontSize: 10, background: '#22c55e', color: '#052e16', padding: '1px 6px', borderRadius: 10, fontWeight: 800 }}>PWA</span>
        </div>
        <div style={{ fontSize: 11, color: '#bbf7d0', marginTop: 2, lineHeight: 1.3 }}>
          Acesso instantâneo na sua tela inicial, notificações e modo offline.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={handleInstallClick}
          style={{
            padding: '8px 14px', background: '#22c55e', color: '#052e16',
            fontWeight: 800, borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <Download size={14} /> Instalar
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent', border: 'none', color: '#86efac',
            cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
          }}
          aria-label="Fechar aviso"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
