import React from 'react';
import { Mail, MapPin, Phone, Instagram, Facebook, Linkedin, Twitter, Heart } from 'lucide-react';

interface Props {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

const socialLinks = [
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Facebook, label: 'Facebook' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Twitter, label: 'Twitter / X' },
];

export const Footer: React.FC<Props> = ({ onOpenPrivacy, onOpenTerms }) => {
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
              Trabalhando desde 2007 para conectar pessoas, natureza e sustentabilidade em prol de um futuro regenerativo.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 pt-1">
              {socialLinks.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-brand-600 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <Icon size={16} />
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
                'Educação',
                'Educação Ambiental',
                'Proteção Animal',
                'Preservação Ambiental',
                'Justiça Social',
                'Desenvolvimento Social',
              ].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-secondary-400 text-sm hover:text-brand-400 transition-colors duration-150 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-brand-400 group-hover:w-3 transition-all duration-200" />
                    {label}
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
                  Av. Henry Ford, S/N — Presidente Altino<br />
                  Osasco — SP, 06210-900
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary-800 flex items-center justify-center shrink-0">
                  <Phone size={15} className="text-brand-400" />
                </div>
                <a href="tel:+5511962765715" className="text-secondary-400 text-sm hover:text-brand-400 transition-colors">
                  +55 (11) 96276-5715
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary-800 flex items-center justify-center shrink-0">
                  <Mail size={15} className="text-brand-400" />
                </div>
                <a href="mailto:contato@institutosermelhor.org" className="text-secondary-400 text-sm hover:text-brand-400 transition-colors">
                  contato@institutosermelhor.org
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
              href="http://localhost:3001/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-600 text-xs hover:text-brand-400 transition-colors flex items-center gap-1 group"
              title="Painel Administrativo"
            >
              <svg
                width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="opacity-40 group-hover:opacity-100 transition-opacity"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Área Restrita
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};