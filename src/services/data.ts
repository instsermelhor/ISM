/**
 * InstitutionalService — Site Principal
 * ─────────────────────────────────────
 * Lê dados institucionais do Firestore quando disponível,
 * e cai de volta nos mocks locais em dev sem configuração Firebase.
 *
 * Coleções lidas (escritas pelo Painel Admin):
 *   • institutional_page   (doc "main")  → página principal
 *   • value_blocks                       → blocos de valores
 *   • governance_instances               → instâncias de governança
 *   • timeline_milestones                → marcos históricos
 *   • governance_members                 → membros dos conselhos
 *   • programs                           → programas/projetos
 *   • impact_metrics                     → métricas de impacto
 *   • pillars                            → pilares institucionais
 *   • hero_section/main                  → seção hero
 *   • site_navigation/main               → menu header
 *   • site_footer/main                   → rodapé
 *   • blog_posts                         → artigos do blog
 *   • partners                           → parceiros publicados
 *   • seo_settings/main                  → configurações SEO
 *   • services_page/main                 → transparência/parcerias
 *   • donation_section/main              → seção de doações
 *
 * Formulários (gravados pelo site, lidos pelo admin):
 *   • partner_applications
 *   • donations
 *   • leads
 */

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
  TransparencyDocument,
  ProgramData
} from '../types';
import {
  collection, addDoc, getDoc, getDocs,
  doc, query, orderBy, where, serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Flag: usa Firestore real somente se as variáveis de ambiente estiverem presentes
const FIREBASE_ENABLED = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — Fallback para dev sem Firebase
// ─────────────────────────────────────────────────────────────────────────────

const mockPageResponse: StrapiSingleResponse<InstitutionalPageAttributes> = {
  data: {
    id: 1,
    attributes: {
      title: "Instituto Ser Melhor",
      introduction: "Somos uma organização não governamental brasileira dedicada a impulsionar transformações educacionais, sociais e ambientais. Nossa trajetória é movida pela busca contínua por redefinir as fronteiras do impacto sistêmico.",
      missionStatement: "Promover a emancipação humana e o desenvolvimento sustentável, atuando como catalisador de transformações sociais, ambientais, educacionais e culturais, com base em direitos, evidências e impacto mensurável.",
      visionStatement: "Ser uma organização de referência na construção de um mundo equitativo, próspero e regenerativo, onde o fortalecimento de capacidades e a garantia de direitos reduzam estruturalmente as situações de vulnerabilidade social.",
      governanceIntro: "A Governança do Instituto Ser Melhor é uma arquitetura de controle, deliberação e prestação de contas, estruturada para garantir a perpetuidade da missão institucional, a transparência, a integridade, a conformidade e a máxima eficiência na gestão e na alocação dos recursos.",
      transparencyIntro: "Garantimos acesso público e auditado às nossas demonstrações financeiras e relatórios de impacto. Operamos com padrões de transparência institucional compatíveis com as exigências legais e as melhores práticas internacionais de prestação de contas.",
      logoImage: "/logo-ism.png",
      heroImage: "https://picsum.photos/1920/1080?grayscale",
      logoExplanation: "O emblema circular com três figuras humanas estilizadas representa o nosso compromisso com o Desenvolvimento Sustentável Integral. O arco exterior amarelo simboliza o ciclo da prosperidade e a natureza regenerativa de nosso trabalho.",
      motto: "Sapere Aude",
      mottoExplanation: "Sapere Aude — Ouse Saber. Reflete nosso compromisso com a educação transformadora e a autonomia intelectual, posicionando o Instituto como promotor do pensamento crítico e da formação cidadã.",
      networkIntro: "O Instituto Ser Melhor reconhece que o impacto sustentável se constrói em parceria. Nosso Ecossistema Colaborativo Estratégico reúne organizações nacionais e internacionais comprometidas com o desenvolvimento sustentável e a inovação social.",
      transparencyDocuments: [
        { id: 1, documentName: "Demonstrações Financeiras 2024 (Auditado - Big 4)", documentType: "Financeiro", documentFile: "#", publicationDate: "2024-03-30", fileSize: "4.2 MB" },
        { id: 2, documentName: "Relatório Anual de Impacto e Atividades", documentType: "Impacto", documentFile: "#", publicationDate: "2024-03-15", fileSize: "15.4 MB" },
        { id: 3, documentName: "Código de Conduta Ética", documentType: "Código de Conduta", documentFile: "#", publicationDate: "2023-01-10", fileSize: "1.5 MB" },
      ]
    }
  },
  meta: {}
};

const mockValueBlocksResponse: StrapiCollectionResponse<ValueBlockAttributes> = {
  data: [
    { id: 1, attributes: { name: "Excelência com Integridade", iconIdentifier: "star", description: "Buscamos a melhoria contínua com rigor técnico, responsabilidade institucional e compromisso permanente com a qualidade de nossas ações e a dignidade das pessoas que atendemos." } },
    { id: 2, attributes: { name: "Transparência e Prestação de Contas", iconIdentifier: "shield", description: "Operamos com abertura e clareza em todos os processos, tornando públicas nossas decisões, contas e resultados de forma acessível, compreensível e auditável." } },
    { id: 3, attributes: { name: "Protagonismo Comunitário", iconIdentifier: "zap", description: "Reconhecemos as comunidades como protagonistas de seu próprio desenvolvimento, apoiando processos de fortalecimento de capacidades, autonomia e participação ativa na construção de soluções." } },
    { id: 4, attributes: { name: "Compromisso de Longo Prazo", iconIdentifier: "infinity", description: "Nossa atuação é orientada para impactos duradouros e estruturais, construindo legados que fortalecem gerações presentes e futuras com base em desenvolvimento sustentável e justiça social." } },
  ],
  meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
};

const mockGovernanceInstancesResponse: StrapiCollectionResponse<GovernanceInstanceAttributes> = {
  data: [
    { id: 1, attributes: { title: "Assembleia Geral de Associados", order: 1, summary: "Órgão máximo de deliberação institucional, responsável pelas decisões estratégicas e pela eleição dos demais órgãos de governança, nos termos do Estatuto Social e do Código Civil Brasileiro.", keyAttributes: [{ attributeText: "Aprova as demonstrações financeiras anuais auditadas por auditoria independente." }, { attributeText: "Elege e destituiu membros dos Conselhos Deliberativo e Fiscal." }, { attributeText: "Delibera alterações estatutárias por quórum qualificado (2/3 dos associados)." }] } },
    { id: 2, attributes: { title: "Conselho Deliberativo", order: 2, summary: "Órgão de supervisão e controle estratégico, responsável pela fiscalização da gestão executiva e pela aprovação de políticas institucionais de risco, compliance e integridade.", keyAttributes: [{ attributeText: "Independência funcional: membros sem vínculos com a gestão executiva." }, { attributeText: "Aprova políticas de gestão de riscos e compliance." }, { attributeText: "Avalia anualmente o desempenho da Diretoria Executiva com base em indicadores de impacto." }] } },
    { id: 3, attributes: { title: "Conselho Fiscal", order: 3, summary: "Órgão independente de fiscalização econômico-financeira, responsável pela emissão de pareceres sobre as demonstrações contábeis e pelo reporte direto à Assembleia Geral.", keyAttributes: [{ attributeText: "Emite parecer sobre as Demonstrações Financeiras auditadas." }, { attributeText: "Reporta diretamente à Assembleia Geral, assegurando independência." }, { attributeText: "Fiscaliza a aderência aos padrões contábeis e às normas legais aplicáveis." }] } },
    { id: 4, attributes: { title: "Diretoria Executiva", order: 4, summary: "Responsável pela gestão estratégica e operacional da instituição, pela execução orçamentária, pela prestação de contas e pela entrega dos resultados institucionais.", keyAttributes: [{ attributeText: "Executa o planejamento estratégico aprovado pelo Conselho Deliberativo." }, { attributeText: "Administra o patrimônio institucional com responsabilidade e transparência." }, { attributeText: "Presta contas periodicamente aos órgãos de governança e aos financiadores." }] } },
    { id: 5, attributes: { title: "Conselho Consultivo", order: 5, summary: "Órgão de caráter consultivo formado por especialistas nacionais e internacionais que contribuem com orientação técnica e estratégica para o fortalecimento da missão institucional.", keyAttributes: [{ attributeText: "Fornece orientação técnica especializada em áreas estratégicas de atuação." }, { attributeText: "Natureza estritamente consultiva, sem poder deliberativo." }, { attributeText: "Contribui para o alinhamento da atuação do Instituto com padrões internacionais." }] } },
  ],
  meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 5 } }
};

