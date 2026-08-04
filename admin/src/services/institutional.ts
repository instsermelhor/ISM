/**
 * InstitutionalFirestoreService
 * ─────────────────────────────
 * Serviço do PAINEL ADMIN para gerenciar os dados institucionais no Firestore.
 *
 * Coleções gerenciadas (lidas pelo site principal via src/services/data.ts):
 *   • institutional_page   — documento único (id: "main")
 *   • value_blocks         — coleção de valores/pilares
 *   • governance_instances — instâncias de governança
 *   • timeline_milestones  — marcos históricos
 *   • governance_members   — membros dos conselhos
 */

import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, addDoc, deleteDoc,
  writeBatch,
  serverTimestamp,
  query, orderBy,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Tipos simplificados (espelham src/types.ts do site principal) ──────────

export interface InstitutionalPageData {
  title: string;
  introduction: string;
  missionStatement: string;
  visionStatement: string;
  governanceIntro: string;
  transparencyIntro: string;
  logoImage: string;
  heroImage: string;
  logoExplanation: string;
  motto: string;
  mottoExplanation: string;
  networkIntro: string;
  networkCards?: { id: string; icon: string; title: string; description: string }[];
  transparencyDocuments: TransparencyDoc[];
  updatedAt?: unknown;
}


export interface TransparencyDoc {
  id: number;
  documentName: string;
  documentType: string;
  documentFile: string;
  publicationDate: string;
  fileSize: string;
}

export interface ValueBlockData {
  id?: string;
  name: string;
  iconIdentifier: string;
  description: string;
  order?: number;
}

export interface GovernanceInstanceData {
  id?: string;
  title: string;
  order: number;
  summary: string;
  keyAttributes: { attributeText: string }[];
}

export interface TimelineMilestoneData {
  id?: string;
  year: number;
  title: string;
  impactDescription: string;
}

export interface GovernanceMemberData {
  id?: string;
  name: string;
  role: string;
  type: 'board' | 'executive' | 'advisory';
  bio: string;
  imageUrl: string;
}

export interface DonationSectionData {
  badge: string;
  title: string;
  subtitle: string;
  pixKey: string;
  bankName: string;
  benefits: string[];
  videoUrl?: string;
}

export interface SeoSettingsData {
  siteTitle: string;
  siteDescription: string;
  ogImage: string;
  googleAnalyticsId: string;
  keywords: string;
}

// ── Dados Iniciais (seed) ─────────────────────────────────────────────────

const SEED_PAGE: InstitutionalPageData = {
  title: 'Instituto Ser Melhor',
  introduction: 'Somos uma organização não governamental brasileira dedicada a impulsionar transformações educacionais, sociais e ambientais. Nossa trajetória é movida pela busca contínua por redefinir as fronteiras do impacto sistêmico.',
  missionStatement: 'Promover a emancipação humana e o desenvolvimento sustentável, atuando como catalisador de transformações sociais, ambientais, educacionais e culturais, com base em direitos, evidências e impacto mensurável.',
  visionStatement: 'Ser uma organização de referência na construção de um mundo equitativo, próspero e regenerativo, onde o fortalecimento de capacidades e a garantia de direitos reduzam estruturalmente as situações de vulnerabilidade social.',
  governanceIntro: 'A Governança do Instituto Ser Melhor é uma arquitetura de controle, deliberação e prestação de contas, estruturada para garantir a perpetuidade da missão institucional, a transparência, a integridade, a conformidade e a máxima eficiência na gestão e na alocação dos recursos.',
  transparencyIntro: 'Garantimos acesso público e auditado às nossas demonstrações financeiras e relatórios de impacto. Operamos com padrões de transparência institucional compatíveis com as exigências legais e as melhores práticas internacionais de prestação de contas.',
  logoImage: '/logo-ism.png',
  heroImage: 'https://picsum.photos/1920/1080?grayscale',
  logoExplanation: 'O emblema circular com três figuras humanas estilizadas representa o nosso compromisso com o Desenvolvimento Sustentável Integral. O arco exterior amarelo simboliza o ciclo da prosperidade e a natureza regenerativa de nosso trabalho.',
  motto: 'Sapere Aude',
  mottoExplanation: "Sapere Aude — Ouse Saber. Reflete nosso compromisso com a educação transformadora e a autonomia intelectual, posicionando o Instituto como promotor do pensamento crítico e da formação cidadã.",
  networkIntro: 'O Instituto Ser Melhor reconhece que o impacto sustentável se constrói em parceria. Nosso Ecossistema Colaborativo Estratégico reúne organizações nacionais e internacionais comprometidas com o desenvolvimento sustentável e a inovação social.',
  transparencyDocuments: [
    { id: 1, documentName: 'Demonstrações Financeiras 2024 (Auditado - Big 4)', documentType: 'Financeiro', documentFile: '#', publicationDate: '2024-03-30', fileSize: '4.2 MB' },
    { id: 2, documentName: 'Relatório Anual de Impacto e Atividades', documentType: 'Impacto', documentFile: '#', publicationDate: '2024-03-15', fileSize: '15.4 MB' },
    { id: 3, documentName: 'Código de Conduta Ética', documentType: 'Código de Conduta', documentFile: '#', publicationDate: '2023-01-10', fileSize: '1.5 MB' },
  ],
};

