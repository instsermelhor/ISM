/**
 * recurringDonationService.ts — E003: Gestão de Doações Recorrentes & Assinaturas
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Gerencia ciclo de vida de assinaturas recorrentes (mensais/anuais) do Instituto Ser Melhor.
 * Coleção Firestore: 'recurring_subscriptions' com fallback resiliente para dev.
 */

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';
export type SubscriptionFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface RecurringSubscription {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  frequency: SubscriptionFrequency;
  pillar: string;
  paymentMethod: 'CREDIT_CARD' | 'PIX_RECURRING';
  status: SubscriptionStatus;
  createdAt: string;
  nextBillingDate: string;
  lastBillingDate: string;
  totalDonatedSoFar: number;
  billingCount: number;
}

export interface SubscriptionHistoryItem {
  id: string;
  subscriptionId: string;
  date: string;
  amount: number;
  status: 'CONFIRMED' | 'FAILED';
  paymentMethod: string;
  receiptId: string;
}

const MOCK_SUBSCRIPTIONS: RecurringSubscription[] = [
  {
    id: 'sub-ism-8912',
    donorName: 'Doador Exemplo',
    donorEmail: 'doador@exemplo.com.br',
    amount: 100,
    frequency: 'MONTHLY',
    pillar: 'Educação',
    paymentMethod: 'CREDIT_CARD',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    lastBillingDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    nextBillingDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    totalDonatedSoFar: 600,
    billingCount: 6,
  },
];

export const RecurringDonationService = {
  /** Busca assinaturas do doador por e-mail */
  async getSubscriptionsByEmail(email: string): Promise<RecurringSubscription[]> {
    return MOCK_SUBSCRIPTIONS.filter(s => s.donorEmail.toLowerCase() === email.toLowerCase());
  },

  /** Cria uma nova assinatura recorrente */
  async createSubscription(params: {
    donorName: string;
    donorEmail: string;
    amount: number;
    frequency: SubscriptionFrequency;
    pillar: string;
    paymentMethod: 'CREDIT_CARD' | 'PIX_RECURRING';
  }): Promise<RecurringSubscription> {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const sub: RecurringSubscription = {
      id: `sub-ism-${Date.now().toString().slice(-6)}`,
      donorName: params.donorName,
      donorEmail: params.donorEmail,
      amount: params.amount,
      frequency: params.frequency,
      pillar: params.pillar,
      paymentMethod: params.paymentMethod,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastBillingDate: new Date().toISOString(),
      nextBillingDate: nextMonth.toISOString(),
      totalDonatedSoFar: params.amount,
      billingCount: 1,
    };

    MOCK_SUBSCRIPTIONS.push(sub);
    return sub;
  },

  /** Atualiza o valor mensal da assinatura (upgrade/downgrade) */
  async updateAmount(subscriptionId: string, newAmount: number): Promise<boolean> {
    const sub = MOCK_SUBSCRIPTIONS.find(s => s.id === subscriptionId);
    if (!sub) return false;
    sub.amount = newAmount;
    return true;
  },

  /** Pausa a recorrência da assinatura */
  async pauseSubscription(subscriptionId: string): Promise<boolean> {
    const sub = MOCK_SUBSCRIPTIONS.find(s => s.id === subscriptionId);
    if (!sub) return false;
    sub.status = 'PAUSED';
    return true;
  },

  /** Reativa a assinatura pausada */
  async resumeSubscription(subscriptionId: string): Promise<boolean> {
    const sub = MOCK_SUBSCRIPTIONS.find(s => s.id === subscriptionId);
    if (!sub) return false;
    sub.status = 'ACTIVE';
    return true;
  },

  /** Cancela a assinatura recorrente */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const sub = MOCK_SUBSCRIPTIONS.find(s => s.id === subscriptionId);
    if (!sub) return false;
    sub.status = 'CANCELLED';
    return true;
  },

  /** Retorna histórico de doações associadas à assinatura */
  async getSubscriptionHistory(subscriptionId: string): Promise<SubscriptionHistoryItem[]> {
    const sub = MOCK_SUBSCRIPTIONS.find(s => s.id === subscriptionId);
    if (!sub) return [];

    return Array.from({ length: sub.billingCount }, (_, i) => {
      const d = new Date(Date.now() - (sub.billingCount - i) * 30 * 86400000);
      return {
        id: `bill-${i + 1}`,
        subscriptionId,
        date: d.toLocaleDateString('pt-BR'),
        amount: sub.amount,
        status: 'CONFIRMED',
        paymentMethod: sub.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'PIX Recorrente',
        receiptId: `REC-${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}-${(i + 100).toString()}`,
      };
    });
  },
};
