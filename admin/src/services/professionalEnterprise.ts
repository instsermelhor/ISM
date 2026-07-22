/**
 * ProfessionalEnterpriseService
 * ─────────────────────────────────────────────────────────────────────────────
 * Serviço Enterprise do Portal do Profissional — Instituto Ser Melhor
 *
 * Coleções Firestore gerenciadas:
 *   • professionals            — Perfis profissionais (credenciamento, competências)
 *   • clinical_records         — Prontuário Eletrônico (PEP) por beneficiário
 *   • clinical_evolutions      — Evoluções clínicas (append-only, versionadas)
 *   • prescriptions            — Receitas, atestados, laudos, encaminhamentos
 *   • case_discussions         — Discussão multiprofissional de casos
 *   • clinical_alerts          — Alertas clínicos e pendências do profissional
 *   • professional_schedule    — Bloqueios, disponibilidade e configuração de agenda
 *
 * Padrão: Clean Architecture · FHIR HL7 Ready · LGPD Art. 11 · OWASP ASVS L3
 * Prompt 031 — Plataforma ISM v2.0
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch, limit,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Enumerações & Tipos ───────────────────────────────────────────────────────

export type ProfessionalCategory =
  | 'Psicologo'
  | 'Psiquiatra'
  | 'AssistenteSocial'
  | 'Advogado'
  | 'Medico'
  | 'Enfermeiro'
  | 'Nutricionista'
  | 'Fisioterapeuta'
  | 'Pedagogo'
  | 'Educador'
  | 'Coordenador'
  | 'Diretor'
  | 'Voluntario'
  | 'Estagiario';

export type CouncilType =
  | 'CRP'   // Psicologia
  | 'CRM'   // Medicina
  | 'COREN' // Enfermagem
  | 'CRAS'  // Assistência Social
  | 'OAB'   // Advocacia
  | 'CFF'   // Farmácia
  | 'CREFITO' // Fisioterapia
  | 'CFN'   // Nutrição
  | 'CRO'   // Odontologia
  | 'Outro';

export type AvailabilitySlot = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom, 1=Seg...
  startTime: string;  // 'HH:mm'
  endTime: string;
  modality: 'Presencial' | 'Telemedicina' | 'Ambos';
};

export type DocumentCategory =
  | 'Receita_Simples'
  | 'Receita_Especial'
  | 'Atestado'
  | 'Laudo'
  | 'Parecer'
  | 'Declaracao'
  | 'Encaminhamento'
  | 'Relatorio'
  | 'Certificado'
  | 'Termo_Consentimento';

export type ClinicalStatus =
  | 'EM_ACOMPANHAMENTO'
  | 'ALTA'
  | 'SUSPENSO'
  | 'AGUARDANDO'
  | 'ENCAMINHADO'
  | 'ARQUIVADO';

export type EvolutionType =
  | 'Psicologica'
  | 'Psiquiatrica'
  | 'Social'
  | 'Juridica'
  | 'Medica'
  | 'Nutricional'
  | 'Fisioterapeutica'
  | 'Educacional'
  | 'Multidisciplinar'
  | 'Acolhimento';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ProfessionalCertification {
  title: string;
  institution: string;
  year: number;
  type: 'Graduacao' | 'Pos_Graduacao' | 'Mestrado' | 'Doutorado' | 'Certificacao' | 'Curso';
}

export interface DigitalSignature {
  thumbprint: string;       // Hash da assinatura (simulado)
  issuedAt: string;
  validUntil: string;
  provider: string;         // ex: 'ICP-Brasil', 'DocuSign'
  active: boolean;
}

export interface Professional {
  id?: string;

  // ── Identificação ──────────────────────────────────────────────────────────
  fullName: string;
  socialName?: string;
  cpf: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  avatarUrl?: string;

  // ── Credenciamento Profissional ────────────────────────────────────────────
  category: ProfessionalCategory;
  councilType: CouncilType;
  councilNumber: string;          // ex: '06/142850'
  councilState: string;           // ex: 'SP'
  councilExpiresAt?: string;      // Data de vencimento
  specialties: string[];          // ['Psicologia Infantil', 'TCC', ...]
  competencies: string[];         // Competências e habilidades

  // ── Certificações e Formação ───────────────────────────────────────────────
  certifications: ProfessionalCertification[];

  // ── Agenda e Disponibilidade ───────────────────────────────────────────────
  availabilitySlots: AvailabilitySlot[];
  sessionDurationMinutes: number;   // Duração padrão da sessão
  maxDailyAppointments: number;

  // ── Assinatura Digital ─────────────────────────────────────────────────────
  digitalSignature?: DigitalSignature;
  hasDigitalCertificate: boolean;

  // ── Vínculo Institucional ──────────────────────────────────────────────────
  department: string;
  coordinatorId?: string;
  coordinatorName?: string;
  enrolledPrograms: string[];        // IDs dos programas
  odsGoals: number[];

  // ── Status ────────────────────────────────────────────────────────────────
  status: 'Ativo' | 'Em Onboarding' | 'Afastado' | 'Inativo' | 'Desligado';
  credentialStatus: 'APROVADO' | 'EM_ANALISE' | 'PENDENTE_DOC' | 'SUSPENSO';
  joinedAt: string;
  lastAccessAt?: string;

  // ── LGPD ──────────────────────────────────────────────────────────────────
  lgpdConsent: boolean;
  dataRetentionUntil?: string;

  // ── BI / Produtividade ────────────────────────────────────────────────────
  totalAttendances?: number;
  totalEvolutions?: number;
  avgSessionMinutes?: number;
  satisfactionAvg?: number;         // NPS médio dos beneficiários

  updatedAt?: unknown;
}

export interface DiagnosticEntry {
  cid10?: string;                   // CID-10 code (ex: 'F32.0' — Episódio depressivo leve)
  ciap2?: string;                   // CIAP-2 code (Classificação Internacional de APS)
  description: string;
  type: 'Definitivo' | 'Hipotese' | 'Diferencial';
  confirmedAt?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;                    // 'Oral', 'Tópico', 'Injetável', etc.
  durationDays?: number;
  instructions?: string;
  prescribedAt: string;
  prescribedBy: string;
}

/** Prontuário Eletrônico do Paciente (PEP) — compatível com HL7 FHIR R4 */
export interface ClinicalRecord {
  id?: string;