const mockTimelineMilestonesResponse: StrapiCollectionResponse<TimelineMilestoneAttributes> = {
  data: [
    {
      id: 1,
      attributes: {
        year: 2007,
        title: "Fundação Conceitual",
        impactDescription: "Surge a Associação de Bairro Vila Margarida, com o objetivo de representar a comunidade junto ao poder público e buscar melhorias essenciais para o bairro, como pavimentação das vias, iluminação pública e infraestrutura urbana."
      }
    },
    {
      id: 2,
      attributes: {
        year: 2012,
        title: "A Associação a Serviço da Sociedade",
        impactDescription: "A Associação de Bairro Vila Margarida amplia sua atuação e passa a desenvolver ações sociais voltadas às famílias em situação de vulnerabilidade, promovendo a distribuição de cestas básicas, leite e oferecendo transporte comunitário para facilitar o acesso da população aos serviços essenciais."
      }
    },
    {
      id: 3,
      attributes: {
        year: 2015,
        title: "Vila Margarida e a Educação",
        impactDescription: "É firmada parceria com a Associação de Professores da Educação Infantil, ampliando a atuação institucional para o atendimento de crianças da educação básica por meio de projetos educacionais."
      }
    },
    {
      id: 4,
      attributes: {
        year: 2017,
        title: "A Educação como Foco",
        impactDescription: "Uma nova parceria é estabelecida com a Associação Cultural Tiradentes, marcando o início do desenvolvimento de projetos de grande impacto social, educacional e cultural, fortalecendo o compromisso com a transformação das comunidades atendidas."
      }
    },
    {
      id: 5,
      attributes: {
        year: 2022,
        title: "O Surgimento do Instituto Ser Melhor",
        impactDescription: "A fusão das três entidades parceiras resulta na criação do Instituto Ser Melhor, consolidando uma nova estrutura institucional voltada ao desenvolvimento humano, à inovação social e à ampliação do impacto das ações realizadas."
      }
    },
    {
      id: 6,
      attributes: {
        year: 2023,
        title: "Consolidação dos Valores Institucionais",
        impactDescription: "Os princípios, valores e diretrizes institucionais são revisados e fortalecidos com a participação de profissionais de diversas áreas. Neste mesmo período, o Instituto Ser Melhor torna-se participante do Pacto Global das Nações Unidas, alinhando suas ações aos 17 Objetivos de Desenvolvimento Sustentável (ODS)."
      }
    },
    {
      id: 7,
      attributes: {
        year: 2024,
        title: "Reconhecimento Internacional",
        impactDescription: "O Instituto Ser Melhor recebe o Global Excellence Award (GEA) em reconhecimento às suas boas práticas institucionais. A Metodologia M-IS passa a ser reconhecida como referência internacional em inovação social. Também é implantada a metodologia SROI (Social Return on Investment), alcançando o índice de 1:4,83, demonstrando elevado retorno social sobre os investimentos realizados."
      }
    },
    {
      id: 8,
      attributes: {
        year: 2025,
        title: "Criação do Fundo Perpétuo",
        impactDescription: "É criado o Fundo Perpétuo (F-P), assegurando a sustentabilidade financeira da instituição e sua independência operacional. Com essa estrutura, 100% das doações recebidas passam a ser destinadas aos programas finalísticos, fortalecendo o compromisso com a transparência, a eficiência e o impacto social."
      }
    }
  ],
  meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 8 } }
};