const SEED_VALUES: Omit<ValueBlockData, 'id'>[] = [
  { name: 'Excelência com Integridade', iconIdentifier: 'star', description: 'Buscamos a melhoria contínua com rigor técnico, responsabilidade institucional e compromisso permanente com a qualidade de nossas ações e a dignidade das pessoas que atendemos.', order: 1 },
  { name: 'Transparência e Prestação de Contas', iconIdentifier: 'shield', description: 'Operamos com abertura e clareza em todos os processos, tornando públicas nossas decisões, contas e resultados de forma acessível, compreensível e auditável.', order: 2 },
  { name: 'Protagonismo Comunitário', iconIdentifier: 'zap', description: 'Reconhecemos as comunidades como protagonistas de seu próprio desenvolvimento, apoiando processos de fortalecimento de capacidades, autonomia e participação ativa na construção de soluções.', order: 3 },
  { name: 'Compromisso de Longo Prazo', iconIdentifier: 'infinity', description: 'Nossa atuação é orientada para impactos duradouros e estruturais, construindo legados que fortalecem gerações presentes e futuras com base em desenvolvimento sustentável e justiça social.', order: 4 },
];

const SEED_GOVERNANCE: Omit<GovernanceInstanceData, 'id'>[] = [
  { title: 'Assembleia Geral de Associados', order: 1, summary: 'Órgão máximo de deliberação institucional, responsável pelas decisões estratégicas e pela eleição dos demais órgãos de governança, nos termos do Estatuto Social e do Código Civil Brasileiro.', keyAttributes: [{ attributeText: 'Aprova as demonstrações financeiras anuais auditadas por auditoria independente.' }, { attributeText: 'Elege e destitui membros dos Conselhos Deliberativo e Fiscal.' }, { attributeText: 'Delibera alterações estatutárias por quórum qualificado (2/3 dos associados).' }] },
  { title: 'Conselho Deliberativo', order: 2, summary: 'Órgão de supervisão e controle estratégico, responsável pela fiscalização da gestão executiva e pela aprovação de políticas institucionais de risco, compliance e integridade.', keyAttributes: [{ attributeText: 'Independência funcional: membros sem vínculos com a gestão executiva.' }, { attributeText: 'Aprova políticas de gestão de riscos e compliance.' }, { attributeText: 'Avalia anualmente o desempenho da Diretoria Executiva com base em indicadores de impacto.' }] },
  { title: 'Conselho Fiscal', order: 3, summary: 'Órgão independente de fiscalização econômico-financeira, responsável pela emissão de pareceres sobre as demonstrações contábeis e pelo reporte direto à Assembleia Geral.', keyAttributes: [{ attributeText: 'Emite parecer sobre as Demonstrações Financeiras auditadas.' }, { attributeText: 'Reporta diretamente à Assembleia Geral, assegurando independência.' }, { attributeText: 'Fiscaliza a aderência aos padrões contábeis e às normas legais aplicáveis.' }] },
  { title: 'Diretoria Executiva', order: 4, summary: 'Responsável pela gestão estratégica e operacional da instituição, pela execução orçamentária, pela prestação de contas e pela entrega dos resultados institucionais.', keyAttributes: [{ attributeText: 'Executa o planejamento estratégico aprovado pelo Conselho Deliberativo.' }, { attributeText: 'Administra o patrimônio institucional com responsabilidade e transparência.' }, { attributeText: 'Presta contas periodicamente aos órgãos de governança e aos financiadores.' }] },
  { title: 'Conselho Consultivo', order: 5, summary: 'Órgão de caráter consultivo formado por especialistas nacionais e internacionais que contribuem com orientação técnica e estratégica para o fortalecimento da missão institucional.', keyAttributes: [{ attributeText: 'Fornece orientação técnica especializada em áreas estratégicas de atuação.' }, { attributeText: 'Natureza estritamente consultiva, sem poder deliberativo.' }, { attributeText: 'Contribui para o alinhamento da atuação do Instituto com padrões internacionais.' }] },
];

