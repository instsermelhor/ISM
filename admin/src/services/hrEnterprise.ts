/**
 * HrEnterpriseService
 * ────────────────────
 * Serviço de dados Enterprise para Gestão de Pessoas (HCM), Credenciamento Profissional,
 * Banco de Horas Voluntárias, Matriz de Competências e Trilhas de Capacitação.
 *
 * Coleções gerenciadas:
 *   • hr_members             — Membros do quadro (Profissionais, Voluntários, Conselheiros)
 *   • hr_credentials         — Dossiês de credenciamento (Registros CRM/CRP/OAB, Diplomas)
 *   • volunteer_hours        — Registro e auditoria de horas voluntárias
 *   • hr_evaluations         — Avaliações de desempenho 360º e PDI
 *   • hr_trainings           — Cursos e trilhas de capacitação continuada
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type MemberCategory =
  | 'Voluntario'
  | 'Psicologo'
  | 'Psiquiatra'
  | 'AssistenteSocial'
  | 'Advogado'
  | 'Educador'
  | 'Coordenador'
  | 'Diretor'
  | 'Conselheiro'
  | 'Estagiario'
  | 'PrestadorServico';

export type CredentialStatus = 'EM_ANALISE' | 'APROVADO' | 'PENDENTE_DOC' | 'SUSPENSO';

export interface HrMember {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  cpf: string;
  category: MemberCategory;
  councilRegistration?: string; // ex: 'CRP 06/123456', 'OAB/SP 987654'
  councilState?: string;        // ex: 'SP'
  specialties: string[];        // ex: ['Psicologia Infantil', 'Direito Ambiental']
  department: string;
  status: 'Ativo' | 'Em Onboarding' | 'Inativo' | 'Desligado';
  volunteerHoursTotal: number;
  credentialStatus: CredentialStatus;
  joinedAt: string;             // YYYY-MM-DD
  avatarUrl?: string;
  lgpdConsent: boolean;
  updatedAt?: unknown;
}

export interface VolunteerHourRecord {
  id?: string;
  memberId: string;
  memberName: string;
  programId?: string;
  programTitle: string;
  date: string;                 // YYYY-MM-DD
  hoursCount: number;
  activityDescription: string;
  supervisorName: string;
  verified: boolean;
  updatedAt?: unknown;
}

export interface HrTrainingCourse {
  id?: string;
  title: string;
  category: 'Metodologia' | 'Compliance' | 'Atendimento' | 'Lideranca';
  workloadHours: number;
  mandatoryForCategories: MemberCategory[];
  instructorName: string;
  active: boolean;
  updatedAt?: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Service ────────────────────────────────────────────────────────────────

export const HrEnterpriseService = {

  // ── Members ──────────────────────────────────────────────────────────────

  async getMembers(): Promise<HrMember[]> {
    const q = query(collection(db, 'hr_members'), orderBy('name'));
    const snap = await getDocs(q);
    return mapDocs<HrMember>(snap);
  },

  async saveMember(data: HrMember): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'hr_members', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'hr_members'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteMember(id: string): Promise<void> {
    await deleteDoc(doc(db, 'hr_members', id));
  },

  // ── Volunteer Hours ───────────────────────────────────────────────────────

  async getVolunteerHours(memberId?: string): Promise<VolunteerHourRecord[]> {
    let q = memberId
      ? query(collection(db, 'volunteer_hours'), where('memberId', '==', memberId), orderBy('date', 'desc'))
      : query(collection(db, 'volunteer_hours'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<VolunteerHourRecord>(snap);
  },

  async logVolunteerHours(data: VolunteerHourRecord): Promise<string> {
    const ref = await addDoc(collection(db, 'volunteer_hours'), { ...data, updatedAt: serverTimestamp() });

    // Atualiza saldo total de horas do membro
    const memberRef = doc(db, 'hr_members', data.memberId);
    const snap = await getDoc(memberRef);
    if (snap.exists()) {
      const currentTotal = (snap.data().volunteerHoursTotal as number) || 0;
      await setDoc(memberRef, { volunteerHoursTotal: currentTotal + data.hoursCount, updatedAt: serverTimestamp() }, { merge: true });
    }

    return ref.id;
  },

  // ── Seed Defaults ────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultMembers: Omit<HrMember, 'id'>[] = [
      {
        name: 'Dra. Vanessa Guimarães',
        email: 'vanessa.psico@institutosermelhor.org',
        phone: '(11) 97654-3210',
        cpf: '123.456.789-00',
        category: 'Psicologo',
        councilRegistration: 'CRP 06/142850',
        councilState: 'SP',
        specialties: ['Psicologia Social', 'Terapia Cognitivo-Comportamental'],
        department: 'Saúde Mental & Emancipação',
        status: 'Ativo',
        volunteerHoursTotal: 180,
        credentialStatus: 'APROVADO',
        joinedAt: '2022-03-15',
        lgpdConsent: true,
      },
      {
        name: 'Dr. Paulo Roberto Neves',
        email: 'paulo.juridico@institutosermelhor.org',
        phone: '(11) 98111-2233',
        cpf: '987.654.321-11',
        category: 'Advogado',
        councilRegistration: 'OAB/SP 312.450',
        councilState: 'SP',
        specialties: ['Direito do Terceiro Setor', 'Compliance LGPD'],
        department: 'Jurídico & Governança',
        status: 'Ativo',
        volunteerHoursTotal: 95,
        credentialStatus: 'APROVADO',
        joinedAt: '2023-01-10',
        lgpdConsent: true,
      },
    ];

    for (const mem of defaultMembers) {
      const ref = doc(collection(db, 'hr_members'));
      batch.set(ref, { ...mem, updatedAt: serverTimestamp() });
    }

    await batch.commit();
  },
};
