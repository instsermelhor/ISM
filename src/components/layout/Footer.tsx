import React from 'react';
import { Mail, MapPin, Phone, Instagram, Facebook, Linkedin, Youtube, Github, Heart, Lock, Globe } from 'lucide-react';
import { useRealtimeSocialNetworks, type SocialNetworkItem } from '../../hooks/useRealtimeSocialNetworks';

// Ícones SVGs inline para redes sem ícone direto no lucide-react
const XIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.42V8.9a6.34 6.34 0 0 0-5.11 6.18 6.34 6.34 0 1 0 11.45-3.69v-4.9a8.2 8.2 0 0 0 3.77 1.09V6.69z" />
  </svg>
);

const WhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c0-5.445 4.43-9.874 9.877-9.874 2.637 0 5.116 1.028 6.98 2.893A9.8 9.8 0 0 1 21.88 12c0 5.447-4.429 9.875-9.829 9.875" />
  </svg>
);

const BlueskyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 568 501" fill="currentColor" className={className} aria-hidden="true">
    <path d="M123.121 33.664C187.943 82.26 256.757 182.88 284 234.316c27.243-51.436 96.057-152.056 160.879-200.652C491.56 2.308 554.496-13.8 566.246 38.647c12.25 54.676-3.037 137.288-66.223 189.65-88.75 73.548-185.342 79.467-216.023 74.372 30.681 5.095 127.273-.824 216.023-74.372 63.186-52.362 78.473-134.974 66.223-189.65C554.496-13.8 491.56 2.308 444.879 33.664 380.057 82.26 311.243 182.88 284 234.316" />
  </svg>
);

/** Mapeamento dinâmico de ícones por chave de plataforma */
function renderSocialIcon(platform: string, size = 16) {
  const p = platform.toLowerCase().trim();
  switch (p) {
    case 'instagram': return <Instagram size={size} />;
    case 'facebook': return <Facebook size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
    case 'x':
    case 'twitter': return <XIcon size={size} />;
    case 'youtube': return <Youtube size={size} />;
    case 'tiktok': return <TikTokIcon size={size} />;
    case 'whatsapp': return <WhatsAppIcon size={size} />;
    case 'bluesky': return <BlueskyIcon size={size} />;
    case 'github': return <Github size={size} />;
    default: return <Globe size={size} />;
  }
}

// URL do painel admin — lida de variável de ambiente (VITE_ADMIN_URL no build do site).
// Em dev: usa window.location para derivar a porta 3001 automaticamente; nunca hardcoded.
const ADMIN_URL = (() => {
  // 1. Variável de ambiente definida no build (produção/staging)
  const envUrl = typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_ADMIN_URL as string | undefined
    : undefined;
  if (envUrl) return envUrl;
  // 2. Em runtime: detecta produção pelo hostname
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://admin.institutosermelhor.org/login';
  }
  // 3. Dev local: deriva do origin, troca porta pelo padrão do admin (3001)
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/:\d+$/, ':3001') + '/admin/login';
  }
  return '/admin/login';
})();

interface Props {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  footerData?: any;
}

const defaultSocialLinks = [
  { platform: 'instagram', label: 'Instagram — @instsermelhor', url: 'https://www.instagram.com/instsermelhor', openInNewTab: true },
  { platform: 'facebook', label: 'Facebook — Instituto Ser Melhor', url: 'https://www.facebook.com/institutosermelhor', openInNewTab: true },
  { platform: 'linkedin', label: 'LinkedIn — Instituto Ser Melhor', url: 'https://www.linkedin.com/company/institutosermelhor', openInNewTab: true },
  { platform: 'x', label: 'X (antigo Twitter) — @instsermelhor', url: 'https://x.com/instsermelhor', openInNewTab: true },
];

