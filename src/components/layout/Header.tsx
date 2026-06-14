import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Heart, Handshake } from 'lucide-react';

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
      { label: 'Projetos em Campo', href: '#' },
      { label: 'Notícias', href: '#' },
    ]
  },
  {
    label: 'Transparência',
    href: '#transparency'
  }
];

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const handleNavClick = () => setIsOpen(false);

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
      }}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group z-50 relative">
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
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <a
                href={item.href || '#'}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest py-4 px-3 transition-colors duration-200 rounded-lg ${
                  isScrolled
                    ? 'text-secondary-700 hover:text-brand-600 hover:bg-brand-50/50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
                {item.subItems && (
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180 text-brand-600' : ''}`}
                  />
                )}
              </a>

              {/* Dropdown Desktop — corrigido: usa translate-y ao invés de scale-y */}
              {item.subItems && (
                <div
                  className={`absolute top-full left-0 w-56 bg-white rounded-xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden transition-all duration-200 origin-top ${
                    activeDropdown === item.label
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                  {/* Accent line */}
                  <div className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600" />
                  <ul className="py-2">
                    {item.subItems.map((sub) => (
                      <li key={sub.label}>
                        <a
                          href={sub.href}
                          className="flex items-center gap-2 px-5 py-2.5 text-sm text-secondary-600 hover:bg-brand-50 hover:text-brand-700 transition-colors duration-150 group"
                          onClick={handleNavClick}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* CTAs Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="#partner"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              isScrolled
                ? 'border-brand-600 text-brand-700 hover:bg-brand-50 hover:border-brand-700'
                : 'border-white/40 text-white hover:bg-white/10 hover:border-white/70'
            }`}
          >
            <Handshake size={15} />
            Seja Parceiro
          </a>
          <a
            href="#donate"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-brand-700/40 hover:scale-105 transition-all duration-200"
          >
            <Heart size={15} fill="currentColor" />
            Apoie Agora
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`lg:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
            isScrolled ? 'text-secondary-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
          }`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
        >
          <span
            className={`absolute transition-all duration-200 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
          >
            <X size={24} />
          </span>
          <span
            className={`absolute transition-all duration-200 ${isOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}
          >
            <Menu size={24} />
          </span>
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)' }}
      >
        <nav className="flex flex-col h-full pt-24 pb-10 px-6 overflow-y-auto">
          <div className="flex-grow space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="border-b border-gray-100">
                <div
                  className="flex justify-between items-center py-4 cursor-pointer"
                  onClick={() =>
                    item.subItems
                      ? setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                      : setIsOpen(false)
                  }
                >
                  <a
                    href={item.href || '#'}
                    className="text-base font-bold text-secondary-900 uppercase tracking-wider"
                    onClick={(e) => { if (item.subItems) e.preventDefault(); }}
                  >
                    {item.label}
                  </a>
                  {item.subItems && (
                    <ChevronDown
                      size={18}
                      className={`text-brand-500 transition-transform duration-200 ${
                        mobileExpanded === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </div>

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
                        className="flex items-center gap-2 text-secondary-600 text-sm py-2 hover:text-brand-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
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
              onClick={() => setIsOpen(false)}
              className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-2xl bg-brand-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-brand-600/30"
            >
              <Heart size={18} fill="currentColor" />
              Apoie Agora
            </a>
            <a
              href="#partner"
              onClick={() => setIsOpen(false)}
              className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-2xl border-2 border-brand-600 text-brand-700 font-bold text-sm uppercase tracking-wider hover:bg-brand-50 transition-colors"
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