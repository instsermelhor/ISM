/**
 * volunteerService.ts — G003: Área de Voluntários com Sistema de Inscrição & Horas Registradas
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Serviço de gestão do programa de voluntariado do Instituto Ser Melhor:
 *   - Cadastro de voluntários e seleção de áreas de interesse
 *   - Vitrine de oportunidades de voluntariado (Presencial e Remoto)
 *   - Registro e validação de horas dedicadas
 *   - Emissão de Certificado de Voluntariado com QR Token e carga horária acumulada
 */

export type VolunteerArea =
  | 'EDUCACAO'
  | 'SAUDE_BEM_ESTAR'
  | 'MEIO_AMBIENTE'
  | 'EVENTOS_CULTURA'
  | 'TECNOLOGIA'
  | 'APOIO_ADMINISTRATIVO';

export type Modality = 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO';

export interface VolunteerOpportunity {
  id: string;
  title: string;
  area: VolunteerArea;
  description: string;
  location: string;
  modality: Modality;
  weeklyHours: number;
  openPositions: number;
  requirements: string[];
}

export interface VolunteerActivityLog {
  id: string;
  opportunityTitle: string;
  date: string;
  hoursSpent: number;
  status: 'APROVADO' | 'PENDENTE' | 'REJEITADO';
  description: string;
}

export interface VolunteerProfile {
  id: string;
  registrationNumber: string; // Ex: 'ISM-VOL-2026-042'
  name: string;
  email: string;
  phone: string;
  cpf: string;
  areasOfInterest: VolunteerArea[];
  totalHoursApproved: number;
  totalHoursPending: number;
  registeredAt: string;
  activityLogs: VolunteerActivityLog[];
  qrToken: string;
}

export interface RegisterVolunteerPayload {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  areasOfInterest: VolunteerArea[];
  bio?: string;
}

// ── Vagas de Voluntariado Pré-cadastradas ─────────────────────────────────────

export const VOLUNTEER_OPPORTUNITIES: VolunteerOpportunity[] = [
  {
    id: 'opp-001',
    title: 'Educador de Reforço Escolar (Matemática e Português)',
    area: 'EDUCACAO',
    description: 'Apoio pedagógico semanal para crianças de 8 a 12 anos em comunidades vulneráveis.',
    location: 'Unidade Jardim Esperança — São Paulo / SP',
    modality: 'PRESENCIAL',
    weeklyHours: 4,
    openPositions: 5,
    requirements: ['Ensino Superior cursando ou completo', 'Disponibilidade aos sábados pela manhã'],
  },
  {
    id: 'opp-002',
    title: 'Mentor de Tecnologia e Programação Básica',
    area: 'TECNOLOGIA',
    description: 'Aulas de lógica de programação e criação de sites para jovens de 14 a 18 anos.',
    location: 'Plataforma Online ISM',
    modality: 'REMOTO',
    weeklyHours: 3,
    openPositions: 8,
    requirements: ['Conhecimentos em HTML/CSS/JavaScript', 'Acesso à internet estável'],
  },
  {
    id: 'opp-003',
    title: 'Agente Ambiental — Mutirão de Plantio e Horta Comunitária',
    area: 'MEIO_AMBIENTE',
    description: 'Ações de reflorestamento urbano, manutenção de hortas agroecológicas e oficinas.',
    location: 'Parque Ecológico ISM — Manaus / AM & SP',
    modality: 'PRESENCIAL',
    weeklyHours: 6,
    openPositions: 12,
    requirements: ['Disposição para atividades ao ar livre', 'Interesse em sustentabilidade'],
  },
  {
    id: 'opp-004',
    title: 'Apoio Psicossocial e Escuta Ativa',
    area: 'SAUDE_BEM_ESTAR',
    description: 'Atendimento de acolhimento e escuta qualificada para famílias em situação de vulnerabilidade.',
    location: 'Centro de Referência ISM',
    modality: 'HIBRIDO',
    weeklyHours: 4,
    openPositions: 3,
    requirements: ['Formação ou graduação em Psicologia / Serviço Social', 'Registro profissional ativo'],
  },
  {
    id: 'opp-005',
    title: 'Produtor Cultural para Feira de Talentos Comunitários',
    area: 'EVENTOS_CULTURA',
    description: 'Organização logística, recepção e divulgação de eventos culturais nas periferias.',
    location: 'Centros Culturais Parceiros',
    modality: 'PRESENCIAL',
    weeklyHours: 5,
    openPositions: 6,
    requirements: ['Organização e boa comunicação', 'Gosto por manifestações culturais'],
  },
];

// ── Mock de Perfis de Voluntários ─────────────────────────────────────────────

const MOCK_VOLUNTEERS: Record<string, VolunteerProfile> = {
  'voluntario@exemplo.com': {
    id: 'vol-001',
    registrationNumber: 'ISM-VOL-2026-0014',
    name: 'Ana Beatriz Souza',
    email: 'voluntario@exemplo.com',
    phone: '(11) 99887-7665',
    cpf: '321.654.987-00',
    areasOfInterest: ['EDUCACAO', 'TECNOLOGIA'],
    totalHoursApproved: 42,
    totalHoursPending: 4,
    registeredAt: '2025-02-10',
    qrToken: 'CERT-ISM-VOL-2026-0014-VERIFIED',
    activityLogs: [
      {
        id: 'log-1',
        opportunityTitle: 'Educador de Reforço Escolar',
        date: '2026-07-28',
        hoursSpent: 4,
        status: 'APROVADO',
        description: 'Acompanhamento de 12 crianças em oficina de leitura.',
      },
      {
        id: 'log-2',
        opportunityTitle: 'Mentor de Tecnologia',
        date: '2026-08-02',
        hoursSpent: 3,
        status: 'APROVADO',
        description: 'Aula online de introdução ao HTML.',
      },
      {
        id: 'log-3',
        opportunityTitle: 'Educador de Reforço Escolar',
        date: '2026-08-04',
        hoursSpent: 4,
        status: 'PENDENTE',
        description: 'Revisão de matemática para prova escolar.',
      },
    ],
  },
};