const SEED_TIMELINE: Omit<TimelineMilestoneData, 'id'>[] = [
  { year: 2007, title: 'Fundação Conceitual', impactDescription: 'Surge a Associação de Bairro Vila Margarida, com o objetivo de representar a comunidade junto ao poder público e buscar melhorias essenciais para o bairro, como pavimentação das vias, iluminação pública e infraestrutura urbana.' },
  { year: 2012, title: 'A Associação a Serviço da Sociedade', impactDescription: 'A Associação de Bairro Vila Margarida amplia sua atuação e passa a desenvolver ações sociais voltadas às famílias em situação de vulnerabilidade, promovendo a distribuição de cestas básicas, leite e oferecendo transporte comunitário para facilitar o acesso da população aos serviços essenciais.' },
  { year: 2015, title: 'Vila Margarida e a Educação', impactDescription: 'É firmada parceria com a Associação de Professores da Educação Infantil, ampliando a atuação institucional para o atendimento de crianças da educação básica por meio de projetos educacionais.' },
  { year: 2017, title: 'A Educação como Foco', impactDescription: 'Uma nova parceria é estabelecida com a Associação Cultural Tiradentes, marcando o início do desenvolvimento de projetos de grande impacto social, educacional e cultural, fortalecendo o compromisso com a transformação das comunidades atendidas.' },
  { year: 2022, title: 'O Surgimento do Instituto Ser Melhor', impactDescription: 'A fusão das três entidades parceiras resulta na criação do Instituto Ser Melhor, consolidando uma nova estrutura institucional voltada ao desenvolvimento humano, à inovação social e à ampliação do impacto das ações realizadas.' },
  { year: 2023, title: 'Consolidação dos Valores Institucionais', impactDescription: 'Os princípios, valores e diretrizes institucionais são revisados e fortalecidos com a participação de profissionais de diversas áreas. Neste mesmo período, o Instituto Ser Melhor torna-se participante do Pacto Global das Nações Unidas, alinhando suas ações aos 17 Objetivos de Desenvolvimento Sustentável (ODS).' },
  { year: 2024, title: 'Reconhecimento Internacional', impactDescription: 'O Instituto Ser Melhor recebe o Global Excellence Award (GEA) em reconhecimento às suas boas práticas institucionais. A Metodologia M-IS passa a ser reconhecida como referência internacional em inovação social. Também é implantada a metodologia SROI (Social Return on Investment), alcançando o índice de 1:4,83, demonstrando elevado retorno social sobre os investimentos realizados.' },
  { year: 2025, title: 'Criação do Fundo Perpétuo', impactDescription: 'É criado o Fundo Perpétuo (F-P), assegurando a sustentabilidade financeira da instituição e sua independência operacional. Com essa estrutura, 100% das doações recebidas passam a ser destinadas aos programas finalísticos, fortalecendo o compromisso com a transparência, a eficiência e o impacto social.' },
];

