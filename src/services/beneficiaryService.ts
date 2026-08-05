/**
 * beneficiaryService.ts — G002: Portal do Beneficiário & Cadastro de Famílias Assistidas
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Serviço para gerenciamento da área restrita do beneficiário e cadastro familiar:
 *   - Autenticação por CPF / Protocolo Familiar
 *   - Cadastro de nova família assistida (dados socioeconômicos, NIS, composição familiar)
 *   - Consulta de benefícios ativos (ex: Cesta Nutricional, Apoio Psicossocial, Kit Escolar)
 *   - Agendamento de atendimentos presenciais / retiradas
 *   - Cartão Digital do Beneficiário (QR Code e QR Token único)
 *   - Histórico imutável de auxílios recebidos
 */

export type FamilyStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'SUSPENDED';

export type BenefitType =
  | 'CESTA_ALIMENTAR'
  | 'APOIO_PSICOSSOCIAL'
  | 'REFORCO_ESCOLAR'
  | 'KIT_MATERIAL_ESCOLAR'
  | 'OFICINA_CAPACITACAO';

export interface FamilyMember {
  name: string;
  age: number;
  relationship: string; // Ex: 'Filho(a)', 'Cônjuge', 'Mãe'
  isStudent?: boolean;
}

export interface BenefitAllowance {
  id: string;
  type: BenefitType;
  title: string;
  description: string;
  status: 'DISPONIVEL' | 'SOLICITADO' | 'ENTREGUE' | 'EM_PROCESSAMENTO';
  nextAvailableDate?: string;
  lastReceivedDate?: string;
}

export interface Appointment {
  id: string;
  benefitType: BenefitType;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';
  notes?: string;
}

export interface BeneficiaryProfile {
  id: string;
  protocolNumber: string; // Ex: 'ISM-FAM-2026-0841'
  responsibleName: string;
  cpf: string;
  nis?: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  familyMembersCount: number;
  familyMembers: FamilyMember[];
  monthlyIncomePerCapita: number;
  status: FamilyStatus;
  registeredAt: string;
  qrToken: string;
  benefits: BenefitAllowance[];
  appointments: Appointment[];
}

export interface RegisterFamilyPayload {
  responsibleName: string;
  cpf: string;
  nis?: string;
  phone: string;
  email?: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  familyMembers: FamilyMember[];
  monthlyIncome: number;
}

// ── Mock inicial de perfis cadastrados ────────────────────────────────────────

const MOCK_BENEFICIARIES: Record<string, BeneficiaryProfile> = {
  '12345678900': {
    id: 'ben-001',
    protocolNumber: 'ISM-FAM-2026-0104',
    responsibleName: 'Maria das Graças Silva',
    cpf: '12345678900',
    nis: '128.49021.10-4',
    phone: '(11) 98765-4321',
    email: 'maria.silva@exemplo.com',
    address: {
      street: 'Rua das Flores',
      number: '142',
      neighborhood: 'Jardim Esperança',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04840-100',
    },
    familyMembersCount: 4,
    familyMembers: [
      { name: 'João Vitor Silva', age: 12, relationship: 'Filho(a)', isStudent: true },
      { name: 'Ana Clara Silva', age: 8, relationship: 'Filho(a)', isStudent: true },
      { name: 'Sebastião Silva', age: 68, relationship: 'Pai' },
    ],
    monthlyIncomePerCapita: 340.0,
    status: 'ACTIVE',
    registeredAt: '2025-03-15',
    qrToken: 'QR-ISM-BEN-12345678900-VERIFIED',
    benefits: [
      {
        id: 'ben-b1',
        type: 'CESTA_ALIMENTAR',
        title: 'Cesta Nutricional Mensal',
        description: 'Cesta com alimentos básicos + hortifrúti agroecológico',
        status: 'DISPONIVEL',
        nextAvailableDate: '2026-08-10',
        lastReceivedDate: '2026-07-12',
      },
      {
        id: 'ben-b2',
        type: 'REFORCO_ESCOLAR',
        title: 'Reforço Escolar (João Vitor)',
        description: 'Acompanhamento pedagógico de matemática e português',
        status: 'ENTREGUE',
        lastReceivedDate: '2026-08-01',
      },
      {
        id: 'ben-b3',
        type: 'APOIO_PSICOSSOCIAL',
        title: 'Atendimento Psicossocial Familiar',
        description: 'Sessão individual/familiar com psicóloga social',
        status: 'DISPONIVEL',
        nextAvailableDate: '2026-08-15',
      },
    ],
    appointments: [
      {
        id: 'app-01',
        benefitType: 'CESTA_ALIMENTAR',
        title: 'Retirada de Cesta Nutricional',
        date: '2026-08-10',
        time: '14:00',
        location: 'Centro Comunitário ISM — Unidade SP South',
        status: 'AGENDADO',
        notes: 'Apresentar documento com foto ou este aplicativo.',
      },
    ],
  },
};