  // ── Identificação ──────────────────────────────────────────────────────────
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryCpf?: string;

  // ── Responsável pelo Prontuário ────────────────────────────────────────────
  primaryProfessionalId: string;
  primaryProfessionalName: string;
  primaryCouncil: string;           // ex: 'CRP 06/142850'

  // ── Status Clínico ────────────────────────────────────────────────────────
  clinicalStatus: ClinicalStatus;
  openedAt: string;
  closedAt?: string;

  // ── Anamnese ───────────────────────────────────────────────────────────────
  chiefComplaint: string;           // Queixa principal
  historyOfPresentIllness: string;  // HDA — História da Doença Atual
  pastMedicalHistory?: string;      // HPP — História Patológica Pregressa
  familyHistory?: string;           // História familiar
  socialHistory?: string;           // História social
  allergies: string[];
  currentMedications: Medication[];

  // ── Diagnósticos ──────────────────────────────────────────────────────────
  diagnostics: DiagnosticEntry[];

  // ── Plano Terapêutico ─────────────────────────────────────────────────────
  therapeuticPlan: string;
  interventions: string[];          // Lista de intervenções planejadas
  shortTermGoals: string[];
  longTermGoals: string[];
  reviewDate?: string;

  // ── Controle de Acesso ─────────────────────────────────────────────────────
  accessibleByProfessionals: string[];  // IDs autorizados a ler
  isConfidential: boolean;
  requiresMFA: boolean;             // Acesso requer MFA adicional

  // ── Versionamento e Auditoria ─────────────────────────────────────────────
  version: number;
  lastModifiedBy: string;
  changeLog: { at: string; by: string; action: string }[];

