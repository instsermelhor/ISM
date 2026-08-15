import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, ChevronDown, Heart, Handshake } from 'lucide-react';
import { LanguageSelector } from '../ui/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import { useScrollLock } from '../../hooks/useScrollLock';

interface NavItem {
  label: string;
  href?: string;
  subItems?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Quem Somos',
    subItems: [
      { label: 'Nossa Missão', href: '#mission' },
      { label: 'História', href: '#history' },
      { label: 'Símbolos e Rede', href: '#identity' },
      { label: 'Governança & Equipe', href: '#governance' },
    ]
  },
  {
    label: 'O Que Fazemos',
    subItems: [
      { label: 'Nossos Princípios', href: '#values' },
      { label: 'Projetos em Campo', href: '#programs' },
      { label: 'Notícias', href: '#blog' },
    ]
  },
  {
    label: 'Transparência',
    href: '#transparency'
  }
];

export interface HeaderProps {
  navData?: any;
}

export const Header: React.FC<HeaderProps> = ({ navData }) => {
  const { t } = useLanguage();
  const navItems: NavItem[] = navData?.items && navData.items.length > 0 ? navData.items : [
    {
      label: t.nav.whoWeAre,
      subItems: [
        { label: t.nav.ourMission, href: '#mission' },
        { label: t.nav.history, href: '#history' },
        { label: t.nav.governance, href: '#governance' },
      ]
    },
    {
      label: t.nav.whatWeDo,
      subItems: [
        { label: t.nav.principles, href: '#values' },
        { label: t.nav.programs, href: '#programs' },
        { label: t.nav.news, href: '#blog' },
      ]
    },
    {
      label: t.nav.transparency,
      href: '#transparency'
    }
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // iOS-safe scroll lock — substitui document.body.style.overflow = 'hidden'
  useScrollLock(isOpen);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha menu ao pressionar Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Fecha menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  // Toggle dropdown por clique (suporte a touch em tablets landscape)
  const handleDropdownToggle = useCallback((label: string) => {
    setActiveDropdown(prev => prev === label ? null : label);
  }, []);

  const handleNavClick = useCallback(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-2 shadow-lg shadow-black/10'
          : 'py-4'
      }`}
      style={{
        background: isScrolled
          ? 'rgba(255,255,255,0.95)'
          : 'rgba(2, 6, 23, 0.3)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
        // Safe area top para status bar translúcida iOS (black-translucent)
        paddingTop: isScrolled
          ? 'calc(0.5rem + env(safe-area-inset-top, 0px))'
          : 'calc(1rem + env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <a
          href="#hero"
          aria-label="Instituto Ser Melhor - Ir para o topo"
          className="flex items-center gap-2.5 group z-50 relative touch-manipulation"
          onClick={handleNavClick}
        >
          <img
            src="/logo-ism.png"
            alt="Logo Instituto Ser Melhor"
            className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none">
            <span
              className="text-xs font-bold uppercase tracking-[0.18em] transition-colors"
              style={{ color: isScrolled ? '#009C3B' : '#6ee7b7' }}
            >
              Instituto
            </span>
            <span
              className="text-lg font-black tracking-tight transition-colors"
              style={{ color: isScrolled ? '#002776' : '#ffffff' }}
            >
              Ser Melhor
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
          {navItems.map((item) => {
            const dropdownId = `dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
            const isExpanded = activeDropdown === item.label;
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.subItems ? handleMouseEnter(item.label) : undefined}
                onMouseLeave={() => item.subItems ? handleMouseLeave() : undefined}
              >
                <a
                  href={item.href || '#'}
                  className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest py-4 px-3 transition-colors duration-200 rounded-lg touch-manipulation ${
                    isScrolled
                      ? 'text-secondary-700 hover:text-brand-600 hover:bg-brand-50/50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  aria-haspopup={item.subItems ? 'true' : undefined}
                  aria-expanded={item.subItems ? isExpanded : undefined}
                  aria-controls={item.subItems ? dropdownId : undefined}
                  onClick={item.subItems
                    ? (e) => { e.preventDefault(); handleDropdownToggle(item.label); }
                    : handleNavClick
                  }
                >
                  {item.label}
                  {item.subItems && (
                    <ChevronDown
                      size={13}
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-brand-600' : ''}`}
                    />
                  )}
                </a>

                {/* Dropdown Desktop */}
                {item.subItems && (
                  <div
                    id={dropdownId}
                    role="menu"
                    className={`absolute top-full left-0 w-56 bg-white rounded-xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden transition-all duration-200 origin-top ${
                      isExpanded
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600" aria-hidden="true" />
                    <ul className="py-2" role="list">
                      {item.subItems.map((sub) => (
                        <li key={sub.label}>
                          <a
                            href={sub.href}
                            role="menuitem"
                            className="flex items-center gap-2 px-5 py-2.5 text-sm text-secondary-600 hover:bg-brand-50 hover:text-brand-700 transition-colors duration-150 group touch-manipulation"
                            onClick={handleNavClick}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
                            {sub.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* CTAs Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSelector isScrolled={isScrolled} />
          <a
            href="#partner"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 touch-manipulation ${
              isScrolled
                ? 'border-brand-600 text-brand-700 hover:bg-brand-50 hover:border-brand-700'
                : 'border-white/40 text-white hover:bg-white/10 hover:border-white/70'
            }`}
            onClick={handleNavClick}
          >
            <Handshake size={15} />
            Seja Parceiro
          </a>
          <a
            href="#donate"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-brand-700/40 hover:scale-105 transition-all duration-200 touch-manipulation"
            onClick={handleNavClick}
          >
            <Heart size={15} fill="currentColor" />
            {t.nav.donate}
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`lg:hidden relative z-50 w-11 h-11 flex items-center justify-center rounded-xl transition-colors touch-manipulation ${
            isScrolled ? 'text-secondary-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
          }`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
        >
          <span
            className={`absolute transition-all duration-200 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
            aria-hidden="true"
          >
            <X size={24} aria-hidden="true" />
          </span>
          <span
            className={`absolute transition-all duration-200 ${isOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}
            aria-hidden="true"
          >
            <Menu size={24} aria-hidden="true" />
          </span>
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div
        id="mobile-nav-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <nav
          className="flex flex-col h-full overflow-y-auto"
          aria-label="Navegação mobile"
          style={{
            // Safe area: respeita notch (topo) e Home Indicator (base) do iPhone
            paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))',
            paddingLeft: 'calc(1.5rem + env(safe-area-inset-left, 0px))',
            paddingRight: 'calc(1.5rem + env(safe-area-inset-right, 0px))',
          }}
        >
          <div className="flex-grow space-y-1">
            {navItems.map((item) => (
              <div key={item.label} className="border-b border-gray-100">
                {/* Item com submenu: usa button semântico para acionar expansão */}
                {item.subItems ? (
                  <button
                    type="button"
                    className="flex w-full justify-between items-center py-4 cursor-pointer touch-manipulation"
                    aria-expanded={mobileExpanded === item.label}
                    onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                  >
                    <span className="text-base font-bold text-secondary-900 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className={`text-brand-500 transition-transform duration-200 ${
                        mobileExpanded === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                ) : (
                  <a
                    href={item.href || '#'}
                    className="flex w-full justify-between items-center py-4 text-base font-bold text-secondary-900 uppercase tracking-wider touch-manipulation"
                    onClick={handleNavClick}
                  >
                    {item.label}
                  </a>
                )}

                {item.subItems && (
                  <div
                    className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
                      mobileExpanded === item.label ? 'max-h-60 mb-3' : 'max-h-0'
                    }`}
                  >
                    {item.subItems.map((sub) => (
                      <a
                        key={sub.label}
                        href={sub.href}
                        className="flex items-center gap-2 text-secondary-600 text-sm py-2 hover:text-brand-600 transition-colors touch-manipulation"
                        onClick={handleNavClick}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" aria-hidden="true" />
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-8 pt-8 border-t border-gray-100">
            <a
              href="#donate"
              onClick={handleNavClick}
              className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-2xl bg-brand-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-brand-600/30 touch-manipulation"
            >
              <Heart size={18} fill="currentColor" />
              Apoie Agora
            </a>
            <a
              href="#partner"
              onClick={handleNavClick}
              className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-2xl border-2 border-brand-600 text-brand-700 font-bold text-sm uppercase tracking-wider hover:bg-brand-50 transition-colors touch-manipulation"
            >
              <Handshake size={18} />
              Seja Parceiro
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};