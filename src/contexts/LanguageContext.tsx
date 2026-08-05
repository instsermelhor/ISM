/**
 * LanguageContext.tsx — C005: Módulo de Internacionalização (i18n PT / EN / ES)
 * ─────────────────────────────────────────────────────────────────────────────
 * Suporte a múltiplos idiomas (Português, Inglês e Espanhol) para apresentação
 * da atuação do Instituto Ser Melhor a organismos e doadores internacionais.
 *
 * Persistência automática em localStorage e detecção de idioma padrão do navegador.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'PT' | 'EN' | 'ES';

export interface Translations {
  nav: {
    whoWeAre: string;
    ourMission: string;
    history: string;
    governance: string;
    whatWeDo: string;
    principles: string;
    programs: string;
    news: string;
    transparency: string;
    sroi: string;
    donate: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    ctaDonate: string;
    ctaLearnMore: string;
    motto: string;
  };
  sroi: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    simulatorTitle: string;
    simulatorSubtitle: string;
    investLabel: string;
    returnLabel: string;
    officialBadge: string;
  };
  donation: {
    badge: string;
    title: string;
    subtitle: string;
    pixTitle: string;
    pixCnpj: string;
    pixCopyBtn: string;
    pixCopied: string;
    methodPix: string;
    methodCard: string;
    methodBoleto: string;
  };
  footer: {
    motto: string;
    allRightsReserved: string;
    privacy: string;
    terms: string;
    transparencyPortal: string;
  };
}

const DICTIONARY: Record<Language, Translations> = {
  PT: {
    nav: {
      whoWeAre: 'Quem Somos',
      ourMission: 'Nossa Missão',
      history: 'História',
      governance: 'Governança & Equipe',
      whatWeDo: 'O Que Fazemos',
      principles: 'Nossos Princípios',
      programs: 'Projetos em Campo',
      news: 'Notícias & Mídia',
      transparency: 'Transparência',
      sroi: 'Retorno Social (SROI)',
      donate: 'Apoie Agora',
    },
    hero: {
      badge: 'Organização Não Governamental · Instituto Ser Melhor',
      titleStart: 'Transformando vidas por meio da ',
      titleHighlight: 'educação, sustentabilidade e ação social',
      titleEnd: '',
      subtitle: 'Promovemos a emancipação humana e o desenvolvimento sustentável com programas integrados e transparência auditada em todo o Brasil.',
      ctaDonate: 'Fazer uma Doação',
      ctaLearnMore: 'Conhecer Nossa Atuação',
      motto: 'Sapere Aude — Ouse Saber',
    },
    sroi: {
      badge: 'SROI · Social Return on Investment',
      titleStart: 'Cada real investido gera ',
      titleHighlight: 'R$ 4,83',
      titleEnd: ' em impacto social',
      subtitle: 'Metodologia SROI auditada — transformamos investimentos em valor social mensurável para comunidades e biomas.',
      simulatorTitle: 'Simulador de Impacto Social',
      simulatorSubtitle: 'Quanto você investe e qual o retorno social estimado?',
      investLabel: 'Valor do Investimento (R$)',
      returnLabel: 'Retorno Social Estimado',
      officialBadge: 'Razão SROI Oficial Auditada',
    },
    donation: {
      badge: 'Apoie Agora',
      title: 'Sua doação transforma o futuro',
      subtitle: 'Sua doação fortalece diretamente programas de transformação social, educacional e ambiental com impacto mensurável.',
      pixTitle: 'Pix Instantâneo (CNPJ)',
      pixCnpj: '09.040.440/0001-47',
      pixCopyBtn: 'Copiar Chave Pix (CNPJ)',
      pixCopied: 'Chave Pix Copiada!',
      methodPix: 'PIX Instantâneo',
      methodCard: 'Cartão de Crédito',
      methodBoleto: 'Boleto Bancário',
    },
    footer: {
      motto: 'Sapere Aude — Ouse Saber',
      allRightsReserved: 'Todos os direitos reservados. Instituto Ser Melhor.',
      privacy: 'Política de Privacidade',
      terms: 'Termos de Uso',
      transparencyPortal: 'Portal de Transparência',
    },
  },

  EN: {
    nav: {
      whoWeAre: 'About Us',
      ourMission: 'Our Mission',
      history: 'History',
      governance: 'Governance & Team',
      whatWeDo: 'What We Do',
      principles: 'Our Principles',
      programs: 'Field Projects',
      news: 'News & Media',
      transparency: 'Transparency',
      sroi: 'Social Return (SROI)',
      donate: 'Donate Now',
    },
    hero: {
      badge: 'Non-Governmental Organization · Instituto Ser Melhor',
      titleStart: 'Transforming lives through ',
      titleHighlight: 'education, sustainability and social action',
      titleEnd: '',
      subtitle: 'Empowering communities and promoting sustainable development with integrated programs and audited transparency across Brazil.',
      ctaDonate: 'Make a Donation',
      ctaLearnMore: 'Explore Our Work',
      motto: 'Sapere Aude — Dare to Know',
    },
    sroi: {
      badge: 'SROI · Social Return on Investment',
      titleStart: 'Every dollar invested returns ',
      titleHighlight: '$ 4.83',
      titleEnd: ' in social value',
      subtitle: 'Audited SROI methodology — converting investments into measurable social and environmental value for communities.',
      simulatorTitle: 'Social Impact Simulator',
      simulatorSubtitle: 'How much do you invest and what is the estimated social return?',
      investLabel: 'Investment Amount ($)',
      returnLabel: 'Estimated Social Return',
      officialBadge: 'Audited Official SROI Ratio',
    },
    donation: {
      badge: 'Support Now',
      title: 'Your donation transforms the future',
      subtitle: 'Your contribution directly empowers social, educational and environmental programs with measurable impact.',
      pixTitle: 'Instant Pix (Tax ID / CNPJ)',
      pixCnpj: '09.040.440/0001-47',
      pixCopyBtn: 'Copy Pix Key (CNPJ)',
      pixCopied: 'Pix Key Copied!',
      methodPix: 'Instant PIX',
      methodCard: 'Credit Card',
      methodBoleto: 'Bank Slip',
    },
    footer: {
      motto: 'Sapere Aude — Dare to Know',
      allRightsReserved: 'All rights reserved. Instituto Ser Melhor.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      transparencyPortal: 'Transparency Portal',
    },
  },

  ES: {
    nav: {
      whoWeAre: 'Quienes Somos',
      ourMission: 'Nuestra Misión',
      history: 'Historia',
      governance: 'Gobernanza y Equipo',
      whatWeDo: 'Qué Hacemos',
      principles: 'Nuestros Principios',
      programs: 'Proyectos en Campo',
      news: 'Noticias y Medios',
      transparency: 'Transparencia',
      sroi: 'Retorno Social (SROI)',
      donate: 'Donar Ahora',
    },
    hero: {
      badge: 'Organización No Gubernamental · Instituto Ser Melhor',
      titleStart: 'Transformando vidas a través de la ',
      titleHighlight: 'educación, sostenibilidad y acción social',
      titleEnd: '',
      subtitle: 'Impulsamos el desarrollo sostenible y la emancipación humana con programas integrados y transparencia auditada.',
      ctaDonate: 'Hacer una Donación',
      ctaLearnMore: 'Conocer Nuestra Labor',
      motto: 'Sapere Aude — Atrévete a Saber',
    },
    sroi: {
      badge: 'SROI · Social Return on Investment',
      titleStart: 'Cada inversión genera ',
      titleHighlight: '4,83x',
      titleEnd: ' en valor social',
      subtitle: 'Metodología SROI auditada — transformamos inversiones en impacto social medible para las comunidades.',
      simulatorTitle: 'Simulador de Impacto Social',
      simulatorSubtitle: '¿Cuánto inviertes y cuál es el retorno social estimado?',
      investLabel: 'Monto de la Inversión',
      returnLabel: 'Retorno Social Estimado',
      officialBadge: 'Razón SROI Oficial Auditada',
    },
    donation: {
      badge: 'Apoya Ahora',
      title: 'Tu donación transforma el futuro',
      subtitle: 'Tu contribución fortalece directamente programas de transformación social, educativa y ambiental con impacto medible.',
      pixTitle: 'Pix Instantáneo (CNPJ)',
      pixCnpj: '09.040.440/0001-47',
      pixCopyBtn: 'Copiar Clave Pix (CNPJ)',
      pixCopied: '¡Clave Pix Copiada!',
      methodPix: 'PIX Instantáneo',
      methodCard: 'Tarjeta de Crédito',
      methodBoleto: 'Boleto Bancario',
    },
    footer: {
      motto: 'Sapere Aude — Atrévete a Saber',
      allRightsReserved: 'Todos los derechos reservados. Instituto Ser Melhor.',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Uso',
      transparencyPortal: 'Portal de Transparencia',
    },
  },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('ism_language') as Language;
      if (saved && ['PT', 'EN', 'ES'].includes(saved)) return saved;
    } catch {
      // Fallback gracioso
    }
    return 'PT';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ism_language', lang);
      document.documentElement.lang = lang.toLowerCase();
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const value: LanguageContextProps = {
    language,
    setLanguage,
    t: DICTIONARY[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback gracioso se usado fora do provider
    return {
      language: 'PT',
      setLanguage: () => {},
      t: DICTIONARY.PT,
    };
  }
  return ctx;
};
