// FinancialService — Mock data + Bank API connector
import type {
  Donor, Donation, FinancialSummary, BankConnection, BankTransaction, FinancialGoal,
  DonorTier, DonorCategory, DonationMethod, DonationStatus, RecurrenceType
} from '../types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Helpers ─────────────────────────────────────────────────────
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const fmt = (d: Date) => d.toISOString();

const TIERS: DonorTier[] = ['SUPPORTER', 'CONTRIBUTOR', 'CHAMPION', 'PATRON', 'BENEFACTOR'];
const CATEGORIES: DonorCategory[] = ['INDIVIDUAL', 'CORPORATE', 'FOUNDATION', 'GOVERNMENT'];
const METHODS: DonationMethod[] = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO', 'BANK_TRANSFER'];
const STATUSES: DonationStatus[] = ['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'PENDING', 'FAILED'];
const RECURRENCES: RecurrenceType[] = ['MONTHLY', 'MONTHLY', 'SINGLE', 'SINGLE', 'QUARTERLY', 'ANNUAL'];

const DONOR_NAMES = [
  'Ana Carolina Ferreira', 'Roberto Lima', 'Juliana Costa', 'Marcos Antônio Silva',
  'Fundação Bradesco', 'Instituto Natura', 'Carla Mendes', 'Paulo Eduardo Santos',
  'Instituto Unibanco', 'Fernanda Rocha', 'Gustavo Henrique Alves', 'Beatriz Oliveira',
  'Grupo Itaú Social', 'Tatiana Borges', 'Leonardo Martins', 'Empresa X Ltda',
  'Amanda Cristina Souza', 'Felipe Augusto Pereira', 'Fundo Social SP', 'Clara Nunes',
  'Rodrigo Azevedo', 'Patrícia Lemos', 'Banco do Brasil Foundation', 'Eduardo Moraes',
  'Luiz Carlos Pinto', 'Daniela Freitas', 'ONG Verde Vida', 'Sérgio Nascimento',
  'Ministério da Cidadania', 'Viviane Camargo',
];

const CITIES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Brasília', 'Salvador', 'Porto Alegre'];
const STATES = ['SP', 'RJ', 'MG', 'PR', 'DF', 'BA', 'RS'];
const CAMPAIGNS = ['Meta 2025', 'Fundo Educação', 'Projeto Clima', 'Emergência Social', 'Geral'];

// ── Generate mock donors ────────────────────────────────────────
const generateDonors = (): Donor[] => {
  return DONOR_NAMES.map((name, i) => {
    const category: DonorCategory = i % 5 === 0 ? 'CORPORATE' : i % 7 === 0 ? 'FOUNDATION' : i % 11 === 0 ? 'GOVERNMENT' : 'INDIVIDUAL';
    const tier: DonorTier = TIERS[Math.min(Math.floor(i / 6), 4)];
    const totalDonated = [500, 1200, 3500, 8000, 25000][TIERS.indexOf(tier)] * (1 + Math.random());
    const first = new Date(2020 + Math.floor(i / 10), i % 12, 1);
    return {
      id: `donor-${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.')}@email.com`,
      phone: `(${11 + (i % 9)}) 9${rand(1000, 9999)}-${rand(1000, 9999)}`,
      document: category === 'INDIVIDUAL'
        ? `${rand(100, 999)}.${rand(100, 999)}.${rand(100, 999)}-${rand(10, 99)}`
        : `${rand(10, 99)}.${rand(100, 999)}.${rand(100, 999)}/0001-${rand(10, 99)}`,
      category,
      tier,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${['16a34a', '3b82f6', 'a855f7', 'f59e0b', 'ef4444'][i % 5]}&textColor=ffffff`,
      city: CITIES[i % CITIES.length],
      state: STATES[i % STATES.length],
      country: 'Brasil',
      totalDonated: Math.round(totalDonated),
      donationCount: rand(1, 36),
      firstDonationAt: fmt(first),
      lastDonationAt: fmt(new Date(Date.now() - rand(1, 90) * 86400000)),
      isAnonymous: i % 13 === 0,
      isRecurrent: RECURRENCES[i % RECURRENCES.length] !== 'SINGLE',
      tags: [tier.toLowerCase(), category.toLowerCase()].filter(Boolean),
      createdAt: fmt(first),
    };
  });
};

// ── Generate mock donations ─────────────────────────────────────
const generateDonations = (donors: Donor[]): Donation[] => {
  const donations: Donation[] = [];
  let id = 1;
  donors.forEach((donor, di) => {
    const count = rand(1, 4);
    for (let i = 0; i < count; i++) {
      const method = METHODS[(di + i) % METHODS.length];
      const status = STATUSES[(di + i) % STATUSES.length];
      const recurrence = RECURRENCES[(di + i) % RECURRENCES.length];
      const amount = Math.round(
        ([50, 150, 500, 1500, 5000][TIERS.indexOf(donor.tier)] + rand(0, 200)) * 100
      ) / 100;
      const created = new Date(Date.now() - rand(1, 180) * 86400000);
      donations.push({
        id: `don-${id++}`,
        donor: {
          id: donor.id, name: donor.name, email: donor.email,
          avatarUrl: donor.avatarUrl, tier: donor.tier, isAnonymous: donor.isAnonymous,
        },
        amount,
        currency: 'BRL',
        method,
        status,
        recurrence,
        campaignName: CAMPAIGNS[rand(0, CAMPAIGNS.length - 1)],
        gatewayId: `gw_${Math.random().toString(36).slice(2, 12)}`,
        gatewayName: ['Stripe', 'PagSeguro', 'Mercado Pago', 'Asaas', 'Juno'][rand(0, 4)],
        paidAt: status === 'CONFIRMED' ? fmt(created) : undefined,
        createdAt: fmt(created),
        updatedAt: fmt(created),
      });
    }
  });
  return donations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// ── MOCK DATA INSTANCES ─────────────────────────────────────────
const MOCK_DONORS = generateDonors();
const MOCK_DONATIONS = generateDonations(MOCK_DONORS);

const MOCK_BANK_CONNECTIONS: BankConnection[] = [
  {
    id: 'bank-1', bankName: 'Banco do Brasil', bankCode: '001',
    accountName: 'Instituto Ser Melhor', accountNumber: '12345-6', agency: '1234-5',
    accountType: 'CHECKING', status: 'CONNECTED',
    lastSyncAt: new Date(Date.now() - 3600000).toISOString(), balance: 48320.55,
    provider: 'OPEN_BANKING', webhookUrl: 'https://api.ism.org/webhooks/bb',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'bank-2', bankName: 'Itaú Unibanco', bankCode: '341',
    accountName: 'ISM - Conta Captação', accountNumber: '98765-4', agency: '5678-0',
    accountType: 'CHECKING', status: 'CONNECTED',
    lastSyncAt: new Date(Date.now() - 7200000).toISOString(), balance: 125800.00,
    provider: 'PLUGGY', webhookUrl: 'https://api.ism.org/webhooks/itau',
    createdAt: '2024-02-10T09:00:00Z',
  },
  {
    id: 'bank-3', bankName: 'Caixa Econômica Federal', bankCode: '104',
    accountName: 'ISM - Conta Poupança', accountNumber: '11111-2', agency: '0001',
    accountType: 'SAVINGS', status: 'ERROR',
    provider: 'OPEN_BANKING',
    createdAt: '2024-03-01T00:00:00Z',
  },
];

const generateTransactions = (): BankTransaction[] => {
  const txTypes = ['DONATION', 'EXPENSE', 'TRANSFER', 'FEE'] as const;
  const categories = ['Doação PIX', 'Doação TED', 'Folha de Pagamento', 'Serviços', 'Impostos', 'Manutenção'];
  return Array.from({ length: 40 }, (_, i) => ({
    id: `tx-${i + 1}`,
    bankConnectionId: MOCK_BANK_CONNECTIONS[i % 2].id,
    type: txTypes[i % txTypes.length] as any,
    amount: (i % 4 === 2 ? -1 : 1) * Math.round(rand(50, 5000) * 100) / 100,
    description: categories[i % categories.length] + ` #${1000 + i}`,
    category: categories[i % categories.length],
    date: new Date(Date.now() - i * 2 * 86400000).toISOString(),
    reference: `REF${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    donationId: i % 5 === 0 ? MOCK_DONATIONS[i % MOCK_DONATIONS.length]?.id : undefined,
    isReconciled: i % 3 === 0,
  }));
};

const MOCK_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1', title: 'Meta Anual 2025', description: 'Captação anual para programas e operações.',
    targetAmount: 2000000, currentAmount: 1248320,
    deadline: '2025-12-31T23:59:59Z', isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'goal-2', title: 'Fundo de Emergência', description: 'Reserva operacional de 6 meses.',
    targetAmount: 500000, currentAmount: 320000,
    deadline: '2025-06-30T23:59:59Z', isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'goal-3', title: 'Expansão Nordeste', description: 'Abertura de núcleo regional no Nordeste.',
    targetAmount: 350000, currentAmount: 87500,
    isActive: true, createdAt: '2025-03-01T00:00:00Z',
  },
];

// ── MONTH NAMES ─────────────────────────────────────────────────
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const buildSummary = (donations: Donation[]): FinancialSummary => {
  const confirmed = donations.filter(d => d.status === 'CONFIRMED');
  const now = Date.now();
  const ms30 = 30 * 86400000;
  const ms12m = 365 * 86400000;
  const total = confirmed.reduce((s, d) => s + d.amount, 0);
  const total30d = confirmed.filter(d => now - new Date(d.createdAt).getTime() < ms30).reduce((s, d) => s + d.amount, 0);
  const total12m = confirmed.filter(d => now - new Date(d.createdAt).getTime() < ms12m).reduce((s, d) => s + d.amount, 0);
  const recurrent = confirmed.filter(d => d.recurrence === 'MONTHLY');
  const recurrentMonthly = recurrent.reduce((s, d) => s + d.amount, 0);

  const byMethod = METHODS.map(method => ({
    method, count: confirmed.filter(d => d.method === method).length,
    amount: confirmed.filter(d => d.method === method).reduce((s, d) => s + d.amount, 0),
  })).filter(m => m.count > 0);

  const byRecurrence = (['SINGLE', 'MONTHLY', 'QUARTERLY', 'ANNUAL'] as RecurrenceType[]).map(type => ({
    type, count: confirmed.filter(d => d.recurrence === type).length,
    amount: confirmed.filter(d => d.recurrence === type).reduce((s, d) => s + d.amount, 0),
  })).filter(r => r.count > 0);

  const monthly: { [key: string]: { received: number; donors: Set<string>; recurrent: number; oneTime: number } } = {};
  confirmed.forEach(d => {
    const dt = new Date(d.createdAt);
    const key = MONTHS[dt.getMonth()];
    if (!monthly[key]) monthly[key] = { received: 0, donors: new Set(), recurrent: 0, oneTime: 0 };
    monthly[key].received += d.amount;
    monthly[key].donors.add(d.donor.id);
    if (d.recurrence !== 'SINGLE') monthly[key].recurrent += d.amount;
    else monthly[key].oneTime += d.amount;
  });

  const monthlyBreakdown = MONTHS.slice(0, 6).map(month => ({
    month,
    received: Math.round(monthly[month]?.received ?? 0),
    donors: monthly[month]?.donors.size ?? 0,
    recurrent: Math.round(monthly[month]?.recurrent ?? 0),
    oneTime: Math.round(monthly[month]?.oneTime ?? 0),
  }));

  const campaignMap: { [k: string]: { amount: number; donors: Set<string> } } = {};
  confirmed.forEach(d => {
    const c = d.campaignName ?? 'Geral';
    if (!campaignMap[c]) campaignMap[c] = { amount: 0, donors: new Set() };
    campaignMap[c].amount += d.amount;
    campaignMap[c].donors.add(d.donor.id);
  });

  return {
    totalReceived: Math.round(total),
    totalReceived30d: Math.round(total30d),
    totalReceived12m: Math.round(total12m),
    recurrentMonthly: Math.round(recurrentMonthly),
    averageDonation: confirmed.length ? Math.round(total / confirmed.length) : 0,
    donorCount: new Set(confirmed.map(d => d.donor.id)).size,
    newDonors30d: 12,
    pendingAmount: Math.round(donations.filter(d => d.status === 'PENDING').reduce((s, d) => s + d.amount, 0)),
    projectedNextMonth: Math.round(recurrentMonthly * 1.08),
    goalAmount: 2000000,
    goalProgress: 62.4,
    monthlyBreakdown,
    byMethod,
    byRecurrence,
    topCampaigns: Object.entries(campaignMap)
      .map(([name, v]) => ({ name, amount: Math.round(v.amount), donors: v.donors.size }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
  };
};

// ── EXPORTED SERVICES ───────────────────────────────────────────
export const FinancialService = {
  getSummary: async (): Promise<FinancialSummary> => {
    await delay(700);
    return buildSummary(MOCK_DONATIONS);
  },

  getDonations: async (filters?: {
    status?: string; method?: string; search?: string;
    dateFrom?: string; dateTo?: string; page?: number;
  }): Promise<{ data: Donation[]; total: number }> => {
    await delay(500);
    let data = [...MOCK_DONATIONS];
    if (filters?.status) data = data.filter(d => d.status === filters.status);
    if (filters?.method) data = data.filter(d => d.method === filters.method);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(d => d.donor.name.toLowerCase().includes(q) || d.donor.email.toLowerCase().includes(q) || d.id.includes(q));
    }
    const page = filters?.page ?? 1;
    const perPage = 20;
    return { data: data.slice((page - 1) * perPage, page * perPage), total: data.length };
  },

  getDonors: async (filters?: { tier?: string; category?: string; search?: string; page?: number }): Promise<{ data: Donor[]; total: number }> => {
    await delay(500);
    let data = [...MOCK_DONORS];
    if (filters?.tier) data = data.filter(d => d.tier === filters.tier);
    if (filters?.category) data = data.filter(d => d.category === filters.category);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(d => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q));
    }
    const page = filters?.page ?? 1;
    const perPage = 15;
    return { data: data.slice((page - 1) * perPage, page * perPage), total: data.length };
  },

  getDonorById: async (id: string): Promise<Donor | null> => {
    await delay(300);
    return MOCK_DONORS.find(d => d.id === id) ?? null;
  },

  getDonorDonations: async (donorId: string): Promise<Donation[]> => {
    await delay(400);
    return MOCK_DONATIONS.filter(d => d.donor.id === donorId);
  },

  getBankConnections: async (): Promise<BankConnection[]> => {
    await delay(600);
    return MOCK_BANK_CONNECTIONS;
  },

  connectBank: async (payload: { bankCode: string; provider: string; apiKey: string }): Promise<BankConnection> => {
    await delay(1500); // Simula handshake com API bancária
    const bankNames: Record<string, string> = { '001': 'Banco do Brasil', '341': 'Itaú Unibanco', '237': 'Bradesco', '033': 'Santander', '104': 'Caixa Econômica', '260': 'Nubank' };
    return {
      id: `bank-${Date.now()}`,
      bankName: bankNames[payload.bankCode] ?? `Banco ${payload.bankCode}`,
      bankCode: payload.bankCode,
      accountName: 'Instituto Ser Melhor',
      accountNumber: '—',
      agency: '—',
      accountType: 'CHECKING',
      status: 'PENDING',
      provider: payload.provider as any,
      createdAt: new Date().toISOString(),
    };
  },

  syncBank: async (bankId: string): Promise<{ synced: number; balance: number }> => {
    await delay(2000);
    const conn = MOCK_BANK_CONNECTIONS.find(b => b.id === bankId);
    return { synced: rand(5, 30), balance: conn?.balance ?? 0 };
  },

  getTransactions: async (bankId?: string): Promise<BankTransaction[]> => {
    await delay(500);
    const txs = generateTransactions();
    return bankId ? txs.filter(t => t.bankConnectionId === bankId) : txs;
  },

  getGoals: async (): Promise<FinancialGoal[]> => {
    await delay(300);
    return MOCK_GOALS;
  },

  exportReport: async (format: 'CSV' | 'PDF' | 'XLSX'): Promise<{ url: string }> => {
    await delay(1200);
    return { url: `#report-${format}-${Date.now()}` };
  },
};
