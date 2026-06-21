import {
  StrapiSingleResponse,
  StrapiCollectionResponse,
  InstitutionalPageAttributes,
  ValueBlockAttributes,
  GovernanceInstanceAttributes,
  TimelineMilestoneAttributes,
  GovernanceMemberAttributes,
  PartnerApplicationPayload,
  DonationPayload,
  TransparencyDocument
} from '../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Flag: só usa Firestore se as variáveis de ambiente estiverem configuradas
const FIREBASE_ENABLED = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

// Mock: GET /api/institutional-page
const mockPageResponse: StrapiSingleResponse<InstitutionalPageAttributes> = {
  data: {
    id: 1,
    attributes: {
      title: "Instituto Ser Melhor",
      introduction: "Somos uma organização não-governamental brasileira que atua como catalisadora de transformações sociais e ambientais. Nossa história é marcada pela busca incessante de redefinir o conceito de impacto sistêmico.",
      missionStatement: "Promover a completa emancipação humana e o desenvolvimento sustentável integral, atuando como catalisador inigualável de transformações sociais, ambientais, educacionais e culturais.",
      visionStatement: "Ser o fator decisivo na construção de um mundo equitativo, próspero e regenerativo, onde a necessidade da assistência social como a conhecemos tenha sido mitigada pela eficácia de nossas soluções.",
      governanceIntro: "A Governança do Instituto Ser Melhor é uma arquitetura de controle e deliberação desenhada para garantir a perpetuidade da Missão, a transparência quântica e a máxima eficiência na alocação de recursos.",
      transparencyIntro: "O Princípio da Transparência Quântica garante acesso irrestrito e auditado à nossa saúde financeira. Operamos com padrões que excedem as exigências legais.",
      logoImage: "/logo-ism.png",
      heroImage: "https://picsum.photos/1920/1080?grayscale",
      logoExplanation: "O emblema circular com três figuras humanas estilizadas representa o nosso foco no Desenvolvimento Sustentável Integral. O arco exterior amarelo simboliza o Ciclo da Prosperidade e a natureza regenerativa de nosso trabalho.",
      motto: "Sapere Aude",
      mottoExplanation: "Significa 'Ousa Saber'. Reflete nosso Valor de Excelência Inflexível e a importância da Educação Transformadora, posicionando o Instituto como promotor da autossuficiência intelectual.",
      networkIntro: "O Instituto Ser Melhor reconhece que a excelência não é alcançada no isolamento. Nossa Rede de Colaboração de Elite (R-CE) é um ecossistema seletivo de stakeholders globais.",
      transparencyDocuments: [
        {
          id: 1,
          documentName: "Demonstrações Financeiras 2024 (Auditado - Big 4)",
          documentType: "Financeiro",
          documentFile: "#",
          publicationDate: "2024-03-30",
          fileSize: "4.2 MB"
        },
        {
          id: 2,
          documentName: "Relatório Anual de Impacto e Atividades",
          documentType: "Impacto",
          documentFile: "#",
          publicationDate: "2024-03-15",
          fileSize: "15.4 MB"
        },
        {
          id: 3,
          documentName: "Código de Conduta Ética",
          documentType: "Código de Conduta",
          documentFile: "#",
          publicationDate: "2023-01-10",
          fileSize: "1.5 MB"
        }
      ]
    }
  },
  meta: {}
};

// Mock: GET /api/value-blocks
const mockValueBlocksResponse: StrapiCollectionResponse<ValueBlockAttributes> = {
  data: [
    {
      id: 1,
      attributes: {
        name: "Excelência Inflexível",
        iconIdentifier: "star",
        description: "Não buscamos apenas a melhoria; exigimos a perfeição. Nosso padrão de qualidade é o mais alto do mundo, sem margem para mediocridade."
      }
    },
    {
      id: 2,
      attributes: {
        name: "Transparência Quântica",
        iconIdentifier: "shield",
        description: "Operamos com um nível de clareza que excede normas globais. Nossa integridade é a essência visível de todas as decisões."
      }
    },
    {
      id: 3,
      attributes: {
        name: "Protagonismo Regenerativo",
        iconIdentifier: "zap",
        description: "Buscamos um impacto que não apenas restaure, mas aprimore e gere vitalidade nos sistemas sociais e ambientais."
      }
    },
    {
      id: 4,
      attributes: {
        name: "Compromisso Perpétuo",
        iconIdentifier: "infinity",
        description: "Nossa dedicação é incondicional e atemporal. Nosso trabalho é um legado que transcende gerações."
      }
    }
  ],
  meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
};