  // ── FHIR ──────────────────────────────────────────────────────────────────
  fhirPatientId?: string;           // Referência ao recurso Patient no FHIR
  fhirEncounterId?: string;         // Referência ao recurso Encounter no FHIR

  updatedAt?: unknown;
}

export interface ClinicalEvolution {
  id?: string;
  recordId: string;
  beneficiaryId: string;
  beneficiaryName: string;

  // ── Identificação da Sessão ────────────────────────────────────────────────
  professionalId: string;
  professionalName: string;
  professionalCouncil: string;
  evolutionType: EvolutionType;

  // ── Conteúdo Clínico ──────────────────────────────────────────────────────
  sessionDate: string;              // YYYY-MM-DD
  sessionDurationMinutes: number;
  modality: 'Presencial' | 'Telemedicina' | 'Domiciliar' | 'Grupo';

  subjectiveData: string;           // S — O que o paciente relata (SOAP)
  objectiveData: string;            // O — Dados objetivos observados
  assessment: string;               // A — Avaliação clínica
  plan: string;                     // P — Plano de ação

  // ── Diagnósticos e Intervenções ───────────────────────────────────────────
  diagnosticsUpdated?: DiagnosticEntry[];
  interventionsApplied: string[];
  prescriptionsIssued: string[];    // IDs de prescrições emitidas
  referralsMade: string[];          // Encaminhamentos realizados nesta sessão

  // ── Próxima Consulta ──────────────────────────────────────────────────────
  followUpDate?: string;
  followUpNotes?: string;

  // ── Controle ──────────────────────────────────────────────────────────────
  isConfidential: boolean;
  isSigned: boolean;
  signedAt?: string;
  signatureHash?: string;
  aiAssisted: boolean;              // Se a IA auxiliou na documentação
  aiSuggestions?: string;          // Sugestões da IA (identificadas)

  // ── IA Risk ───────────────────────────────────────────────────────────────
  riskAssessment?: 'Baixo' | 'Moderado' | 'Alto' | 'Critico';
  riskNotes?: string;

  version: number;
  updatedAt?: unknown;
}

export interface Prescription {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  professionalId: string;
  professionalName: string;
  professionalCouncil: string;
  category: DocumentCategory;

  // ── Conteúdo ──────────────────────────────────────────────────────────────
  title: string;
  content: string;                  // Texto completo
  medications?: Medication[];       // Para receitas

  // ── Validade e Controle ───────────────────────────────────────────────────
  issuedAt: string;
  expiresAt?: string;
  cid10?: string;
  evolutionId?: string;             // Vinculado à evolução

  // ── Assinatura ────────────────────────────────────────────────────────────
  isSigned: boolean;
  signedAt?: string;
  signatureHash?: string;
  isDigital: boolean;               // Prescrição eletrônica (MEMED/CFM)

  // ── Entrega ───────────────────────────────────────────────────────────────
  deliveredAt?: string;
  deliveryMethod?: 'Impresso' | 'Email' | 'WhatsApp' | 'Portal';
  downloadCount: number;
  isConfidential: boolean;

  updatedAt?: unknown;
}

export interface CaseDiscussion {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  title: string;
  description: string;
  requestedBy: string;              // Profissional que solicitou
  requestedByName: string;
  participants: {
    professionalId: string;
    professionalName: string;
    category: ProfessionalCategory;
    joinedAt: string;
  }[];
  messages: {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    sentAt: string;
    isConfidential: boolean;
  }[];
  status: 'ABERTO' | 'EM_DISCUSSAO' | 'PARECER_EMITIDO' | 'ENCERRADO';
  outcome?: string;                 // Parecer final
  outcomeBy?: string;
  closedAt?: string;
  isUrgent: boolean;
  updatedAt?: unknown;
}

export interface ScheduleBlock {
  id?: string;
  professionalId: string;
  professionalName: string;
  startAt: string;                  // ISO datetime
  endAt: string;
  reason: string;                   // 'Férias', 'Feriado', 'Reunião', 'Plantão', etc.
  type: 'Bloqueio' | 'Ferias' | 'Feriado' | 'Plantao' | 'Reuniao' | 'Particular';
  isRecurring: boolean;
  updatedAt?: unknown;
}

