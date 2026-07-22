/**
 * BeneficiaryEnterpriseService
 * ─────────────────────────────────────────────────────────────────────────────
 * Serviço Enterprise para o Portal do Beneficiário — Instituto Ser Melhor
 *
 * Coleções Firestore gerenciadas:
 *   • beneficiaries            — Cadastro mestre de beneficiários (perfil completo)
 *   • beneficiary_journeys     — Jornada digital (etapas, triagem, status)
 *   • beneficiary_attendances  — Registro de atendimentos (Psicologia, Social, Jurídico…)
 *   • beneficiary_appointments — Agenda de consultas e atendimentos
 *   • beneficiary_documents    — Gestão documental (receitas, laudos, atestados)
 *   • beneficiary_telehealth   — Sessões de telemedicina e videochamada
 *   • beneficiary_consents     — Consentimentos LGPD (append-only, auditável)
 *   • beneficiary_evaluations  — Avaliações de satisfação (NPS, CSAT, CES)
 *
 * Padrão: Clean Architecture · Zero Trust · LGPD by Design · WCAG 2.2 AAA
 * Prompt 030 — Plataforma ISM v2.0
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch, limit, updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Enumerações & Tipos ───────────────────────────────────────────────────────

export type JourneyStage =
  | 'PRE_CADASTRO'
  | 'CADASTRO'
  | 'VALIDACAO'
  | 'TRIAGEM'
  | 'ANALISE_SOCIAL'
  | 'CLASSIFICACAO'
  | 'APROVACAO'
  | 'PRIMEIRO_ATENDIMENTO'
  | 'PLANO_INDIVIDUAL'
  | 'EM_ATENDIMENTO'
  | 'ACOMPANHAMENTO'
  | 'AVALIACAO'
  | 'ALTA'
  | 'RETORNO'
  | 'REINGRESSO'
  | 'ARQUIVADO';

export type BeneficiaryStatus =
  | 'ATIVO' | 'AGUARDANDO' | 'SUSPENSO' | 'ALTA' | 'ARQUIVADO' | 'LISTA_ESPERA';

export type VulnerabilityType =
  | 'Violencia_Domestica'
  | 'Abuso_Sexual'
  | 'Negligencia'
  | 'Trabalho_Infantil'
  | 'Situacao_Rua'
  | 'Abuso_Substancias'
  | 'Saude_Mental'
  | 'Deficiencia'
  | 'Idoso_Risco'
  | 'Pobreza_Extrema'
  | 'Abandono'
  | 'Conflito_Familiar'
  | 'Outro';

export type AttendanceType =
  | 'Psicologia'
  | 'Psiquiatria'
  | 'Assistencia_Social'
  | 'Juridico'
  | 'Educacao'
  | 'Saude'
  | 'Nutricao'
  | 'Fisioterapia'
  | 'Voluntariado'
  | 'Grupo_Terapeutico'
  | 'Oficina'
  | 'Acolhimento';

export type PriorityLevel = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type DocumentCategory =
  | 'Receita' | 'Atestado' | 'Laudo' | 'Parecer' | 'Declaracao'
  | 'Encaminhamento' | 'Termo' | 'Certificado' | 'Documento_Pessoal' | 'Outro';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface BeneficiaryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface LegalGuardian {
  name: string;
  relationship: string;
  cpf: string;
  phone: string;
  email?: string;
}

export interface Dependent {
  name: string;
  relationship: string;
  birthDate: string;
  specialNeeds?: string;
}

export interface LgpdConsent {
  consentedAt: string;
  consentedFor: string[];          // ['dados_pessoais', 'compartilhamento_parceiros', 'marketing']
  ipAddress?: string;
  revokedAt?: string;
  version: string;                 // Versão do termo de consentimento
}

export interface Beneficiary {
  id?: string;

  // ── Dados Pessoais ─────────────────────────────────────────────────────────
  fullName: string;
  socialName?: string;
  cpf: string;
  rg?: string;
  birthDate: string;               // YYYY-MM-DD
  gender: string;
  pronouns?: string;
  phone: string;
  email?: string;
  nationality?: string;
  ethnicity?: string;
  religion?: string;

  // ── Endereço ───────────────────────────────────────────────────────────────
  address: BeneficiaryAddress;

  // ── Família ────────────────────────────────────────────────────────────────
  isMinor: boolean;
  legalGuardian?: LegalGuardian;
  dependents: Dependent[];
  familyIncome?: number;           // Renda familiar mensal
  familySize?: number;             // Número de membros na família

  // ── Vulnerabilidades e Contexto Social ────────────────────────────────────
  vulnerabilities: VulnerabilityType[];
  specialNeeds?: string;
  healthConditions: string[];
  socialNotes?: string;

  // ── Jornada & Status ──────────────────────────────────────────────────────
  status: BeneficiaryStatus;
  journeyStage: JourneyStage;
  priority: PriorityLevel;
  registeredAt: string;
  lastAttendanceAt?: string;

  // ── Programas & ODS ───────────────────────────────────────────────────────
  enrolledPrograms: string[];      // IDs dos programas vinculados
  odsGoals: number[];              // ODS relacionados (1–17)

  // ── Responsáveis ──────────────────────────────────────────────────────────
  assignedProfessionalId?: string;
  assignedProfessionalName?: string;
  caseManagerId?: string;
  caseManagerName?: string;

  // ── LGPD & Consentimentos ─────────────────────────────────────────────────
  lgpdConsents: LgpdConsent[];
  dataRetentionUntil?: string;     // Data limite de retenção LGPD

  // ── Referência & Encaminhamento ───────────────────────────────────────────
  referredBy?: string;             // 'CRAS', 'CREAS', 'UBS', 'Espontâneo', etc.
  referralNotes?: string;

  avatarUrl?: string;
  riskScore?: number;              // 0–100 (calculado por IA)
  evasionRisk?: number;            // 0–100 (predição de evasão por IA)

  updatedAt?: unknown;
}

export interface BeneficiaryJourney {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  stage: JourneyStage;
  previousStage?: JourneyStage;
  transitionedAt: string;          // ISO timestamp
  transitionedBy: string;          // Nome do profissional
  notes?: string;
  outcome?: string;                // Resultado da etapa
  nextAction?: string;             // Próxima ação prevista
  updatedAt?: unknown;
}

export interface AttendanceRecord {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  type: AttendanceType;
  professionalId: string;
  professionalName: string;
  professionalCouncil?: string;    // ex: 'CRP 06/142850'
  scheduledAt: string;             // ISO datetime
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  modality: 'Presencial' | 'Telemedicina' | 'Domiciliar' | 'Grupo';
  status: 'AGENDADO' | 'CONFIRMADO' | 'REALIZADO' | 'FALTOU' | 'CANCELADO' | 'REMARCADO';
  programId?: string;

  // Prontuário
  chiefComplaint?: string;         // Queixa principal
  clinicalNotes?: string;          // Evolução clínica (acesso restrito)
  plan?: string;                   // Plano terapêutico da sessão
  prescriptions?: string[];        // Prescrições emitidas
  referrals?: string[];            // Encaminhamentos realizados
  followUpDate?: string;           // Próxima consulta sugerida

  // Confidencialidade
  isConfidential: boolean;         // Acesso apenas ao profissional responsável
  isSigned: boolean;               // Assinatura digital do profissional

  teleheathSessionId?: string;     // Referência à sessão de telemedicina
  updatedAt?: unknown;
}

export interface Appointment {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  professionalId: string;
  professionalName: string;
  type: AttendanceType;
  modality: 'Presencial' | 'Telemedicina' | 'Domiciliar';
  scheduledAt: string;             // ISO datetime
  duration: number;                // Duração em minutos
  location?: string;               // Sala / endereço
  status: 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'REALIZADO' | 'FALTOU';
  reminderSent: boolean;
  confirmationSent: boolean;
  notes?: string;
  programId?: string;
  updatedAt?: unknown;
}

export interface BeneficiaryDocument {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  category: DocumentCategory;
  title: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;               // 'pdf', 'jpg', etc.
  issuedAt: string;
  expiresAt?: string;
  issuedBy: string;                // Profissional emissor
  professionalCouncil?: string;
  digitalSignature?: string;       // Hash de assinatura digital
  isSigned: boolean;
  isConfidential: boolean;
  downloadCount: number;
  updatedAt?: unknown;
}

export interface TelehealthSession {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  professionalId: string;
  professionalName: string;
  appointmentId?: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  status: 'AGENDADA' | 'AGUARDANDO' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'FALHOU' | 'CANCELADA';
  roomUrl?: string;                // URL da sala de videochamada (ex: Daily.co, Jitsi)
  roomToken?: string;              // Token de acesso seguro
  chatMessages?: number;           // Qtd de mensagens no chat
  filesShared?: number;            // Arquivos compartilhados na sessão
  recordingConsented: boolean;     // Consentimento para gravação
  encryptionEnabled: boolean;      // Criptografia E2E ativa
  technicalIssues?: string;        // Registro de problemas técnicos
  qualityRating?: number;          // 1–5 (avaliado pelo beneficiário)
  updatedAt?: unknown;
}

export interface BeneficiaryEvaluation {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  type: 'NPS' | 'CSAT' | 'CES';
  score: number;                   // NPS: 0–10 | CSAT: 1–5 | CES: 1–7
  comment?: string;
  attendanceId?: string;
  respondedAt: string;
  channel: 'App' | 'WhatsApp' | 'Email' | 'Presencial';
  updatedAt?: unknown;
}

export interface IndividualPlan {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  caseManagerName: string;
  createdAt: string;
  validUntil: string;

  objectives: {
    id: string;
    description: string;
    targetDate: string;
    status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
    progressPct: number;           // 0–100
  }[];

  interventions: {
    type: AttendanceType;
    frequency: string;             // ex: 'Semanal', 'Quinzenal'
    professionalName: string;
  }[];

  riskFactors: string[];
  protectiveFactors: string[];
  familyGoals: string[];
  notes?: string;
  reviewDate?: string;
  updatedAt?: unknown;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Service ───────────────────────────────────────────────────────────────────

export const BeneficiaryEnterpriseService = {

  // ── Beneficiaries ─────────────────────────────────────────────────────────

  async getBeneficiaries(status?: BeneficiaryStatus): Promise<Beneficiary[]> {
    const q = status
      ? query(collection(db, 'beneficiaries'), where('status', '==', status), orderBy('fullName'))
      : query(collection(db, 'beneficiaries'), orderBy('fullName'));
    return mapDocs<Beneficiary>(await getDocs(q));
  },

  async getBeneficiary(id: string): Promise<Beneficiary | null> {
    const snap = await getDoc(doc(db, 'beneficiaries', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Beneficiary;
  },

  async saveBeneficiary(data: Beneficiary): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'beneficiaries', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'beneficiaries'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async updateJourneyStage(
    beneficiaryId: string,
    newStage: JourneyStage,
    transitionedBy: string,
    notes?: string,
  ): Promise<void> {
    const benRef = doc(db, 'beneficiaries', beneficiaryId);
    const snap = await getDoc(benRef);
    if (!snap.exists()) return;

    const prev = snap.data().journeyStage as JourneyStage;
    const batch = writeBatch(db);

    // Atualiza status do beneficiário
    batch.update(benRef, {
      journeyStage: newStage,
      updatedAt: serverTimestamp(),
      ...(newStage === 'ALTA' ? { status: 'ALTA' } : {}),
      ...(newStage === 'ARQUIVADO' ? { status: 'ARQUIVADO' } : {}),
    });

    // Registra evento de jornada (append-only)
    const journeyRef = doc(collection(db, 'beneficiary_journeys'));
    batch.set(journeyRef, {
      beneficiaryId,
      beneficiaryName: snap.data().fullName,
      stage: newStage,
      previousStage: prev,
      transitionedAt: new Date().toISOString(),
      transitionedBy,
      notes: notes ?? '',
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  },

  async searchBeneficiaries(term: string): Promise<Beneficiary[]> {
    // Firestore não suporta LIKE nativo; busca por prefixo no nome
    const q = query(
      collection(db, 'beneficiaries'),
      where('fullName', '>=', term),
      where('fullName', '<=', term + '\uf8ff'),
      limit(20),
    );
    return mapDocs<Beneficiary>(await getDocs(q));
  },

  // ── Journey History ───────────────────────────────────────────────────────

  async getJourneyHistory(beneficiaryId: string): Promise<BeneficiaryJourney[]> {
    const q = query(
      collection(db, 'beneficiary_journeys'),
      where('beneficiaryId', '==', beneficiaryId),
      orderBy('transitionedAt', 'desc'),
    );
    return mapDocs<BeneficiaryJourney>(await getDocs(q));
  },

  // ── Attendances ───────────────────────────────────────────────────────────

  async getAttendances(beneficiaryId: string): Promise<AttendanceRecord[]> {
    const q = query(
      collection(db, 'beneficiary_attendances'),
      where('beneficiaryId', '==', beneficiaryId),
      orderBy('scheduledAt', 'desc'),
    );
    return mapDocs<AttendanceRecord>(await getDocs(q));
  },

  async getAllAttendances(filters?: { type?: AttendanceType; status?: string }): Promise<AttendanceRecord[]> {
    let q = query(collection(db, 'beneficiary_attendances'), orderBy('scheduledAt', 'desc'), limit(100));
    if (filters?.type) {
      q = query(collection(db, 'beneficiary_attendances'), where('type', '==', filters.type), orderBy('scheduledAt', 'desc'), limit(100));
    }
    return mapDocs<AttendanceRecord>(await getDocs(q));
  },

  async saveAttendance(data: AttendanceRecord): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'beneficiary_attendances', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      // Atualiza lastAttendanceAt no beneficiário
      if (data.status === 'REALIZADO') {
        await updateDoc(doc(db, 'beneficiaries', data.beneficiaryId), {
          lastAttendanceAt: data.endedAt ?? data.scheduledAt,
          updatedAt: serverTimestamp(),
        });
      }
      return id;
    }
    const ref = await addDoc(collection(db, 'beneficiary_attendances'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Appointments ──────────────────────────────────────────────────────────

  async getAppointments(beneficiaryId?: string): Promise<Appointment[]> {
    const q = beneficiaryId
      ? query(collection(db, 'beneficiary_appointments'), where('beneficiaryId', '==', beneficiaryId), orderBy('scheduledAt'))
      : query(collection(db, 'beneficiary_appointments'), orderBy('scheduledAt'));
    return mapDocs<Appointment>(await getDocs(q));
  },

  async getUpcomingAppointments(days: number = 7): Promise<Appointment[]> {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + days * 86400000).toISOString();
    const q = query(
      collection(db, 'beneficiary_appointments'),
      where('scheduledAt', '>=', from),
      where('scheduledAt', '<=', to),
      where('status', 'in', ['AGENDADO', 'CONFIRMADO']),
      orderBy('scheduledAt'),
    );
    return mapDocs<Appointment>(await getDocs(q));
  },

  async saveAppointment(data: Appointment): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'beneficiary_appointments', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'beneficiary_appointments'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteAppointment(id: string): Promise<void> {
    await deleteDoc(doc(db, 'beneficiary_appointments', id));
  },

  // ── Documents ─────────────────────────────────────────────────────────────

  async getDocuments(beneficiaryId: string): Promise<BeneficiaryDocument[]> {
    const q = query(
      collection(db, 'beneficiary_documents'),
      where('beneficiaryId', '==', beneficiaryId),
      orderBy('issuedAt', 'desc'),
    );
    return mapDocs<BeneficiaryDocument>(await getDocs(q));
  },

  async saveDocument(data: BeneficiaryDocument): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'beneficiary_documents', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'beneficiary_documents'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteDocument(id: string): Promise<void> {
    await deleteDoc(doc(db, 'beneficiary_documents', id));
  },

  // ── Telehealth ────────────────────────────────────────────────────────────

  async getTelehealthSessions(beneficiaryId?: string): Promise<TelehealthSession[]> {
    const q = beneficiaryId
      ? query(collection(db, 'beneficiary_telehealth'), where('beneficiaryId', '==', beneficiaryId), orderBy('scheduledAt', 'desc'))
      : query(collection(db, 'beneficiary_telehealth'), orderBy('scheduledAt', 'desc'), limit(50));
    return mapDocs<TelehealthSession>(await getDocs(q));
  },

  async saveTelehealthSession(data: TelehealthSession): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'beneficiary_telehealth', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'beneficiary_telehealth'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Individual Plans ──────────────────────────────────────────────────────

  async getIndividualPlan(beneficiaryId: string): Promise<IndividualPlan | null> {
    const q = query(
      collection(db, 'beneficiary_individual_plans'),
      where('beneficiaryId', '==', beneficiaryId),
      orderBy('createdAt', 'desc'),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as IndividualPlan;
  },

  async saveIndividualPlan(data: IndividualPlan): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'beneficiary_individual_plans', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'beneficiary_individual_plans'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Evaluations ───────────────────────────────────────────────────────────

  async getEvaluations(beneficiaryId?: string): Promise<BeneficiaryEvaluation[]> {
    const q = beneficiaryId
      ? query(collection(db, 'beneficiary_evaluations'), where('beneficiaryId', '==', beneficiaryId), orderBy('respondedAt', 'desc'))
      : query(collection(db, 'beneficiary_evaluations'), orderBy('respondedAt', 'desc'), limit(100));
    return mapDocs<BeneficiaryEvaluation>(await getDocs(q));
  },

  async saveEvaluation(data: BeneficiaryEvaluation): Promise<string> {
    const ref = await addDoc(collection(db, 'beneficiary_evaluations'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Dashboard KPIs ────────────────────────────────────────────────────────

  async getDashboardKPIs(): Promise<{
    totalBeneficiaries: number;
    activeCount: number;
    waitingList: number;
    highRisk: number;
    todayAppointments: number;
    pendingDocuments: number;
    avgNps: number | null;
    stageDistribution: Record<JourneyStage, number>;
  }> {
    const [all, upcoming, evals] = await Promise.all([
      getDocs(query(collection(db, 'beneficiaries'), orderBy('fullName'))),
      getDocs(query(
        collection(db, 'beneficiary_appointments'),
        where('scheduledAt', '>=', new Date().toISOString().slice(0, 10)),
        where('scheduledAt', '<=', new Date().toISOString().slice(0, 10) + 'T23:59:59'),
        where('status', 'in', ['AGENDADO', 'CONFIRMADO']),
      )),
      getDocs(query(collection(db, 'beneficiary_evaluations'), where('type', '==', 'NPS'))),
    ]);

    const beneficiaries = mapDocs<Beneficiary>(all);
    const npsScores = mapDocs<BeneficiaryEvaluation>(evals).map(e => e.score);

    const stageDistribution = {} as Record<JourneyStage, number>;
    beneficiaries.forEach(b => {
      stageDistribution[b.journeyStage] = (stageDistribution[b.journeyStage] ?? 0) + 1;
    });

    return {
      totalBeneficiaries: beneficiaries.length,
      activeCount: beneficiaries.filter(b => b.status === 'ATIVO').length,
      waitingList: beneficiaries.filter(b => b.status === 'LISTA_ESPERA').length,
      highRisk: beneficiaries.filter(b => b.priority === 'CRITICA' || b.priority === 'ALTA').length,
      todayAppointments: upcoming.size,
      pendingDocuments: 0,
      avgNps: npsScores.length > 0 ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length : null,
      stageDistribution,
    };
  },

  // ── LGPD Consent ──────────────────────────────────────────────────────────

  async recordConsent(
    beneficiaryId: string,
    consentedFor: string[],
    version: string,
  ): Promise<void> {
    const consent: LgpdConsent = {
      consentedAt: new Date().toISOString(),
      consentedFor,
      version,
    };
    const benRef = doc(db, 'beneficiaries', beneficiaryId);
    const snap = await getDoc(benRef);
    if (!snap.exists()) return;
    const existing: LgpdConsent[] = (snap.data().lgpdConsents as LgpdConsent[]) ?? [];
    await setDoc(benRef, {
      lgpdConsents: [...existing, consent],
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Log auditável independente
    await addDoc(collection(db, 'beneficiary_consents'), {
      beneficiaryId,
      ...consent,
      recordedAt: serverTimestamp(),
    });
  },

  // ── Seed Defaults ─────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultBeneficiaries: Omit<Beneficiary, 'id'>[] = [
      {
        fullName: 'Maria Aparecida Santos',
        cpf: '123.456.789-00',
        birthDate: '1990-05-12',
        gender: 'Feminino',
        pronouns: 'ela/dela',
        phone: '(11) 97654-3210',
        email: 'maria.santos@email.com',
        address: {
          street: 'Rua das Flores', number: '123',
          neighborhood: 'Vila Nova', city: 'São Paulo', state: 'SP', zipCode: '01234-000',
        },
        isMinor: false,
        dependents: [{ name: 'João Santos', relationship: 'Filho', birthDate: '2015-03-20' }],
        familyIncome: 1412,
        familySize: 3,
        vulnerabilities: ['Violencia_Domestica', 'Pobreza_Extrema'],
        healthConditions: ['Ansiedade', 'Hipertensão'],
        status: 'ATIVO',
        journeyStage: 'EM_ATENDIMENTO',
        priority: 'ALTA',
        registeredAt: '2024-03-15',
        lastAttendanceAt: '2025-07-10',
        enrolledPrograms: [],
        odsGoals: [1, 3, 5, 10],
        assignedProfessionalName: 'Dra. Vanessa Guimarães',
        caseManagerName: 'Ana Lima',
        lgpdConsents: [{
          consentedAt: '2024-03-15T10:00:00Z',
          consentedFor: ['dados_pessoais', 'atendimento'],
          version: '2.0',
        }],
        referredBy: 'CRAS',
        riskScore: 74,
        evasionRisk: 18,
      },
      {
        fullName: 'Pedro Henrique Oliveira',
        cpf: '987.654.321-00',
        birthDate: '2010-08-22',
        gender: 'Masculino',
        pronouns: 'ele/dele',
        phone: '(11) 98111-2222',
        address: {
          street: 'Av. Principal', number: '456',
          neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '02345-000',
        },
        isMinor: true,
        legalGuardian: { name: 'Fernanda Oliveira', relationship: 'Mãe', cpf: '111.222.333-44', phone: '(11) 98111-2222' },
        dependents: [],
        familyIncome: 2100,
        familySize: 4,
        vulnerabilities: ['Saude_Mental', 'Conflito_Familiar'],
        healthConditions: ['TDAH', 'Ansiedade Social'],
        status: 'ATIVO',
        journeyStage: 'ACOMPANHAMENTO',
        priority: 'MEDIA',
        registeredAt: '2024-06-01',
        lastAttendanceAt: '2025-07-15',
        enrolledPrograms: [],
        odsGoals: [3, 4, 10],
        assignedProfessionalName: 'Dra. Vanessa Guimarães',
        caseManagerName: 'Ana Lima',
        lgpdConsents: [{
          consentedAt: '2024-06-01T09:00:00Z',
          consentedFor: ['dados_pessoais', 'atendimento', 'responsavel_legal'],
          version: '2.0',
        }],
        referredBy: 'UBS',
        riskScore: 42,
        evasionRisk: 31,
      },
      {
        fullName: 'Dona Benedita Ferreira',
        cpf: '555.444.333-00',
        birthDate: '1945-11-03',
        gender: 'Feminino',
        pronouns: 'ela/dela',
        phone: '(11) 96543-2100',
        address: {
          street: 'Rua da Paz', number: '78',
          neighborhood: 'Jardim América', city: 'São Paulo', state: 'SP', zipCode: '03456-000',
        },
        isMinor: false,
        dependents: [],
        familyIncome: 1412,
        familySize: 1,
        vulnerabilities: ['Idoso_Risco', 'Abandono', 'Pobreza_Extrema'],
        healthConditions: ['Diabetes Tipo 2', 'Depressão', 'Hipertensão'],
        status: 'LISTA_ESPERA',
        journeyStage: 'TRIAGEM',
        priority: 'CRITICA',
        registeredAt: '2025-07-01',
        enrolledPrograms: [],
        odsGoals: [1, 3, 10],
        lgpdConsents: [{
          consentedAt: '2025-07-01T14:00:00Z',
          consentedFor: ['dados_pessoais'],
          version: '2.0',
        }],
        referredBy: 'CREAS',
        riskScore: 88,
        evasionRisk: 55,
      },
    ];

    for (const ben of defaultBeneficiaries) {
      const ref = doc(collection(db, 'beneficiaries'));
      batch.set(ref, { ...ben, updatedAt: serverTimestamp() });
    }

    // Seed de agendamentos
    const apptRef = doc(collection(db, 'beneficiary_appointments'));
    batch.set(apptRef, {
      beneficiaryId: 'seed-01',
      beneficiaryName: 'Maria Aparecida Santos',
      professionalId: 'prof-01',
      professionalName: 'Dra. Vanessa Guimarães',
      type: 'Psicologia',
      modality: 'Presencial',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      duration: 50,
      location: 'Sala 3 — ISM',
      status: 'CONFIRMADO',
      reminderSent: true,
      confirmationSent: true,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  },
};