// Mock: GET /api/governance-instances
const mockGovernanceInstancesResponse: StrapiCollectionResponse<GovernanceInstanceAttributes> = {
  data: [
    {
      id: 1,
      attributes: {
        title: "Assembleia Geral de Associados Estratégicos",
        order: 1,
        summary: "Órgão Máximo e Soberano composto exclusivamente por membros com histórico comprovado de liderança.",
        keyAttributes: [
          { attributeText: "Aprovar ou rejeita demonstrações financeiras anuais auditadas." },
          { attributeText: "Elege e destitui membros dos Conselhos." },
          { attributeText: "Exige Quórum Qualificado (2/3) para deliberações patrimoniais." }
        ]
      }
    },
    {
      id: 2,
      attributes: {
        title: "Conselho Deliberativo de Excelência (CDE)",
        order: 2,
        summary: "Guardião da Integridade e Estratégia, responsável por supervisionar a Diretoria-Executiva.",
        keyAttributes: [
          { attributeText: "Independência Radical: Sem vínculos com a gestão executiva." },
          { attributeText: "Aprova Políticas de Risco e Compliance." },
          { attributeText: "Avaliação anual de performance do CEO baseada em KPIs." }
        ]
      }
    },
    {
      id: 3,
      attributes: {
        title: "Conselho Fiscal e de Auditoria Quântica (CFA)",
        order: 3,
        summary: "Assegura a Transparência Quântica e a aderência aos padrões IFRS.",
        keyAttributes: [
          { attributeText: "Emite Parecer Sem Ressalvas sobre Demonstrações Financeiras." },
          { attributeText: "Reporte direto à Assembleia Geral." }
        ]
      }
    },
    {
      id: 4,
      attributes: {
        title: "Diretoria-Executiva de Gestão (D-E)",
        order: 4,
        summary: "Responsável pela gestão estratégica e operacional do dia a dia e entrega de resultados.",
        keyAttributes: [
          { attributeText: "Liderada por CEO de visão global." },
          { attributeText: "Administração do patrimônio e execução orçamentária." }
        ]
      }
    },
    {
      id: 5,
      attributes: {
        title: "Conselho Consultivo de Liderança Global (CCLG)",
        order: 5,
        summary: "Líderes mundiais e ex-chefes de estado que fornecem orientação estratégica.",
        keyAttributes: [
          { attributeText: "Garante a Vantagem de Conhecimento (Knowledge Edge)." },
          { attributeText: "Natureza estritamente consultiva." }
        ]
      }
    }
  ],
  meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 5 } }
};

// Mock: GET /api/timeline-milestones
const mockTimelineMilestonesResponse: StrapiCollectionResponse<TimelineMilestoneAttributes> = {
  data: [
    {
      id: 1,
      attributes: {
        year: 2007,
        title: "Fundação Conceitual",
        impactDescription: "Estabelecimento do Instituto a partir da fusão de três fundações líderes e criação da Metodologia M-IS."
      }
    },
    {
      id: 2,
      attributes: {
        year: 2012,
        title: "Fundo Perpétuo",
        impactDescription: "Alcance da independência operacional com o Fundo F-P, assegurando 100% das doações para programas finalísticos."
      }
    },
    {
      id: 3,
      attributes: {
        year: 2015,
        title: "Prêmio Global GEA",
        impactDescription: "Recebimento do Global Excellence Award da ONU. A Metodologia M-IS torna-se benchmark global."
      }
    },
    {
      id: 4,
      attributes: {
        year: 2025,
        title: "Marco do Milhão",
        impactDescription: "Aproximação da meta de impactar um milhão de vidas e lançamento da Agenda 2035."
      }
    }
  ],
  meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 4 } }
};

