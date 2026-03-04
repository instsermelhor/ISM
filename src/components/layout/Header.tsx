import React, { useState, useEffect } from 'react';
import { Menu, X, Leaf, ChevronDown, Heart, Handshake } from 'lucide-react';

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 border-b ${isScrolled
          ? 'bg-white shadow-md py-2 border-gray-100'
          : 'bg-white/95 backdrop-blur-sm py-4 border-transparent'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group z-50 relative">
          <img src="/logo-ism.png" alt="Logo Instituto Ser Melhor" className="w-12 h-12 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-[#009C3B] uppercase tracking-widest transition-colors">Instituto</span>
            <span className="text-xl font-bold tracking-tight text-[#002776] transition-colors">Ser Melhor</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href={item.href || '#'}
                className="flex items-center gap-1 text-sm font-bold text-secondary-800 hover:text-brand-600 uppercase tracking-wide py-4 transition-colors"
              >
                {item.label}
                {item.subItems && <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />}
              </a>

              {/* Dropdown Desktop */}
              {item.subItems && (
                <div
                  className={`absolute top-full left-0 w-56 bg-white shadow-xl rounded-b-lg border-t-2 border-brand-500 overflow-hidden transition-all duration-300 origin-top ${activeDropdown === item.label ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                    }`}
                >
                  <ul className="py-2">
                    {item.subItems.map((sub) => (
                      <li key={sub.label}>
                        <a
                          href={sub.href}
                          className="block px-6 py-3 text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                        >
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
          <a href="#partner" className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-brand-600 text-brand-600 font-bold text-xs uppercase tracking-wider hover:bg-brand-50 transition-colors">
            <Handshake size={16} />
            Seja Parceiro
          </a>
          <a href="#donate" className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-brand-700 hover:scale-105 transition-all">
            <Heart size={16} fill="currentColor" />
            Apoie Agora
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-secondary-900 p-2 hover:bg-gray-100 rounded-md transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={`lg:hidden fixed inset-0 z-40 bg-white transform transition-transform duration-300 pt-24 pb-10 px-6 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <nav className="flex flex-col space-y-4">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="border-b border-gray-100 pb-2">
              <div
                className="flex justify-between items-center py-2 cursor-pointer"
                onClick={() => item.subItems ? setMobileExpanded(mobileExpanded === item.label ? null : item.label) : setIsOpen(false)}
              >
                <a
                  href={item.href || '#'}
                  className="text-lg font-bold text-secondary-900 uppercase"
                  onClick={(e) => { if (item.subItems) e.preventDefault(); }}
                >
                  {item.label}
                </a>
                {item.subItems && (
                  <ChevronDown size={20} className={`text-brand-500 transition-transform ${mobileExpanded === item.label ? 'rotate-180' : ''}`} />
                )}
              </div>

              {/* Mobile Submenu */}
              {item.subItems && (
                <div className={`pl-4 space-y-3 overflow-hidden transition-all duration-300 ${mobileExpanded === item.label ? 'max-h-60 mt-2' : 'max-h-0'}`}>
                  {item.subItems.map((sub) => (
                    <a
                      key={sub.label}
                      href={sub.href}
                      className="block text-gray-600 text-sm py-1 active:text-brand-600"
                      onClick={() => setIsOpen(false)}
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-4 mt-8">
            <a
              href="#donate"
              onClick={() => setIsOpen(false)}
              className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-full bg-brand-600 text-white font-bold text-sm uppercase tracking-wider shadow-md hover:bg-brand-700"
            >
              <Heart size={18} fill="currentColor" />
              Apoie Agora
            </a>
            <a
              href="#partner"
              onClick={() => setIsOpen(false)}
              className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-full border-2 border-brand-600 text-brand-600 font-bold text-sm uppercase tracking-wider hover:bg-brand-50"
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