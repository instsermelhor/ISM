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

// ── Dados Iniciais (seed) ─────────────────────────────────────────────────

const SEED_PAGE: InstitutionalPageData = {
  title: 'Instituto Ser Melhor',
  introduction: 'Somos uma organização não-governamental brasileira que atua como catalisadora de transformações sociais e ambientais. Nossa história é marcada pela busca incessante de redefinir o conceito de impacto sistêmico.',
  missionStatement: 'Promover a completa emancipação humana e o desenvolvimento sustentável integral, atuando como catalisador inigualável de transformações sociais, ambientais, educacionais e culturais.',
  visionStatement: 'Ser o fator decisivo na construção de um mundo equitativo, próspero e regenerativo, onde a necessidade da assistência social como a conhecemos tenha sido mitigada pela eficácia de nossas soluções.',
  governanceIntro: 'A Governança do Instituto Ser Melhor é uma arquitetura de controle e deliberação desenhada para garantir a perpetuidade da Missão, a transparência quântica e a máxima eficiência na alocação de recursos.',
  transparencyIntro: 'O Princípio da Transparência Quântica garante acesso irrestrito e auditado à nossa saúde financeira. Operamos com padrões que excedem as exigências legais.',
  logoImage: '/logo-ism.png',
  heroImage: 'https://picsum.photos/1920/1080?grayscale',
  logoExplanation: 'O emblema circular com três figuras humanas estilizadas representa o nosso foco no Desenvolvimento Sustentável Integral. O arco exterior amarelo simboliza o Ciclo da Prosperidade e a natureza regenerativa de nosso trabalho.',
  motto: 'Sapere Aude',
  mottoExplanation: "Significa 'Ouse Saber'. Reflete nosso Valor de Excelência Inflexível e a importância da Educação Transformadora, posicionando o Instituto como promotor da autossuficiência intelectual.",
  networkIntro: 'O Instituto Ser Melhor reconhece que a excelência não é alcançada no isolamento. Nossa Rede de Colaboração de Elite (R-CE) é um ecossistema seletivo de stakeholders globais.',
  transparencyDocuments: [
    { id: 1, documentName: 'Demonstrações Financeiras 2024 (Auditado - Big 4)', documentType: 'Financeiro', documentFile: '#', publicationDate: '2024-03-30', fileSize: '4.2 MB' },
    { id: 2, documentName: 'Relatório Anual de Impacto e Atividades', documentType: 'Impacto', documentFile: '#', publicationDate: '2024-03-15', fileSize: '15.4 MB' },
    { id: 3, documentName: 'Código de Conduta Ética', documentType: 'Código de Conduta', documentFile: '#', publicationDate: '2023-01-10', fileSize: '1.5 MB' },
  ],
};

const SEED_VALUES: Omit<ValueBlockData, 'id'>[] = [
  { name: 'Excelência Inflexível', iconIdentifier: 'star', description: 'Não buscamos apenas a melhoria; exigimos a perfeição. Nosso padrão de qualidade é o mais alto do mundo, sem margem para mediocridade.', order: 1 },
  { name: 'Transparência Quântica', iconIdentifier: 'shield', description: 'Operamos com um nível de clareza que excede normas globais. Nossa integridade é a essência visível de todas as decisões.', order: 2 },
  { name: 'Protagonismo Regenerativo', iconIdentifier: 'zap', description: 'Buscamos um impacto que não apenas restaure, mas aprimore e gere vitalidade nos sistemas sociais e ambientais.', order: 3 },
  { name: 'Compromisso Perpétuo', iconIdentifier: 'infinity', description: 'Nossa dedicação é incondicional e atemporal. Nosso trabalho é um legado que transcende gerações.', order: 4 },
];

const SEED_GOVERNANCE: Omit<GovernanceInstanceData, 'id'>[] = [
  { title: 'Assembleia Geral de Associados Estratégicos', order: 1, summary: 'Órgão Máximo e Soberano composto exclusivamente por membros com histórico comprovado de liderança.', keyAttributes: [{ attributeText: 'Aprovar ou rejeita demonstrações financeiras anuais auditadas.' }, { attributeText: 'Elege e destitui membros dos Conselhos.' }, { attributeText: 'Exige Quórum Qualificado (2/3) para deliberações patrimoniais.' }] },
  { title: 'Conselho Deliberativo de Excelência (CDE)', order: 2, summary: 'Guardião da Integridade e Estratégia, responsável por supervisionar a Diretoria-Executiva.', keyAttributes: [{ attributeText: 'Independência Radical: Sem vínculos com a gestão executiva.' }, { attributeText: 'Aprova Políticas de Risco e Compliance.' }, { attributeText: 'Avaliação anual de performance do CEO baseada em KPIs.' }] },
  { title: 'Conselho Fiscal e de Auditoria Quântica (CFA)', order: 3, summary: 'Assegura a Transparência Quântica e a aderência aos padrões IFRS.', keyAttributes: [{ attributeText: 'Emite Parecer Sem Ressalvas sobre Demonstrações Financeiras.' }, { attributeText: 'Reporte direto à Assembleia Geral.' }] },
  { title: 'Diretoria-Executiva de Gestão (D-E)', order: 4, summary: 'Responsável pela gestão estratégica e operacional do dia a dia e entrega de resultados.', keyAttributes: [{ attributeText: 'Liderada por CEO de visão global.' }, { attributeText: 'Administração do patrimônio e execução orçamentária.' }] },
  { title: 'Conselho Consultivo de Liderança Global (CCLG)', order: 5, summary: 'Líderes mundiais e ex-chefes de estado que fornecem orientação estratégica.', keyAttributes: [{ attributeText: 'Garante a Vantagem de Conhecimento (Knowledge Edge).' }, { attributeText: 'Natureza estritamente consultiva.' }] },
];

const SEED_TIMELINE: Omit<TimelineMilestoneData, 'id'>[] = [
  { year: 2007, title: 'Fundação Conceitual', impactDescription: 'Estabelecimento do Instituto a partir da fusão de três fundações líderes e criação da Metodologia M-IS.' },
  { year: 2012, title: 'Fundo Perpétuo', impactDescription: 'Alcance da independência operacional com o Fundo F-P, assegurando 100% das doações para programas finalísticos.' },
  { year: 2015, title: 'Prêmio Global GEA', impactDescription: 'Recebimento do Global Excellence Award da ONU. A Metodologia M-IS torna-se benchmark global.' },
  { year: 2025, title: 'Marco do Milhão', impactDescription: 'Aproximação da meta de impactar um milhão de vidas e lançamento da Agenda 2035.' },
];

const SEED_MEMBERS: Omit<GovernanceMemberData, 'id'>[] = [
  { name: 'Rikardo Ribeiro', role: 'Presidente do CDE', type: 'board', bio: 'Referência global em conservação.', imageUrl: 'https://picsum.photos/200/200?random=1' },
  { name: 'Rikardo Ribeiro', role: 'CEO', type: 'executive', bio: 'Executivo premiado por inovação.', imageUrl: 'https://picsum.photos/200/200?random=3' },
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
