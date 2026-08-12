/**
 * campaignGoalsService.ts — E004: Painel Público de Metas e Termômetro de Captação em Tempo Real
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Compila campanhas ativas, metas de captação e progresso de arrecadação do Instituto Ser Melhor.
 * Coleção Firestore: 'donation_campaigns' com fallback resiliente para dev.
 */

export interface CampaignGoal {
  id: string;
  title: string;
  description: string;
  pillar: 'Educação' | 'Social' | 'Meio Ambiente' | 'Cultura' | 'Geral';
  targetAmount: number;
  raisedAmount: number;
  donorsCount: number;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  badgeLabel?: string;
}

const FALLBACK_CAMPAIGNS: CampaignGoal[] = [
  {
    id: 'camp-001',
    title: 'Meta 2025 — Educação para Todos',
    description: 'Expansão dos laboratórios digitais e bolsas de estudo para 12.000 jovens em regiões de alta vulnerabilidade.',
    pillar: 'Educação',
    targetAmount: 5000000,
    raisedAmount: 3850000,
    donorsCount: 892,
    endDate: '2025-12-31',
    status: 'ACTIVE',
    badgeLabel: '🔥 Principal Meta 2025',
  },
  {
    id: 'camp-002',
    title: 'Projeto AURA — Bem-Estar & Assistência Social',
    description: 'Atendimento emergencial e distribuição de cestas agroecológicas para 3.500 famílias vulneráveis.',
    pillar: 'Social',
    targetAmount: 4000000,
    raisedAmount: 2940000,
    donorsCount: 651,
    endDate: '2025-10-31',
    status: 'ACTIVE',
    badgeLabel: '🌱 Impacto Social',
  },
  {
    id: 'camp-003',
    title: 'Fundo Verde — Restauração Florestal',
    description: 'Plantio de 120.000 mudas nativas da Mata Atlântica e recuperação de nascentes degradadas.',
    pillar: 'Meio Ambiente',
    targetAmount: 2500000,
    raisedAmount: 2580000,
    donorsCount: 437,
    endDate: '2025-08-31',
    status: 'COMPLETED',
    badgeLabel: '🎉 Meta Atingida!',
  },
  {
    id: 'camp-004',
    title: 'Cultura Viva — Arte e Inclusão Comunitária',
    description: 'Oficinas de música, teatro e artes plásticas para crianças e adolescentes em centros comunitários.',
    pillar: 'Cultura',
    targetAmount: 1500000,
    raisedAmount: 930000,
    donorsCount: 218,
    endDate: '2025-11-30',
    status: 'ACTIVE',
  },
];

export const CampaignGoalsService = {
  /** Busca todas as campanhas de captação ativas e concluídas do Firestore.
   *  NC-014/021: fundraising_campaigns agora gerenciada pelo painel admin.
   *  Fallback resiliente: se a coleção estiver vazia ou inacessível, usa os dados de exemplo.
   */
  async getCampaigns(): Promise<CampaignGoal[]> {
    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const q = query(
        collection(db, 'fundraising_campaigns'),
        where('status', '!=', 'ARCHIVED'),
        orderBy('status'),
        orderBy('endDate', 'asc')
      );
      const snap = await getDocs(q);
      if (snap.empty) return FALLBACK_CAMPAIGNS;
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as CampaignGoal));
    } catch (err) {
      console.warn('[CampaignGoalsService] Firestore indisponível, usando fallback:', err);
      return FALLBACK_CAMPAIGNS;
    }
  },


  /** Calcula percentual atingido (0–100%+) */
  calculateProgressPct(raised: number, target: number): number {
    if (target <= 0) return 0;
    const pct = (raised / target) * 100;
    return Number(pct.toFixed(1));
  },

  /** Calcula dias restantes até o encerramento da campanha */
  calculateDaysRemaining(endDateStr: string): number {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 3600 * 24));
    return Math.max(0, diffDays);
  },
};