// Mock Governance Members (Legacy/UI support)
const mockMembersResponse: StrapiCollectionResponse<GovernanceMemberAttributes> = {
  data: [
    {
      id: 1,
      attributes: {
        name: "Rikardo Ribeiro",
        role: "Presidente do CDE",
        type: "board",
        bio: "Referência global em conservação.",
        imageUrl: "https://picsum.photos/200/200?random=1"
      }
    },
    {
      id: 2,
      attributes: {
        name: "Rikardo Ribeiro",
        role: "CEO",
        type: "executive",
        bio: "Executivo premiado por inovação.",
        imageUrl: "https://picsum.photos/200/200?random=3"
      }
    }
  ],
  meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 2 } }
};

export const InstitutionalService = {
  getPage: async (): Promise<StrapiSingleResponse<InstitutionalPageAttributes>> => {
    return new Promise(resolve => setTimeout(() => resolve(mockPageResponse), 300));
  },
  getValueBlocks: async (): Promise<StrapiCollectionResponse<ValueBlockAttributes>> => {
    return new Promise(resolve => setTimeout(() => resolve(mockValueBlocksResponse), 300));
  },
  getGovernanceInstances: async (): Promise<StrapiCollectionResponse<GovernanceInstanceAttributes>> => {
    return new Promise(resolve => setTimeout(() => resolve(mockGovernanceInstancesResponse), 300));
  },
  getTimelineMilestones: async (): Promise<StrapiCollectionResponse<TimelineMilestoneAttributes>> => {
    return new Promise(resolve => setTimeout(() => resolve(mockTimelineMilestonesResponse), 300));
  },
  getGovernanceMembers: async (): Promise<StrapiCollectionResponse<GovernanceMemberAttributes>> => {
    return new Promise(resolve => setTimeout(() => resolve(mockMembersResponse), 300));
  },

  // POST — grava no Firestore (ou fallback mock em dev sem config)
  submitPartnerApplication: async (data: PartnerApplicationPayload): Promise<{ success: boolean; id: string }> => {
    if (!FIREBASE_ENABLED) {
      // Fallback mock quando Firestore não está configurado
      if (import.meta.env.DEV) {
        console.warn('[DEV] Firebase não configurado. Usando mock. Configure .env.local para ativar Firestore.');
        console.log('[DEV] Partner application data:', { type: data.type, status: data.status });
      }
      return new Promise(resolve => setTimeout(() => resolve({ success: true, id: `PARTNER-MOCK-${Date.now()}` }), 1500));
    }

    const docRef = await addDoc(collection(db, 'partner_applications'), {
      ...data,
      status: 'Novo',
      submissionDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });

    if (import.meta.env.DEV) {
      console.log('[Firestore] Partner application saved:', docRef.id);
    }
    return { success: true, id: docRef.id };
  },

  processDonation: async (data: DonationPayload): Promise<{ success: boolean; transactionId: string }> => {
    if (!FIREBASE_ENABLED) {
      if (import.meta.env.DEV) {
        console.warn('[DEV] Firebase não configurado. Usando mock.');
        console.log('[DEV] Donation data:', { amount: data.amount, currency: data.currency, type: data.type });
      }
      return new Promise(resolve => setTimeout(() => resolve({ success: true, transactionId: `TXN-MOCK-${Date.now()}` }), 2000));
    }

    const docRef = await addDoc(collection(db, 'donations'), {
      ...data,
      createdAt: serverTimestamp(),
    });

    if (import.meta.env.DEV) {
      console.log('[Firestore] Donation saved:', docRef.id);
    }
    return { success: true, transactionId: docRef.id };
  }
};