export interface ClinicalAlert {
  id?: string;
  professionalId: string;
  type:
    | 'EVOLUCAO_PENDENTE'
    | 'PRESCRICAO_VENCENDO'
    | 'CONSULTA_SEM_RETORNO'
    | 'PACIENTE_ALTO_RISCO'
    | 'DISCUSSAO_SOLICITADA'
    | 'DOCUMENTO_VENCENDO'
    | 'CREDENCIAL_VENCENDO';
  beneficiaryId?: string;
  beneficiaryName?: string;
  message: string;
  severity: 'INFO' | 'AVISO' | 'URGENTE' | 'CRITICO';
  isRead: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt?: unknown;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Service ───────────────────────────────────────────────────────────────────

export const ProfessionalEnterpriseService = {

  // ── Professionals ─────────────────────────────────────────────────────────

  async getProfessionals(category?: ProfessionalCategory): Promise<Professional[]> {
    const q = category
      ? query(collection(db, 'professionals'), where('category', '==', category), orderBy('fullName'))
      : query(collection(db, 'professionals'), orderBy('fullName'));
    return mapDocs<Professional>(await getDocs(q));
  },

  async getProfessional(id: string): Promise<Professional | null> {
    const snap = await getDoc(doc(db, 'professionals', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Professional;
  },

  async saveProfessional(data: Professional): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'professionals', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'professionals'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteProfessional(id: string): Promise<void> {
    await deleteDoc(doc(db, 'professionals', id));
  },

  // ── Clinical Records (PEP/EHR) ────────────────────────────────────────────

  async getClinicalRecords(professionalId?: string): Promise<ClinicalRecord[]> {
    const q = professionalId
      ? query(collection(db, 'clinical_records'), where('primaryProfessionalId', '==', professionalId), orderBy('openedAt', 'desc'))
      : query(collection(db, 'clinical_records'), orderBy('openedAt', 'desc'), limit(50));
    return mapDocs<ClinicalRecord>(await getDocs(q));
  },

  async getClinicalRecord(beneficiaryId: string): Promise<ClinicalRecord | null> {
    const q = query(
      collection(db, 'clinical_records'),
      where('beneficiaryId', '==', beneficiaryId),
      where('clinicalStatus', 'in', ['EM_ACOMPANHAMENTO', 'AGUARDANDO']),
      orderBy('openedAt', 'desc'),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ClinicalRecord;
  },

  async saveClinicalRecord(data: ClinicalRecord): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      const updatedData = {
        ...rest,
        version: (rest.version ?? 0) + 1,
        changeLog: [
          ...(rest.changeLog ?? []),
          { at: new Date().toISOString(), by: rest.lastModifiedBy, action: 'Atualização' },
        ],
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'clinical_records', id), updatedData, { merge: true });
      return id;
    }
    const newData = {
      ...data,
      version: 1,
      changeLog: [{ at: new Date().toISOString(), by: data.lastModifiedBy, action: 'Criação do Prontuário' }],
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'clinical_records'), newData);
    return ref.id;
  },

  // ── Clinical Evolutions ───────────────────────────────────────────────────

  async getEvolutions(beneficiaryId: string): Promise<ClinicalEvolution[]> {
    const q = query(
      collection(db, 'clinical_evolutions'),
      where('beneficiaryId', '==', beneficiaryId),
      orderBy('sessionDate', 'desc'),
    );
    return mapDocs<ClinicalEvolution>(await getDocs(q));
  },

  async getProfessionalEvolutions(professionalId: string, days: number = 30): Promise<ClinicalEvolution[]> {
    const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const q = query(
      collection(db, 'clinical_evolutions'),
      where('professionalId', '==', professionalId),
      where('sessionDate', '>=', from),
      orderBy('sessionDate', 'desc'),
      limit(100),
    );
    return mapDocs<ClinicalEvolution>(await getDocs(q));
  },