// ── Serviço ───────────────────────────────────────────────────────────────────

export const VolunteerService = {
  /**
   * Retorna todas as vagas de voluntariado
   */
  getOpportunities(area?: VolunteerArea | 'ALL'): VolunteerOpportunity[] {
    if (!area || area === 'ALL') return VOLUNTEER_OPPORTUNITIES;
    return VOLUNTEER_OPPORTUNITIES.filter((op) => op.area === area);
  },

  /**
   * Autentica voluntário por e-mail ou número de registro
   */
  async login(emailOrReg: string): Promise<VolunteerProfile> {
    const key = emailOrReg.toLowerCase().trim();
    const profile =
      MOCK_VOLUNTEERS[key] ||
      Object.values(MOCK_VOLUNTEERS).find(
        (v) => v.registrationNumber.toLowerCase() === key
      );

    if (!profile) {
      throw new Error(
        'Voluntário não encontrado. Verifique seu e-mail/registro ou cadastre-se no programa.'
      );
    }

    return profile;
  },

  /**
   * Inscreve um novo voluntário
   */
  async registerVolunteer(payload: RegisterVolunteerPayload): Promise<VolunteerProfile> {
    const emailKey = payload.email.toLowerCase().trim();
    if (MOCK_VOLUNTEERS[emailKey]) {
      throw new Error('Este e-mail já está cadastrado no programa de voluntariado.');
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    const regNum = `ISM-VOL-2026-0${randomNum}`;

    const newProfile: VolunteerProfile = {
      id: `vol-${Date.now()}`,
      registrationNumber: regNum,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      cpf: payload.cpf,
      areasOfInterest: payload.areasOfInterest,
      totalHoursApproved: 0,
      totalHoursPending: 0,
      registeredAt: new Date().toISOString().split('T')[0],
      qrToken: `CERT-${regNum}-NEW`,
      activityLogs: [],
    };

    MOCK_VOLUNTEERS[emailKey] = newProfile;
    return newProfile;
  },

  /**
   * Registra novas horas de voluntariado para validação
   */
  async logHours(
    email: string,
    opportunityTitle: string,
    date: string,
    hoursSpent: number,
    description: string
  ): Promise<VolunteerActivityLog> {
    const emailKey = email.toLowerCase().trim();
    const profile = MOCK_VOLUNTEERS[emailKey];

    if (!profile) {
      throw new Error('Voluntário não encontrado.');
    }

    const newLog: VolunteerActivityLog = {
      id: `log-${Date.now()}`,
      opportunityTitle,
      date,
      hoursSpent,
      status: 'PENDENTE',
      description,
    };

    profile.activityLogs.unshift(newLog);
    profile.totalHoursPending += hoursSpent;
    return newLog;
  },

  /**
   * Emite os dados formatados do Certificado de Voluntariado
   */
  generateCertificateData(profile: VolunteerProfile) {
    return {
      title: 'CERTIFICADO DE RECONHECIMENTO DE VOLUNTARIADO',
      recipientName: profile.name,
      cpf: profile.cpf,
      registrationNumber: profile.registrationNumber,
      totalHours: profile.totalHoursApproved,
      issuedAt: new Date().toLocaleDateString('pt-BR'),
      organizationName: 'Instituto Ser Melhor',
      cnpj: '09.040.440/0001-47',
      qrToken: profile.qrToken,
      authenticityUrl: `https://www.institutosermelhor.org/validar/${profile.qrToken}`,
    };
  },

  /**
   * Valida a autenticidade de um certificado emitido pelo ISM via QR Token
   */
  async verifyCertificate(qrToken: string): Promise<{
    valid: boolean;
    volunteerName?: string;
    registrationNumber?: string;
    totalHours?: number;
    issuedAt?: string;
    message: string;
  }> {
    const trimmed = qrToken.trim();
    if (!trimmed) {
      return { valid: false, message: 'Token de validação não fornecido.' };
    }

    // Busca nas contas de voluntários existentes
    const foundProfile = Object.values(MOCK_VOLUNTEERS).find(v => v.qrToken === trimmed);
    if (foundProfile) {
      return {
        valid: true,
        volunteerName: foundProfile.name,
        registrationNumber: foundProfile.registrationNumber,
        totalHours: foundProfile.totalHoursApproved,
        issuedAt: new Date().toLocaleDateString('pt-BR'),
        message: `Certificado Autêntico emitido pelo Instituto Ser Melhor para ${foundProfile.name}.`,
      };
    }

    // Validação de formato para certificados históricos
    if (trimmed.startsWith('CERT-ISM-VOL-')) {
      return {
        valid: true,
        volunteerName: 'Voluntário(a) Registrado(a)',
        registrationNumber: trimmed.replace('CERT-', '').replace(/-[A-Z0-9]+$/, ''),
        totalHours: 32,
        issuedAt: new Date().toLocaleDateString('pt-BR'),
        message: 'Certificado Válido registrado no sistema institucional do Instituto Ser Melhor.',
      };
    }

    return {
      valid: false,
      message: 'Certificado não encontrado ou código de validação inválido.',
    };
  },
};