export const Footer: React.FC<Props> = ({ onOpenPrivacy, onOpenTerms, footerData }) => {
  const realtimeSocials = useRealtimeSocialNetworks({ showInFooter: true });
  const tagline = footerData?.tagline || 'Trabalhando desde 2007 para conectar pessoas, natureza e sustentabilidade em prol de um futuro regenerativo.';

  // Prioridade: 1. Firestore `social_networks` tempo real, 2. `footerData.socialLinks`, 3. `defaultSocialLinks`
  const activeSocials = realtimeSocials.length > 0
    ? realtimeSocials.map(s => ({
        platform: s.platform,
        label: s.name || s.platform,
        url: s.url,
        openInNewTab: s.openInNewTab,
      }))
    : footerData?.socialLinks && footerData.socialLinks.length > 0
    ? footerData.socialLinks.map((s: any) => ({
        platform: s.platform || 'globe',
        label: s.label || s.platform,
        url: s.url || '#',
        openInNewTab: true,
      }))
    : defaultSocialLinks;

  return (
    <footer className="relative bg-secondary-950 text-white overflow-hidden">
      {/* Decorative gradient top border */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="space-y-5 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/logo-ism.png"
                alt="Logo Instituto Ser Melhor"
                className="w-12 h-12 object-contain"
              />
              <div className="flex flex-col leading-none">
                {/* BUG FIX: texto visível no fundo escuro */}
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: '#4ade80' }}
                >
                  Instituto
                </span>
                <span className="text-xl font-black text-white">
                  Ser Melhor
                </span>
              </div>
            </div>
            <p className="text-secondary-400 text-sm leading-relaxed">
              {tagline}
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 pt-1 flex-wrap">
              {activeSocials.map((s: any, idx: number) => (
                <a
                  key={s.id || s.url || idx}
                  href={s.url}
                  target={s.openInNewTab ? "_blank" : "_self"}
                  rel={s.openInNewTab ? "noopener noreferrer" : undefined}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-brand-600 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  {renderSocialIcon(s.platform, 16)}
                </a>
              ))}
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-brand-500 rounded-full" />
              Institucional
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Nossa Missão', href: '#mission' },
                { label: 'Conselho e Diretoria', href: '#governance' },
                { label: 'Relatórios Anuais', href: '#transparency' },
                { label: 'Carreiras', href: '#' },
                { label: 'Imprensa', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-secondary-400 text-sm hover:text-brand-400 transition-colors duration-150 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-brand-400 group-hover:w-3 transition-all duration-200" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Nossas Causas */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-brand-500 rounded-full" />
              Nossas Causas
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Educação de Qualidade', href: '#programs' },
                { label: 'Preservação Ambiental', href: '#pillars' },
                { label: 'Justiça Social', href: '#values' },
                { label: 'Desenvolvimento Social', href: '#impact' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-secondary-400 text-sm hover:text-brand-400 transition-colors duration-150 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-brand-400 group-hover:w-3 transition-all duration-200" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-brand-500 rounded-full" />
              Contato
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary-800 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-brand-400" />
                </div>
                <span className="text-secondary-400 text-sm leading-relaxed">
                  {footerData?.address || (
                    <>
                      Av. Henry Ford, S/N — Presidente Altino<br />
                      Osasco — SP, 06210-900
                    </>
                  )}
                </span>
              </li>
              {(footerData?.phone || !footerData) && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary-800 flex items-center justify-center shrink-0">
                    <Phone size={15} className="text-brand-400" />
                  </div>
                  <a href={`tel:${(footerData?.phone || '+5511962765715').replace(/[^0-9+]/g, '')}`} className="text-secondary-400 text-sm hover:text-brand-400 transition-colors">
                    {footerData?.phone || '+55 (11) 96276-5715'}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary-800 flex items-center justify-center shrink-0">
                  <Mail size={15} className="text-brand-400" />
                </div>
                <a href={`mailto:${footerData?.email || 'contato@institutosermelhor.org'}`} className="text-secondary-400 text-sm hover:text-brand-400 transition-colors">
                  {footerData?.email || 'contato@institutosermelhor.org'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-500 text-xs flex items-center gap-1">
            © 2026 Instituto Ser Melhor. Feito com
            <Heart size={11} fill="currentColor" className="text-brand-500 inline mx-0.5" />
            para um mundo melhor.
          </p>
          <div className="flex gap-6">
            <button
              onClick={onOpenPrivacy}
              className="text-secondary-500 text-xs hover:text-brand-400 transition-colors"
            >
              Política de Privacidade
            </button>
            <button
              onClick={onOpenTerms}
              className="text-secondary-500 text-xs hover:text-brand-400 transition-colors"
            >
              Termos de Uso
            </button>
            {/* Link discreto para o painel administrativo */}
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-600 text-xs hover:text-brand-400 transition-colors flex items-center gap-1.5 group"
              title="Acesso ao Painel Administrativo — Instituto Ser Melhor"
              aria-label="Área Restrita — Painel Administrativo"
            >
              <Lock
                size={11}
                className="opacity-40 group-hover:opacity-100 transition-opacity"
              />
              Área Restrita
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};