// ── Serviço ───────────────────────────────────────────────────────────────────

export const BeneficiaryService = {
  /**
   * Autentica beneficiário por CPF ou Protocolo
   */
  async login(cpfOrProtocol: string): Promise<BeneficiaryProfile> {
    const cleanKey = cpfOrProtocol.replace(/\D/g, '');
    const profile = MOCK_BENEFICIARIES[cleanKey] || Object.values(MOCK_BENEFICIARIES).find(
      (b) => b.protocolNumber.toLowerCase() === cpfOrProtocol.toLowerCase().trim()
    );

    if (!profile) {
      throw new Error('Cadastro não encontrado. Verifique o CPF/Protocolo ou faça um novo cadastro.');
    }

    return profile;
  },

  /**
   * Cadastra nova família assistida
   */
  async registerFamily(payload: RegisterFamilyPayload): Promise<BeneficiaryProfile> {
    const cleanCpf = payload.cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      throw new Error('CPF inválido. Digite um CPF com 11 dígitos.');
    }

    if (MOCK_BENEFICIARIES[cleanCpf]) {
      throw new Error('Este CPF já possui cadastro no Instituto Ser Melhor.');
    }

    const totalPeople = payload.familyMembers.length + 1;
    const perCapita = payload.monthlyIncome / totalPeople;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const protocolNumber = `ISM-FAM-2026-${randomNum}`;

    const newProfile: BeneficiaryProfile = {
      id: `ben-${Date.now()}`,
      protocolNumber,
      responsibleName: payload.responsibleName,
      cpf: cleanCpf,
      nis: payload.nis,
      phone: payload.phone,
      email: payload.email,
      address: {
        street: payload.street,
        number: payload.number,
        neighborhood: payload.neighborhood,
        city: payload.city,
        state: payload.state,
        zipCode: payload.zipCode,
      },
      familyMembersCount: totalPeople,
      familyMembers: payload.familyMembers,
      monthlyIncomePerCapita: parseFloat(perCapita.toFixed(2)),
      status: 'UNDER_REVIEW', // Novo cadastro entra em análise social
      registeredAt: new Date().toISOString().split('T')[0],
      qrToken: `QR-ISM-BEN-${cleanCpf}-PENDING`,
      benefits: [
        {
          id: `ben-new-1`,
          type: 'CESTA_ALIMENTAR',
          title: 'Cesta Nutricional Emergencial',
          description: 'Avaliação prioritária para inclusão na distribuição de alimentos',
          status: 'EM_PROCESSAMENTO',
        },
      ],
      appointments: [],
    };

    MOCK_BENEFICIARIES[cleanCpf] = newProfile;
    return newProfile;
  },

  /**
   * Solicita um novo benefício ou agendamento
   */
  async requestBenefit(
    cpf: string,
    benefitType: BenefitType,
    date: string,
    time: string
  ): Promise<Appointment> {
    const cleanCpf = cpf.replace(/\D/g, '');
    const profile = MOCK_BENEFICIARIES[cleanCpf];

    if (!profile) {
      throw new Error('Beneficiário não encontrado.');
    }

    const titles: Record<BenefitType, string> = {
      CESTA_ALIMENTAR: 'Retirada de Cesta Nutricional',
      APOIO_PSICOSSOCIAL: 'Atendimento Psicossocial',
      REFORCO_ESCOLAR: 'Inscrição em Reforço Escolar',
      KIT_MATERIAL_ESCOLAR: 'Retirada de Kit Escolar',
      OFICINA_CAPACITACAO: 'Participação em Oficina de Capacitação',
    };

    const newAppointment: Appointment = {
      id: `app-${Date.now()}`,
      benefitType,
      title: titles[benefitType],
      date,
      time,
      location: 'Sede Principal ISM — Rua das Margaridas, 300',
      status: 'AGENDADO',
      notes: 'Solicitado via Portal do Beneficiário.',
    };

    profile.appointments.unshift(newAppointment);
    return newAppointment;
  },
};