const mockMembersResponse: StrapiCollectionResponse<GovernanceMemberAttributes> = {
  data: [
    { id: 1, attributes: { name: "Rikardo Ribeiro", role: "Presidente do CD", type: "board", bio: "Especialista em Governança Corporativa, ESG e Compliance. Atua na liderança do Conselho Deliberativo, orientando a supervisão estratégica, a gestão de riscos e a garantia da integridade ética da Entidade.", imageUrl: "https://picsum.photos/200/200?random=1" } },
    { id: 2, attributes: { name: "Rikardo Ribeiro", role: "CEO", type: "executive", bio: "Idealizador do Instituto Ser Melhor. Conduz a visão estratégica e a expansão global da organização, integrando inovação educacional, justiça socioambiental e soluções sistêmicas de alto impacto", imageUrl: "https://picsum.photos/200/200?random=3" } },
  ],
  meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 2 } }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Converte documentos Firestore para o formato Strapi-like do site
// ─────────────────────────────────────────────────────────────────────────────

/** Converte um array de docs Firestore em StrapiCollectionResponse */
function toCollection<T>(
  docs: { id: string; [key: string]: unknown }[],
  fallback: StrapiCollectionResponse<T>
): StrapiCollectionResponse<T> {
  if (!docs || docs.length === 0) return fallback;
  return {
    data: docs.map((d, i) => ({
      id: i + 1,
      attributes: d as unknown as T,
    })),
    meta: { pagination: { page: 1, pageSize: docs.length, pageCount: 1, total: docs.length } }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// InstitutionalService — API pública usada pelo App.tsx
// ─────────────────────────────────────────────────────────────────────────────

export const InstitutionalService = {

  /** Dados da página institucional */
  getPage: async (): Promise<StrapiSingleResponse<InstitutionalPageAttributes>> => {
    if (!FIREBASE_ENABLED) {
      return new Promise(resolve => setTimeout(() => resolve(mockPageResponse), 300));
    }
    try {
      const snap = await getDoc(doc(db, 'institutional_page', 'main'));
      if (snap.exists()) {
        const data = snap.data() as InstitutionalPageAttributes;
        return { data: { id: 1, attributes: data }, meta: {} };
      }
      // Coleção ainda não inicializada — usa mock e avisa
      if (import.meta.env.DEV) {
        console.warn('[Firestore] institutional_page não encontrada. Use o admin para fazer o seed.');
      }
      return mockPageResponse;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar institutional_page:', err);
      return mockPageResponse;
    }
  },

  /** Blocos de valores/pilares */
  getValueBlocks: async (): Promise<StrapiCollectionResponse<ValueBlockAttributes>> => {
    if (!FIREBASE_ENABLED) {
      return new Promise(resolve => setTimeout(() => resolve(mockValueBlocksResponse), 300));
    }
    try {
      const q = query(collection(db, 'value_blocks'), orderBy('order'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return toCollection<ValueBlockAttributes>(
          snap.docs.map(d => ({ id: d.id, ...d.data() })),
          mockValueBlocksResponse
        );
      }
      if (import.meta.env.DEV) {
        console.warn('[Firestore] value_blocks vazio. Use o admin para fazer o seed.');
      }
      return mockValueBlocksResponse;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar value_blocks:', err);
      return mockValueBlocksResponse;
    }
  },

  /** Instâncias de governança */
  getGovernanceInstances: async (): Promise<StrapiCollectionResponse<GovernanceInstanceAttributes>> => {
    if (!FIREBASE_ENABLED) {
      return new Promise(resolve => setTimeout(() => resolve(mockGovernanceInstancesResponse), 300));
    }
    try {
      const q = query(collection(db, 'governance_instances'), orderBy('order'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return toCollection<GovernanceInstanceAttributes>(
          snap.docs.map(d => ({ id: d.id, ...d.data() })),
          mockGovernanceInstancesResponse
        );
      }
      if (import.meta.env.DEV) {
        console.warn('[Firestore] governance_instances vazio. Use o admin para fazer o seed.');
      }
      return mockGovernanceInstancesResponse;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar governance_instances:', err);
      return mockGovernanceInstancesResponse;
    }
  },

  /** Marcos históricos */
  getTimelineMilestones: async (): Promise<StrapiCollectionResponse<TimelineMilestoneAttributes>> => {
    if (!FIREBASE_ENABLED) {
      return new Promise(resolve => setTimeout(() => resolve(mockTimelineMilestonesResponse), 300));
    }
    try {
      const q = query(collection(db, 'timeline_milestones'), orderBy('year'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return toCollection<TimelineMilestoneAttributes>(
          snap.docs.map(d => ({ id: d.id, ...d.data() })),
          mockTimelineMilestonesResponse
        );
      }
      if (import.meta.env.DEV) {
        console.warn('[Firestore] timeline_milestones vazio. Use o admin para fazer o seed.');
      }
      return mockTimelineMilestonesResponse;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar timeline_milestones:', err);
      return mockTimelineMilestonesResponse;
    }
  },

  /** Membros dos conselhos */
  getGovernanceMembers: async (): Promise<StrapiCollectionResponse<GovernanceMemberAttributes>> => {
    if (!FIREBASE_ENABLED) {
      return new Promise(resolve => setTimeout(() => resolve(mockMembersResponse), 300));
    }
    try {
      const snap = await getDocs(collection(db, 'governance_members'));
      if (!snap.empty) {
        return toCollection<GovernanceMemberAttributes>(
          snap.docs.map(d => ({ id: d.id, ...d.data() })),
          mockMembersResponse
        );
      }
      if (import.meta.env.DEV) {
        console.warn('[Firestore] governance_members vazio. Use o admin para fazer o seed.');
      }
      return mockMembersResponse;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar governance_members:', err);
      return mockMembersResponse;
    }
  },

  // ── Programas / Serviços (publicados pelo Admin) ────────────────────────

  /** Retorna todos os programas cadastrados no Admin */
  getPrograms: async (): Promise<ProgramData[]> => {
    const mockPrograms: ProgramData[] = [
      {
        id: '1',
        order: 1,
        title: 'Educação Transformadora de Qualidade',
        slug: 'educacao-transformadora',
        description: 'O Instituto Ser Melhor acredita que a educação é o instrumento mais poderoso para romper ciclos de vulnerabilidade, promover dignidade humana e construir uma sociedade mais justa, segura e inclusiva. Por isso, desenvolvemos uma proposta de Educação Transformadora de Qualidade, que vai além da transmissão de conteúdos e busca formar seres humanos preparados para enfrentar os desafios da vida com conhecimento, ética, equilíbrio emocional e responsabilidade social.',
        longDescription: `Nossa atuação considera cada pessoa em sua integralidade, valorizando suas potencialidades, sua história e seu contexto social. Acreditamos que aprender significa desenvolver competências acadêmicas, emocionais, sociais e profissionais capazes de gerar autonomia, protagonismo e oportunidades reais de transformação.

Nossa metodologia integra práticas reconhecidas internacionalmente, como aprendizagem baseada em projetos, metodologias ativas, educação socioemocional, cultura da paz, inovação, pensamento crítico, resolução de problemas e trabalho colaborativo. O aprendizado é construído por meio de experiências significativas, permitindo que crianças, adolescentes, jovens e adultos sejam protagonistas de sua própria jornada de desenvolvimento.

No Instituto Ser Melhor, a educação também representa proteção social. Cada ação educativa fortalece vínculos familiares e comunitários, promove o respeito aos direitos humanos, previne situações de violência e amplia as perspectivas de futuro das pessoas atendidas.

Mais do que oferecer cursos ou atividades educativas, criamos oportunidades para que cada indivíduo desenvolva competências para a vida, fortaleça sua autoestima, descubra seus talentos e construa um projeto de vida baseado em valores, cidadania e propósito.`,
        pillarsTitle: 'Nossos pilares',
        pillars: [
          'Educação centrada na pessoa e no desenvolvimento integral.',
          'Aprendizagem significativa com metodologias inovadoras.',
          'Desenvolvimento de competências socioemocionais.',
          'Formação para cidadania, ética e direitos humanos.',
          'Inclusão, diversidade e equidade.',
          'Cultura da paz e prevenção das violências.',
          'Desenvolvimento profissional e empregabilidade.',
          'Tecnologia, inovação e competências digitais.',
          'Participação da família e fortalecimento comunitário.',
          'Avaliação contínua do impacto social das ações.',
        ],
        commitmentTitle: 'Nosso compromisso',
        commitment: 'Promover uma educação que transforma vidas, fortalece comunidades e cria oportunidades permanentes de desenvolvimento humano. Cada estudante atendido pelo Instituto Ser Melhor é incentivado a tornar-se agente de transformação em sua família, em sua comunidade e na sociedade, contribuindo para um futuro mais justo, solidário e sustentável.',
        iconEmoji: '📚',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
        isPublished: true,
        targetAudience: 'Crianças, adolescentes, jovens e adultos em situação de vulnerabilidade social',
        tags: ['Educação', 'Jovens', 'Metodologias Ativas', 'Socioemocional'],
        ctaLabel: 'Saiba Mais',
        ctaUrl: '#',
        impactMetric: 'Jovens Capacitados',
        impactValue: '50.000+',
        linkUrl: '',
        linkLabel: '',
      },
      {
        id: '4',
        order: 2,
        title: 'Projeto AURA',
        slug: 'projeto-aura',
        description: 'Apoio psicossocial integrativo para o fortalecimento da vida. Com o compromisso de quebrar ciclos de violência e adoecimento mental, o Projeto AURA atua no suporte psicossocial de pessoas em extrema vulnerabilidade social e no cuidado mental preventivo para agentes de segurança pública. Nosso objetivo é construir pontes de empatia, promover a resiliência e garantir o direito ao bem-estar emocional para quem mais precisa.',
        longDescription: '',
        iconEmoji: '🌟',
        imageUrl: '/images/projeto-aura.jpg',
        isPublished: true,
        targetAudience: 'Pessoas em vulnerabilidade social e agentes de segurança pública',
        tags: ['Social', 'Saúde Mental'],
        ctaLabel: 'Conhecer o AURA',
        ctaUrl: 'https://www.aura.institutosermelhor.org',
        impactMetric: 'Pessoas Atendidas',
        impactValue: 'Em expansão',
        linkUrl: '',
        linkLabel: '',
      },
      {
        id: '2',
        order: 3,
        title: 'Proteção, Preservação e Restauração dos Biomas',
        slug: 'protecao-biomas',
        description: 'O Instituto Ser Melhor compreende que a proteção dos biomas brasileiros é uma responsabilidade coletiva e um compromisso essencial com as atuais e futuras gerações. Nossa atuação socioambiental busca promover a conservação da biodiversidade, a recuperação de áreas degradadas e o fortalecimento da relação harmoniosa entre as pessoas e a natureza, reconhecendo que o equilíbrio ambiental é indispensável para a qualidade de vida, a saúde e o desenvolvimento sustentável.',
        longDescription: `Por meio do programa Proteção, Preservação e Restauração dos Biomas, desenvolvemos iniciativas que unem educação ambiental, mobilização comunitária, ciência, inovação e ação prática para proteger os ecossistemas naturais e fortalecer a consciência ambiental da sociedade.

Nossa metodologia é inspirada nas melhores práticas nacionais e internacionais de conservação, promovendo ações integradas que envolvem governos, universidades, organizações da sociedade civil, empresas e comunidades locais na construção de soluções sustentáveis para os desafios ambientais contemporâneos. A restauração ecológica é compreendida não apenas como o plantio de árvores, mas como um processo contínuo de recuperação dos ecossistemas, valorização da biodiversidade e fortalecimento das comunidades que convivem com esses territórios.

Acreditamos que preservar a natureza também significa promover inclusão social, geração de conhecimento, fortalecimento das economias sustentáveis e valorização dos saberes tradicionais. Por isso, nossas ações priorizam a participação ativa da sociedade, estimulando o protagonismo de crianças, adolescentes, jovens e adultos como agentes de transformação ambiental.

Mais do que conservar áreas naturais, buscamos formar uma cultura permanente de responsabilidade socioambiental, incentivando atitudes conscientes, consumo responsável, respeito à biodiversidade e compromisso com a sustentabilidade em todos os espaços da vida.`,
        pillarsTitle: 'Nossos pilares',
        pillars: [
          'Conservação da biodiversidade e dos ecossistemas brasileiros.',
          'Proteção dos biomas e dos recursos naturais.',
          'Restauração ecológica de áreas degradadas.',
          'Educação ambiental transformadora e permanente.',
          'Formação de multiplicadores socioambientais.',
          'Participação comunitária e voluntariado ambiental.',
          'Valorização dos povos e comunidades tradicionais.',
          'Incentivo à economia sustentável e à sociobiodiversidade.',
          'Pesquisa, inovação e monitoramento ambiental.',
          'Parcerias estratégicas para ampliar o impacto socioambiental.',
          'Promoção da cultura da sustentabilidade e da responsabilidade climática.',
        ],
        actionLinesTitle: 'Linhas de atuação',
        actionLinesSub: 'O Instituto Ser Melhor desenvolve e apoia projetos voltados para:',
        actionLines: [
          'Recuperação de áreas degradadas e reflorestamento com espécies nativas.',
          'Proteção de nascentes, rios, matas ciliares e recursos hídricos.',
          'Conservação da fauna e da flora.',
          'Educação ambiental em escolas, comunidades e instituições.',
          'Mutirões de limpeza e recuperação de espaços naturais.',
          'Incentivo à coleta seletiva, reciclagem e economia circular.',
          'Formação de lideranças ambientais comunitárias.',
          'Apoio a iniciativas de agricultura sustentável e sistemas agroflorestais.',
          'Campanhas de conscientização sobre mudanças climáticas e consumo consciente.',
          'Desenvolvimento de programas de voluntariado socioambiental.',
        ],
        commitmentTitle: 'Nosso compromisso',
        commitment: `Nosso compromisso é contribuir para a preservação dos biomas brasileiros por meio de ações que integrem conservação ambiental, desenvolvimento humano e inclusão social. Acreditamos que proteger a natureza é proteger a vida, fortalecer as comunidades e garantir que as próximas gerações herdem um planeta mais equilibrado, resiliente e sustentável.

Cada projeto desenvolvido pelo Instituto Ser Melhor busca gerar impacto ambiental mensurável, fortalecer a cidadania ecológica e transformar pessoas em protagonistas da conservação dos recursos naturais, promovendo um futuro em que desenvolvimento e preservação caminhem lado a lado.`,
        iconEmoji: '🌿',
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
        isPublished: true,
        targetAudience: 'Comunidades locais, ribeirinhas, escolas e sociedade em geral',
        tags: ['Meio Ambiente', 'Restauração', 'Biodiversidade', 'Sustentabilidade'],
        ctaLabel: 'Saiba Mais',
        ctaUrl: '#',
        impactMetric: 'Hectares Recuperados',
        impactValue: '120.000',
        linkUrl: '',
        linkLabel: '',
      },
      {
        id: '3',
        order: 4,
        title: 'Saúde & Bem-Estar Comunitário',
        slug: 'saude-comunidade',
        description: 'O Instituto Ser Melhor acredita que a saúde é um direito fundamental e um dos principais pilares para o desenvolvimento humano, a inclusão social e a construção de comunidades mais resilientes. Por isso, desenvolvemos o programa Saúde & Bem-Estar Comunitário, uma iniciativa que promove o cuidado integral das pessoas por meio de ações preventivas, educativas, assistenciais e de fortalecimento dos vínculos comunitários.',
        longDescription: `Nossa atuação compreende que saúde vai muito além da ausência de doenças. Ela envolve o equilíbrio físico, mental, emocional, social e ambiental, permitindo que cada indivíduo desenvolva plenamente suas capacidades, fortaleça sua autonomia e viva com dignidade e qualidade de vida.

Inspirado nas melhores práticas nacionais e internacionais de promoção da saúde, o Instituto Ser Melhor desenvolve projetos que integram educação em saúde, saúde mental, prevenção de doenças, práticas integrativas, incentivo aos hábitos saudáveis, fortalecimento das redes de apoio e ampliação do acesso aos serviços essenciais, especialmente para pessoas em situação de vulnerabilidade social.

Nossa metodologia prioriza a prevenção, a promoção da saúde e o cuidado humanizado, fortalecendo a participação ativa das famílias e das comunidades na construção de ambientes mais saudáveis, seguros e acolhedores. Trabalhamos de forma integrada com profissionais de diferentes áreas, instituições públicas, universidades, empresas, voluntários e organizações parceiras para ampliar o impacto social das nossas ações.

O Instituto Ser Melhor também reconhece que fatores como educação, alimentação, moradia, segurança, trabalho, cultura, lazer, meio ambiente e acesso à informação influenciam diretamente a saúde das pessoas. Por isso, desenvolvemos ações interdisciplinares que enfrentam os determinantes sociais da saúde e promovem soluções sustentáveis para o bem-estar coletivo.

Mais do que oferecer atendimentos e serviços, buscamos fortalecer a capacidade das comunidades de cuidar de si mesmas, promovendo conhecimento, autonomia, solidariedade e participação cidadã como instrumentos permanentes de transformação social.`,
        pillarsTitle: 'Nossos pilares',
        pillars: [
          'Promoção da saúde integral e da qualidade de vida.',
          'Prevenção de doenças e agravos à saúde.',
          'Saúde mental e apoio psicossocial.',
          'Educação em saúde e promoção do autocuidado.',
          'Alimentação saudável e segurança alimentar.',
          'Incentivo à prática de atividades físicas e hábitos saudáveis.',
          'Fortalecimento dos vínculos familiares e comunitários.',
          'Atenção humanizada às populações em situação de vulnerabilidade.',
          'Inclusão social, equidade e respeito à diversidade.',
          'Atuação integrada com o Sistema Único de Saúde (SUS) e demais redes de proteção social.',
          'Monitoramento e avaliação do impacto social das ações.',
        ],
        actionLinesTitle: 'Linhas de atuação',
        actionLinesSub: 'O Instituto Ser Melhor desenvolve e apoia iniciativas voltadas para:',
        actionLines: [
          'Promoção da saúde física, mental e emocional.',
          'Atendimento psicológico, psiquiátrico e psicossocial, conforme os projetos institucionais.',
          'Programas de prevenção ao uso de álcool, tabaco e outras drogas.',
          'Campanhas de vacinação, prevenção e educação em saúde em parceria com a rede pública.',
          'Educação alimentar, nutricional e incentivo à alimentação saudável.',
          'Ações de combate ao sedentarismo e incentivo à atividade física.',
          'Promoção da saúde da mulher, da criança, do adolescente, da pessoa idosa e das pessoas com deficiência.',
          'Apoio às vítimas de violência e pessoas em situação de vulnerabilidade.',
          'Formação de agentes comunitários e multiplicadores de saúde.',
          'Desenvolvimento de projetos de promoção da saúde em escolas, empresas e comunidades.',
        ],
        commitmentTitle: 'Nosso compromisso',
        commitment: `Nosso compromisso é construir comunidades mais saudáveis, solidárias e resilientes, onde cada pessoa tenha acesso a oportunidades de cuidado, desenvolvimento e qualidade de vida. Acreditamos que investir em saúde é investir na dignidade humana, na prevenção das vulnerabilidades e no fortalecimento do capital social das comunidades.

Por meio de ações integradas, humanizadas e baseadas em evidências, o Instituto Ser Melhor promove um modelo de cuidado que coloca as pessoas no centro das decisões, fortalece a cidadania e contribui para uma sociedade mais justa, inclusiva e comprometida com o bem-estar coletivo.`,
        iconEmoji: '❤️',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
        isPublished: true,
        targetAudience: 'Famílias em situação de vulnerabilidade, comunidades locais e sociedade em geral',
        tags: ['Saúde', 'Bem-Estar', 'Prevenção', 'Apoio Psicossocial'],
        ctaLabel: 'Saiba Mais',
        ctaUrl: '#',
        impactMetric: 'Atendimentos/ano',
        impactValue: '200.000',
        linkUrl: '',
        linkLabel: '',
      },
    ];
    if (!FIREBASE_ENABLED) return mockPrograms;
    try {
      const q = query(collection(db, 'programs'), orderBy('order'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgramData));
      }
      return mockPrograms;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar programs:', err);
      return mockPrograms;
    }
  },

  /** Retorna configuração da página de serviços (transparência, parcerias, etc.) */
  getServicesPage: async (): Promise<Record<string, any> | null> => {
    if (!FIREBASE_ENABLED) return null;
    try {
      const snap = await getDoc(doc(db, 'services_page', 'main'));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar services_page:', err);
      return null;
    }
  },

  /** Retorna a configuração da seção de doação */
  getDonationSection: async (): Promise<Record<string, any> | null> => {
    if (!FIREBASE_ENABLED) return null;
    try {
      const snap = await getDoc(doc(db, 'donation_section', 'main'));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar donation_section:', err);
      return null;
    }
  },

  /** Retorna as configurações de SEO */
  getSeoSettings: async (): Promise<Record<string, any> | null> => {
    if (!FIREBASE_ENABLED) return null;
    try {
      const snap = await getDoc(doc(db, 'seo_settings', 'main'));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar seo_settings:', err);
      return null;
    }
  },

  /** Retorna a seção Hero da capa */
  getHeroSection: async (): Promise<Record<string, any> | null> => {
    if (!FIREBASE_ENABLED) return null;
    try {
      const snap = await getDoc(doc(db, 'hero_section', 'main'));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar hero_section:', err);
      return null;
    }
  },

  /** Retorna as métricas de impacto */
  getMetrics: async (): Promise<any[]> => {
    // Fallback para dev sem Firebase — espelha o seed do admin
    const METRICS_FALLBACK = [
      { id: 'm1', order: 1, value: '32000', suffix: '+', prefix: '', label: 'Beneficiários Diretos', sublabel: 'Famílias e indivíduos assistidos anualmente', iconKey: 'users', color: '#1E3A8A', decimals: 0 },
      { id: 'm2', order: 2, value: '78', suffix: '', prefix: '', label: 'Municípios', sublabel: 'Presença em todo o território nacional', iconKey: 'map-pin', color: '#D97706', decimals: 0 },
      { id: 'm3', order: 3, value: '50', suffix: '+', prefix: '', label: 'Parceiros Globais', sublabel: 'Organizações, empresas e governos', iconKey: 'handshake', color: '#15803D', decimals: 0 },
      { id: 'm4', order: 4, value: '15', suffix: '+', prefix: '', label: 'Anos de Impacto', sublabel: 'Construindo futuro desde 2007', iconKey: 'calendar', color: '#C2410C', decimals: 0 },
      { id: 'm5', order: 5, value: '4.85', suffix: '', prefix: 'R$', label: 'SROI por Real Investido', sublabel: 'Retorno social comprovado por metodologia SROI', iconKey: 'trending-up', color: '#16a34a', decimals: 2 },
      { id: 'm6', order: 6, value: '100', suffix: '%', prefix: '', label: 'Transparência', sublabel: 'Todas as contas auditadas e publicadas', iconKey: 'file-text', color: '#6366f1', decimals: 0 },
    ];
    if (!FIREBASE_ENABLED) return METRICS_FALLBACK;
    try {
      const q = query(collection(db, 'impact_metrics'), orderBy('order'));
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return METRICS_FALLBACK;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar impact_metrics:', err);
      return METRICS_FALLBACK;
    }
  },

  /** Retorna os pilares de atuação */
  getPillars: async (): Promise<any[]> => {
    // Fallback para dev sem Firebase — espelha o seed do admin
    const PILLARS_FALLBACK = [
      { id: 'p1', order: 1, key: 'education', label: 'Educação', headline: 'Formando líderes que transformam o amanhã', description: 'Acreditamos que a educação de qualidade é a alavanca mais poderosa para romper ciclos de vulnerabilidade.', longDescription: 'Nossos programas de educação cobrem desde a literacia digital para jovens em situação de risco até bolsas de formação continuada para educadores de base.', iconKey: 'book-open', color: '#1E3A8A', colorLight: '#dbeafe', kpis: [{ value: '6.5k+', label: 'Estudantes atendidos' }, { value: '142', label: 'Escolas parceiras' }, { value: '94%', label: 'Aprovação ensino médio' }], programs: ['Bolsas Universitárias', 'Letramento Digital', 'Mentoria de Carreira', 'Formação de Professores'], ctaHref: '#programs' },
      { id: 'p2', order: 2, key: 'social', label: 'Social', headline: 'Redes de proteção que ninguém deixa para trás', description: 'Construímos sistemas de apoio social resilientes, centrados na dignidade e na autonomia das pessoas.', longDescription: 'Atuamos na linha de frente da vulnerabilidade social, oferecendo assistência jurídica, apoio psicossocial, programas de habitação digna e geração de renda.', iconKey: 'users', color: '#D97706', colorLight: '#fef3c7', kpis: [{ value: '5k+', label: 'Famílias assistidas' }, { value: '78', label: 'Municípios cobertos' }, { value: 'R$4,85', label: 'SROI por real investido' }], programs: ['Assistência Jurídica Gratuita', 'Apoio Psicossocial', 'Geração de Renda', 'Habitação Digna'], ctaHref: '#programs' },
      { id: 'p3', order: 3, key: 'environment', label: 'Meio Ambiente', headline: 'Protegendo biomas para as próximas gerações', description: 'Nossas ações ambientais integram conservação, restauração ecológica e educação ambiental transformadora.', longDescription: 'Desenvolvemos projetos de proteção e restauração de biomas brasileiros, combinando ciência de ponta, tecnologia de monitoramento e participação comunitária.', iconKey: 'leaf', color: '#15803D', colorLight: '#dcfce7', kpis: [{ value: '120k', label: 'Hectares recuperados' }, { value: '250k+', label: 'Árvores plantadas' }, { value: '5', label: 'Biomas protegidos' }], programs: ['Reflorestamento', 'Educação Ambiental', 'Monitoramento por Satélite', 'Comunidades Sustentáveis'], ctaHref: '#programs' },
      { id: 'p4', order: 4, key: 'culture', label: 'Cultura & Arte', headline: 'Arte como ferramenta de transformação social', description: 'Acreditamos no poder da cultura e da arte para restaurar identidades, fortalecer comunidades e criar pontes de diálogo.', longDescription: 'Nossos programas culturais oferecem acesso democrático à arte, à música, ao teatro e à literatura para comunidades historicamente privadas desse direito.', iconKey: 'palette', color: '#7C3AED', colorLight: '#ede9fe', kpis: [{ value: '200+', label: 'Projetos culturais' }, { value: '45k+', label: 'Participantes' }, { value: '18', label: 'Estados alcançados' }], programs: ['Arte-Educação', 'Música nas Escolas', 'Teatro Comunitário', 'Biblioteca Viva'], ctaHref: '#programs' },
    ];
    if (!FIREBASE_ENABLED) return PILLARS_FALLBACK;
    try {
      const q = query(collection(db, 'pillars'), orderBy('order'));
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return PILLARS_FALLBACK;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar pillars:', err);
      return PILLARS_FALLBACK;
    }
  },

  /** Retorna a estrutura de navegação do header */
  getNavigation: async (): Promise<Record<string, any> | null> => {
    if (!FIREBASE_ENABLED) return null;
    try {
      const snap = await getDoc(doc(db, 'site_navigation', 'main'));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar site_navigation:', err);
      return null;
    }
  },

  /** Retorna os dados do rodapé */
  getFooter: async (): Promise<Record<string, any> | null> => {
    if (!FIREBASE_ENABLED) return null;
    try {
      const snap = await getDoc(doc(db, 'site_footer', 'main'));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar site_footer:', err);
      return null;
    }
  },

  /** Retorna artigos do blog publicados */
  getBlogPosts: async (): Promise<any[]> => {
    const BLOG_FALLBACK = [
      { id: 'b1', title: 'Relatório de Impacto Socioambiental 2024', slug: 'relatorio-impacto-2024', summary: 'Apresentamos os resultados alcançados pelo Instituto Ser Melhor no último ano, destacando mais de 5 mil famílias impactadas e 120 mil hectares de bioma protegidos.', coverImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80', author: { name: 'Rikardo Ribeiro', role: 'Presidente Executivo' }, category: 'Relatório de Impacto', tags: ['Transparência', 'ESG'], status: 'PUBLISHED', publishedAt: new Date('2024-12-15').toISOString(), readTimeMinutes: 6, featured: true },
      { id: 'b2', title: 'Projeto AURA: Cuidado Mental Preventivo e Suporte Psicossocial', slug: 'projeto-aura-saude-mental', summary: 'Conheça o modelo integrativo de acolhimento psicossocial do Projeto AURA, focado no fortalecimento emocional e quebra de ciclos de vulnerabilidade.', coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80', author: { name: 'Equipe AURA', role: 'Núcleo Psicossocial' }, category: 'Saúde & Bem-Estar', tags: ['Saúde Mental', 'AURA'], status: 'PUBLISHED', publishedAt: new Date('2025-01-20').toISOString(), readTimeMinutes: 4, featured: false },
    ];
    if (!FIREBASE_ENABLED) return BLOG_FALLBACK;
    try {
      const q = query(
        collection(db, 'blog_posts'),
        where('status', '==', 'PUBLISHED'),
        orderBy('publishedAt', 'desc')
      );
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return BLOG_FALLBACK;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar blog_posts:', err);
      return BLOG_FALLBACK;
    }
  },

  /** Retorna parceiros publicados no site */
  getPartners: async (): Promise<any[]> => {
    const PARTNERS_FALLBACK = [
      { id: '1', order: 1, name: 'Nações Unidas (ONU)', category: 'ORGANISMOS_INTERNACIONAIS', country: 'Suíça', logoUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&q=80', websiteUrl: 'https://un.org', description: 'Parceiro em Objetivos de Desenvolvimento Sustentável.', status: 'PUBLISHED', isPublished: true, tier: 'TIER_1' },
      { id: '2', order: 2, name: 'Fundação Global Clima', category: 'FINANCIADORES', country: 'Alemanha', logoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80', websiteUrl: 'https://example.org', description: 'Financiamento de bolsas ambientais e inovação climática.', status: 'PUBLISHED', isPublished: true, tier: 'TIER_1' },
      { id: '3', order: 3, name: 'Aliança para Redução da Pobreza', category: 'OSCS', country: 'Brasil', logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80', websiteUrl: 'https://example.org', description: 'Desenvolvimento social e apoio psicossocial comunitário.', status: 'PUBLISHED', isPublished: true, tier: 'TIER_2' },
      { id: '4', order: 4, name: 'Universidade de São Paulo (USP)', category: 'UNIVERSIDADES', country: 'Brasil', logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&q=80', websiteUrl: 'https://usp.br', description: 'Cooperação acadêmica, pesquisa aplicada e extensão universitária.', status: 'PUBLISHED', isPublished: true, tier: 'TIER_2' },
      { id: '5', order: 5, name: 'Empresa Sustentável Global', category: 'EMPRESAS', country: 'Brasil', logoUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=300&q=80', websiteUrl: 'https://example.com', description: 'Investimento privado social e projetos corporativos ESG.', status: 'PUBLISHED', isPublished: true, tier: 'TIER_3' },
    ];
    if (!FIREBASE_ENABLED) return PARTNERS_FALLBACK;
    try {
      const q = query(
        collection(db, 'partners'),
        where('isPublished', '==', true),
        orderBy('order')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return list.filter((p: any) => p.status !== 'DRAFT' && p.status !== 'ARCHIVED');
      }
      return PARTNERS_FALLBACK;
    } catch (err) {
      console.error('[Firestore] Erro ao buscar partners:', err);
      return PARTNERS_FALLBACK;
    }
  },




  /** Submissão de candidatura de parceria */
  submitPartnerApplication: async (data: PartnerApplicationPayload): Promise<{ success: boolean; id: string }> => {
    if (!FIREBASE_ENABLED) {
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

  /** Processamento de doação */
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