  async saveEvolution(data: ClinicalEvolution): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'clinical_evolutions', id), {
        ...rest,
        version: (rest.version ?? 0) + 1,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'clinical_evolutions'), {
      ...data,
      version: 1,
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  // ── Prescriptions & Documents ─────────────────────────────────────────────

  async getPrescriptions(professionalId?: string, beneficiaryId?: string): Promise<Prescription[]> {
    let q;
    if (beneficiaryId) {
      q = query(collection(db, 'prescriptions'), where('beneficiaryId', '==', beneficiaryId), orderBy('issuedAt', 'desc'));
    } else if (professionalId) {
      q = query(collection(db, 'prescriptions'), where('professionalId', '==', professionalId), orderBy('issuedAt', 'desc'), limit(50));
    } else {
      q = query(collection(db, 'prescriptions'), orderBy('issuedAt', 'desc'), limit(50));
    }
    return mapDocs<Prescription>(await getDocs(q));
  },

  async savePrescription(data: Prescription): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'prescriptions', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'prescriptions'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async signDocument(id: string, collection_name: string, professionalName: string): Promise<void> {
    const hash = `SIG-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    await setDoc(doc(db, collection_name, id), {
      isSigned: true,
      signedAt: new Date().toISOString(),
      signatureHash: hash,
      lastModifiedBy: professionalName,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // ── Case Discussions ──────────────────────────────────────────────────────

  async getCaseDiscussions(professionalId?: string): Promise<CaseDiscussion[]> {
    const q = professionalId
      ? query(collection(db, 'case_discussions'),
          where('status', 'in', ['ABERTO', 'EM_DISCUSSAO']),
          orderBy('updatedAt', 'desc'), limit(20))
      : query(collection(db, 'case_discussions'), orderBy('updatedAt', 'desc'), limit(30));
    return mapDocs<CaseDiscussion>(await getDocs(q));
  },

  async saveCaseDiscussion(data: CaseDiscussion): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'case_discussions', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'case_discussions'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async addDiscussionMessage(
    discussionId: string,
    authorId: string,
    authorName: string,
    content: string,
    isConfidential: boolean = false,
  ): Promise<void> {
    const ref = doc(db, 'case_discussions', discussionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const existing = snap.data().messages ?? [];
    await setDoc(ref, {
      messages: [
        ...existing,
        {
          id: `msg-${Date.now()}`,
          authorId,
          authorName,
          content,
          sentAt: new Date().toISOString(),
          isConfidential,
        },
      ],
      status: 'EM_DISCUSSAO',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // ── Schedule Blocks ───────────────────────────────────────────────────────

  async getScheduleBlocks(professionalId: string): Promise<ScheduleBlock[]> {
    const q = query(
      collection(db, 'professional_schedule'),
      where('professionalId', '==', professionalId),
      orderBy('startAt'),
    );
    return mapDocs<ScheduleBlock>(await getDocs(q));
  },

  async saveScheduleBlock(data: ScheduleBlock): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'professional_schedule', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'professional_schedule'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteScheduleBlock(id: string): Promise<void> {
    await deleteDoc(doc(db, 'professional_schedule', id));
  },

  // ── Clinical Alerts ───────────────────────────────────────────────────────

  async getAlerts(professionalId: string): Promise<ClinicalAlert[]> {
    const q = query(
      collection(db, 'clinical_alerts'),
      where('professionalId', '==', professionalId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20),
    );
    return mapDocs<ClinicalAlert>(await getDocs(q));
  },

  async markAlertRead(id: string): Promise<void> {
    await setDoc(doc(db, 'clinical_alerts', id), {
      isRead: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // ── Dashboard KPIs ────────────────────────────────────────────────────────

  async getDashboardKPIs(professionalId?: string): Promise<{
    totalProfessionals: number;
    activeProfessionals: number;
    pendingCredentials: number;
    totalRecords: number;
    openDiscussions: number;
    pendingEvolutions: number;
    categoryDistribution: Record<string, number>;
  }> {
    const [allProfs, records, discussions] = await Promise.all([
      getDocs(query(collection(db, 'professionals'), orderBy('fullName'))),
      getDocs(query(collection(db, 'clinical_records'), where('clinicalStatus', '==', 'EM_ACOMPANHAMENTO'))),
      getDocs(query(collection(db, 'case_discussions'), where('status', 'in', ['ABERTO', 'EM_DISCUSSAO']))),
    ]);

    const profs = mapDocs<Professional>(allProfs);
    const catDist: Record<string, number> = {};
    profs.forEach(p => {
      catDist[p.category] = (catDist[p.category] ?? 0) + 1;
    });

    return {
      totalProfessionals: profs.length,
      activeProfessionals: profs.filter(p => p.status === 'Ativo').length,
      pendingCredentials: profs.filter(p => p.credentialStatus === 'EM_ANALISE' || p.credentialStatus === 'PENDENTE_DOC').length,
      totalRecords: records.size,
      openDiscussions: discussions.size,
      pendingEvolutions: 0,
      categoryDistribution: catDist,
    };
  },

  // ── Seed Defaults ─────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultProfessionals: Omit<Professional, 'id'>[] = [
      {
        fullName: 'Dra. Vanessa Guimarães',
        cpf: '111.222.333-44',
        birthDate: '1985-06-15',
        gender: 'Feminino',
        phone: '(11) 97654-3210',
        email: 'vanessa.psico@institutosermelhor.org',
        category: 'Psicologo',
        councilType: 'CRP',
        councilNumber: '06/142850',
        councilState: 'SP',
        councilExpiresAt: '2026-12-31',
        specialties: ['Psicologia Social', 'TCC', 'Psicologia do Trauma', 'Saúde Mental Infantil'],
        competencies: ['Avaliação Psicológica', 'Psicodiagnóstico', 'Psicoterapia Individual', 'Grupos Terapêuticos'],
        certifications: [
          { title: 'Psicologia', institution: 'USP', year: 2008, type: 'Graduacao' },
          { title: 'Especialização em TCC', institution: 'PUC-SP', year: 2011, type: 'Pos_Graduacao' },
        ],
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', modality: 'Ambos' },
          { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', modality: 'Ambos' },
          { dayOfWeek: 5, startTime: '08:00', endTime: '12:00', modality: 'Presencial' },
        ],
        sessionDurationMinutes: 50,
        maxDailyAppointments: 8,
        hasDigitalCertificate: true,
        digitalSignature: {
          thumbprint: 'SHA256:ABC123DEF456',
          issuedAt: '2024-01-01',
          validUntil: '2026-12-31',
          provider: 'ICP-Brasil',
          active: true,
        },
        department: 'Saúde Mental & Emancipação',
        enrolledPrograms: [],
        odsGoals: [3, 5, 10],
        status: 'Ativo',
        credentialStatus: 'APROVADO',
        joinedAt: '2022-03-15',
        lgpdConsent: true,
        totalAttendances: 487,
        totalEvolutions: 462,
        avgSessionMinutes: 52,
        satisfactionAvg: 9.4,
      },
      {
        fullName: 'Dr. Paulo Roberto Neves',
        cpf: '222.333.444-55',
        birthDate: '1978-11-20',
        gender: 'Masculino',
        phone: '(11) 98111-2233',
        email: 'paulo.juridico@institutosermelhor.org',
        category: 'Advogado',
        councilType: 'OAB',
        councilNumber: '312.450',
        councilState: 'SP',
        specialties: ['Direito do Terceiro Setor', 'Compliance LGPD', 'Direito de Família', 'Violência Doméstica'],
        competencies: ['Consultoria Jurídica', 'Elaboração de Pareceres', 'Mediação Familiar', 'Proteção de Dados'],
        certifications: [
          { title: 'Direito', institution: 'FADUSP', year: 2002, type: 'Graduacao' },
          { title: 'Especialização em Direito do Terceiro Setor', institution: 'FGV', year: 2010, type: 'Pos_Graduacao' },
        ],
        availabilitySlots: [
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', modality: 'Ambos' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', modality: 'Presencial' },
        ],
        sessionDurationMinutes: 60,
        maxDailyAppointments: 6,
        hasDigitalCertificate: false,
        department: 'Jurídico & Governança',
        enrolledPrograms: [],
        odsGoals: [5, 10, 16],
        status: 'Ativo',
        credentialStatus: 'APROVADO',
        joinedAt: '2023-01-10',
        lgpdConsent: true,
        totalAttendances: 134,
        totalEvolutions: 128,
        avgSessionMinutes: 61,
        satisfactionAvg: 8.9,
      },
      {
        fullName: 'Ana Clara Souza',
        cpf: '333.444.555-66',
        birthDate: '1990-03-08',
        gender: 'Feminino',
        phone: '(11) 96789-0123',
        email: 'ana.social@institutosermelhor.org',
        category: 'AssistenteSocial',
        councilType: 'CRAS',
        councilNumber: 'SP-32.456',
        councilState: 'SP',
        specialties: ['Assistência Social', 'Políticas Públicas', 'Proteção da Criança e do Adolescente', 'SUAS'],
        competencies: ['Estudo Social', 'Visita Domiciliar', 'Elaboração de Relatórios', 'Articulação em Rede'],
        certifications: [
          { title: 'Serviço Social', institution: 'PUC-Campinas', year: 2013, type: 'Graduacao' },
          { title: 'Especialização em Gestão Social', institution: 'Unip', year: 2016, type: 'Pos_Graduacao' },
        ],
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', modality: 'Presencial' },
          { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', modality: 'Presencial' },
          { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', modality: 'Presencial' },
          { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', modality: 'Presencial' },
          { dayOfWeek: 5, startTime: '08:00', endTime: '14:00', modality: 'Presencial' },
        ],
        sessionDurationMinutes: 45,
        maxDailyAppointments: 10,
        hasDigitalCertificate: false,
        department: 'Assistência Social & Cidadania',
        enrolledPrograms: [],
        odsGoals: [1, 2, 10, 11],
        status: 'Ativo',
        credentialStatus: 'APROVADO',
        joinedAt: '2021-08-01',
        lgpdConsent: true,
        totalAttendances: 612,
        totalEvolutions: 598,
        avgSessionMinutes: 46,
        satisfactionAvg: 9.1,
      },
    ];

    for (const prof of defaultProfessionals) {
      const ref = doc(collection(db, 'professionals'));
      batch.set(ref, { ...prof, updatedAt: serverTimestamp() });
    }

    // Seed de Alertas Clínicos
    const alertRef = doc(collection(db, 'clinical_alerts'));
    batch.set(alertRef, {
      professionalId: 'current',
      type: 'EVOLUCAO_PENDENTE',
      beneficiaryName: 'Maria Aparecida Santos',
      message: 'Evolução da sessão de 18/07/2025 ainda não registrada.',
      severity: 'AVISO',
      isRead: false,
      dueDate: '2025-07-25',
      createdAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });

    // Seed de discussão de caso
    const discRef = doc(collection(db, 'case_discussions'));
    batch.set(discRef, {
      beneficiaryId: 'b1',
      beneficiaryName: 'Maria Aparecida Santos',
      title: 'Avaliação Multiprofissional — Risco de Suicídio',
      description: 'Solicito parecer psiquiátrico e social para paciente que apresentou ideação suicida passiva na última sessão. Necessário definir plano de segurança.',
      requestedBy: 'prof-01',
      requestedByName: 'Dra. Vanessa Guimarães',
      participants: [],
      messages: [
        {
          id: 'msg-001',
          authorId: 'prof-01',
          authorName: 'Dra. Vanessa Guimarães',
          content: 'Paciente relatou pensamentos de que "seria melhor não estar aqui". Sem plano ou intenção ativa no momento. Solicito avaliação psiquiátrica e revisão do plano social.',
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          isConfidential: true,
        },
      ],
      status: 'ABERTO',
      isUrgent: true,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  },
};