const SEED_MEMBERS: Omit<GovernanceMemberData, 'id'>[] = [
  { name: 'Rikardo Ribeiro', role: 'Presidente do CD', type: 'board', bio: 'Especialista em Governança Corporativa, ESG e Compliance. Atua na liderança do Conselho Deliberativo, orientando a supervisão estratégica, a gestão de riscos e a garantia da integridade ética da Entidade.', imageUrl: 'https://picsum.photos/200/200?random=1' },
  { name: 'Rikardo Ribeiro', role: 'CEO', type: 'executive', bio: 'Idealizador do Instituto Ser Melhor. Conduz a visão estratégica e a expansão global da organização, integrando inovação educacional, justiça socioambiental e soluções sistêmicas de alto impacto', imageUrl: 'https://picsum.photos/200/200?random=3' },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Serviço Principal ─────────────────────────────────────────────────────

export const InstitutionalFirestoreService = {

  // ── Página institucional (documento único "main") ──────────────────────

  async getPage(): Promise<InstitutionalPageData | null> {
    const snap = await getDoc(doc(db, 'institutional_page', 'main'));
    return snap.exists() ? (snap.data() as InstitutionalPageData) : null;
  },

  async savePage(data: Partial<InstitutionalPageData>): Promise<void> {
    await setDoc(
      doc(db, 'institutional_page', 'main'),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    );
  },

  async updatePageField(field: keyof InstitutionalPageData, value: unknown): Promise<void> {
    await updateDoc(doc(db, 'institutional_page', 'main'), {
      [field]: value,
      updatedAt: serverTimestamp(),
    });
  },

  // ── Value Blocks ───────────────────────────────────────────────────────

  async getValueBlocks(): Promise<ValueBlockData[]> {
    const q = query(collection(db, 'value_blocks'), orderBy('order'));
    const snap = await getDocs(q);
    return mapDocs<ValueBlockData>(snap);
  },

  async saveValueBlock(data: ValueBlockData): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'value_blocks', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'value_blocks'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteValueBlock(id: string): Promise<void> {
    await deleteDoc(doc(db, 'value_blocks', id));
  },

  // ── Governance Instances ───────────────────────────────────────────────

  async getGovernanceInstances(): Promise<GovernanceInstanceData[]> {
    const q = query(collection(db, 'governance_instances'), orderBy('order'));
    const snap = await getDocs(q);
    return mapDocs<GovernanceInstanceData>(snap);
  },

  async saveGovernanceInstance(data: GovernanceInstanceData): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'governance_instances', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'governance_instances'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteGovernanceInstance(id: string): Promise<void> {
    await deleteDoc(doc(db, 'governance_instances', id));
  },

  // ── Timeline Milestones ────────────────────────────────────────────────

  async getTimelineMilestones(): Promise<TimelineMilestoneData[]> {
    const q = query(collection(db, 'timeline_milestones'), orderBy('year'));
    const snap = await getDocs(q);
    return mapDocs<TimelineMilestoneData>(snap);
  },

  async saveTimelineMilestone(data: TimelineMilestoneData): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'timeline_milestones', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'timeline_milestones'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteTimelineMilestone(id: string): Promise<void> {
    await deleteDoc(doc(db, 'timeline_milestones', id));
  },

  // ── Governance Members ─────────────────────────────────────────────────

  async getGovernanceMembers(): Promise<GovernanceMemberData[]> {
    const snap = await getDocs(collection(db, 'governance_members'));
    return mapDocs<GovernanceMemberData>(snap);
  },

  async saveGovernanceMember(data: GovernanceMemberData): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'governance_members', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'governance_members'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteGovernanceMember(id: string): Promise<void> {
    await deleteDoc(doc(db, 'governance_members', id));
  },

  // ── Services / Programs ────────────────────────────────────────────────
  /**
   * Salva a coleção de programas e serviços (lida pelo site principal).
   * Coleção: services_page (doc "main" com metadados) + programs (subcoleção).
   */
  async saveServicesPage(data: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    transparencyIntro?: string;
    transparencyDocuments?: any[];
    financialSlices?: any[];
    efficiencyPct?: number;
    integrityPillars?: any[];
    partnerBadge?: string;
    partnerTitle?: string;
    partnerSubtitle?: string;
    partnerBenefits?: any[];
    trustBadges?: string[];
    programs: Array<{
      id: string; order: number; title: string; slug: string;
      description: string; longDescription: string; iconEmoji: string;
      imageUrl: string; isPublished: boolean; targetAudience: string;
      tags: string[]; ctaLabel: string; ctaUrl: string;
      impactMetric: string; impactValue: string;
      linkUrl?: string; linkLabel?: string;
    }>;
  }): Promise<void> {
    // Salva metadados da seção no documento principal
    await setDoc(
      doc(db, 'services_page', 'main'),
      {
        sectionBadge: data.sectionBadge,
        sectionTitle: data.sectionTitle,
        sectionSubtitle: data.sectionSubtitle,
        transparencyIntro: data.transparencyIntro || '',
        transparencyDocuments: data.transparencyDocuments || [],
        financialSlices: data.financialSlices || [],
        efficiencyPct: data.efficiencyPct !== undefined ? data.efficiencyPct : 90,
        integrityPillars: data.integrityPillars || [],
        partnerBadge: data.partnerBadge || '',
        partnerTitle: data.partnerTitle || '',
        partnerSubtitle: data.partnerSubtitle || '',
        partnerBenefits: data.partnerBenefits || [],
        trustBadges: data.trustBadges || [],
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    // Upsert de cada programa individualmente (preserva os que não foram alterados)
    for (const p of data.programs) {
      const { id, ...rest } = p;
      await setDoc(doc(db, 'programs', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
    }
  },

  async getServicesPage(): Promise<Record<string, any> | null> {
    const snap = await getDoc(doc(db, 'services_page', 'main'));
    return snap.exists() ? snap.data() : null;
  },


  async getPrograms(): Promise<Array<Record<string, unknown> & { id: string }>> {
    const q = query(collection(db, 'programs'), orderBy('order'));
    const snap = await getDocs(q);
    return mapDocs<Record<string, unknown>>(snap);
  },

  async deleteProgram(id: string): Promise<void> {
    await deleteDoc(doc(db, 'programs', id));
  },

  // ── Donation Section ──────────────────────────────────────────────────
  async getDonationSection(): Promise<DonationSectionData | null> {
    const snap = await getDoc(doc(db, 'donation_section', 'main'));
    return snap.exists() ? (snap.data() as DonationSectionData) : null;
  },

  async saveDonationSection(data: Partial<DonationSectionData>): Promise<void> {
    await setDoc(
      doc(db, 'donation_section', 'main'),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    );
  },

  // ── SEO & Settings ────────────────────────────────────────────────────
  async getSeoSettings(): Promise<SeoSettingsData | null> {
    const snap = await getDoc(doc(db, 'seo_settings', 'main'));
    return snap.exists() ? (snap.data() as SeoSettingsData) : null;
  },

  async saveSeoSettings(data: Partial<SeoSettingsData>): Promise<void> {
    await setDoc(
      doc(db, 'seo_settings', 'main'),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    );
  },

  // ── Seed / Bootstrap ───────────────────────────────────────────────────
  /**
   * Inicializa as coleções institucionais com dados padrão.
   * Usa writeBatch para atomicidade nas coleções menores.
   * Seguro para re-executar: só sobrescreve se forceOverwrite=true.
   */
  async seedInstitutionalData(forceOverwrite = false): Promise<{ seeded: string[]; skipped: string[] }> {
    const seeded: string[] = [];
    const skipped: string[] = [];

    // 1. institutional_page (documento único)
    const pageRef = doc(db, 'institutional_page', 'main');
    const pageSnap = await getDoc(pageRef);
    if (!pageSnap.exists() || forceOverwrite) {
      await setDoc(pageRef, { ...SEED_PAGE, updatedAt: serverTimestamp() });
      seeded.push('institutional_page');
    } else {
      skipped.push('institutional_page');
    }

    // 2. value_blocks
    const valSnap = await getDocs(collection(db, 'value_blocks'));
    if (valSnap.empty || forceOverwrite) {
      if (forceOverwrite && !valSnap.empty) {
        const batch = writeBatch(db);
        valSnap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      const batch = writeBatch(db);
      SEED_VALUES.forEach(v => batch.set(doc(collection(db, 'value_blocks')), { ...v, updatedAt: serverTimestamp() }));
      await batch.commit();
      seeded.push('value_blocks');
    } else {
      skipped.push('value_blocks');
    }

    // 3. governance_instances
    const govSnap = await getDocs(collection(db, 'governance_instances'));
    if (govSnap.empty || forceOverwrite) {
      if (forceOverwrite && !govSnap.empty) {
        const batch = writeBatch(db);
        govSnap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      const batch = writeBatch(db);
      SEED_GOVERNANCE.forEach(g => batch.set(doc(collection(db, 'governance_instances')), { ...g, updatedAt: serverTimestamp() }));
      await batch.commit();
      seeded.push('governance_instances');
    } else {
      skipped.push('governance_instances');
    }

    // 4. timeline_milestones
    const tlSnap = await getDocs(collection(db, 'timeline_milestones'));
    if (tlSnap.empty || forceOverwrite) {
      if (forceOverwrite && !tlSnap.empty) {
        const batch = writeBatch(db);
        tlSnap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      const batch = writeBatch(db);
      SEED_TIMELINE.forEach(t => batch.set(doc(collection(db, 'timeline_milestones')), { ...t, updatedAt: serverTimestamp() }));
      await batch.commit();
      seeded.push('timeline_milestones');
    } else {
      skipped.push('timeline_milestones');
    }

    // 5. governance_members
    const memSnap = await getDocs(collection(db, 'governance_members'));
    if (memSnap.empty || forceOverwrite) {
      if (forceOverwrite && !memSnap.empty) {
        const batch = writeBatch(db);
        memSnap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      const batch = writeBatch(db);
      SEED_MEMBERS.forEach(m => batch.set(doc(collection(db, 'governance_members')), { ...m, updatedAt: serverTimestamp() }));
      await batch.commit();
      seeded.push('governance_members');
    } else {
      skipped.push('governance_members');
    }

    return { seeded, skipped };
  },
};
