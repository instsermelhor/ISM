/**
 * atuacaoMapService.ts — G001: Dados do Mapa Interativo de Atuação
 * ──────────────────────────────────────────────────────────────────
 * Registra todos os municípios onde o Instituto Ser Melhor atua,
 * organizados por estado, pilar de impacto e indicadores de resultado.
 *
 * Coordenadas SVG pré-calculadas para um ViewBox de 800×900
 * representando o território brasileiro (projeção equirretangular simplificada).
 */

export type ImpactPillar = 'SOCIAL' | 'AMBIENTAL' | 'EDUCACAO' | 'CULTURAL';

export interface Municipality {
  id: string;
  name: string;
  state: string;
  stateAbbr: string;
  region: 'NORTE' | 'NORDESTE' | 'CENTRO_OESTE' | 'SUDESTE' | 'SUL';
  pillars: ImpactPillar[];
  primaryPillar: ImpactPillar;
  beneficiaries: number;
  projects: number;
  sroi: number;           // Multiplicador SROI (ex: 4.2 = R$4,20 por R$1)
  since: number;          // Ano de início das atividades
  highlights: string[];   // Destaques do trabalho neste município
  svgX: number;           // Coordenada X no SVG 800×900
  svgY: number;           // Coordenada Y no SVG 800×900
}

export const PILLAR_CONFIG: Record<ImpactPillar, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  SOCIAL: {
    label: 'Social',
    color: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.15)',
    borderColor: 'rgba(59,130,246,0.4)',
    description: 'Desenvolvimento social e psicossocial comunitário',
  },
  AMBIENTAL: {
    label: 'Ambiental',
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.15)',
    borderColor: 'rgba(34,197,94,0.4)',
    description: 'Sustentabilidade, conservação e educação ambiental',
  },
  EDUCACAO: {
    label: 'Educação',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.4)',
    description: 'Educação inclusiva, capacitação e alfabetização',
  },
  CULTURAL: {
    label: 'Cultural',
    color: '#a855f7',
    bgColor: 'rgba(168,85,247,0.15)',
    borderColor: 'rgba(168,85,247,0.4)',
    description: 'Arte, cultura, identidade e patrimônio imaterial',
  },
};

// ── Municípios de Atuação ─────────────────────────────────────────────────────

export const MUNICIPALITIES: Municipality[] = [
  {
    id: 'manaus-am',
    name: 'Manaus',
    state: 'Amazonas',
    stateAbbr: 'AM',
    region: 'NORTE',
    pillars: ['AMBIENTAL', 'SOCIAL'],
    primaryPillar: 'AMBIENTAL',
    beneficiaries: 4800,
    projects: 6,
    sroi: 4.8,
    since: 2012,
    highlights: [
      'Projeto Floresta Viva — recuperação de 1.200 ha de floresta nativa',
      'Programa de geração de renda para populações ribeirinhas',
      'Formação de agentes ambientais comunitários',
    ],
    svgX: 218,
    svgY: 195,
  },
  {
    id: 'belem-pa',
    name: 'Belém',
    state: 'Pará',
    stateAbbr: 'PA',
    region: 'NORTE',
    pillars: ['AMBIENTAL', 'EDUCACAO'],
    primaryPillar: 'AMBIENTAL',
    beneficiaries: 3200,
    projects: 4,
    sroi: 4.1,
    since: 2015,
    highlights: [
      'Educação ambiental em comunidades quilombolas',
      'Projeto Mangue Vivo — preservação de manguezais da Baía de Guajará',
      'Alfabetização digital para jovens de comunidades vulneráveis',
    ],
    svgX: 518,
    svgY: 165,
  },
  {
    id: 'fortaleza-ce',
    name: 'Fortaleza',
    state: 'Ceará',
    stateAbbr: 'CE',
    region: 'NORDESTE',
    pillars: ['SOCIAL', 'EDUCACAO'],
    primaryPillar: 'SOCIAL',
    beneficiaries: 6100,
    projects: 8,
    sroi: 4.5,
    since: 2009,
    highlights: [
      'Centro de Referência em Assistência Social — 3.200 famílias atendidas',
      'Escola de Ofícios — 800 jovens formados em capacitação profissional',
      'Programa de apoio psicossocial pós-pandemia',
    ],
    svgX: 713,
    svgY: 248,
  },
  {
    id: 'natal-rn',
    name: 'Natal',
    state: 'Rio Grande do Norte',
    stateAbbr: 'RN',
    region: 'NORDESTE',
    pillars: ['EDUCACAO', 'CULTURAL'],
    primaryPillar: 'EDUCACAO',
    beneficiaries: 2400,
    projects: 3,
    sroi: 3.9,
    since: 2017,
    highlights: [
      'Programa Leitura Transforma — 1.200 crianças beneficiadas',
      'Biblioteca Comunitária Itinerante em 12 bairros periféricos',
      'Festival de Cultura Popular — patrimônio imaterial potiguar',
    ],
    svgX: 762,
    svgY: 290,
  },
  {
    id: 'recife-pe',
    name: 'Recife',
    state: 'Pernambuco',
    stateAbbr: 'PE',
    region: 'NORDESTE',
    pillars: ['CULTURAL', 'SOCIAL'],
    primaryPillar: 'CULTURAL',
    beneficiaries: 5200,
    projects: 7,
    sroi: 4.2,
    since: 2010,
    highlights: [
      'Instituto de Arte e Cultura do Recife — 2.400 artistas apoiados',
      'Projeto Frevo Vivo — preservação do patrimônio imaterial pernambucano',
      'Centro de Convivência para idosos em comunidades vulneráveis',
    ],
    svgX: 778,
    svgY: 338,
  },
  {
    id: 'salvador-ba',
    name: 'Salvador',
    state: 'Bahia',
    stateAbbr: 'BA',
    region: 'NORDESTE',
    pillars: ['CULTURAL', 'EDUCACAO', 'SOCIAL'],
    primaryPillar: 'CULTURAL',
    beneficiaries: 7400,
    projects: 9,
    sroi: 4.6,
    since: 2008,
    highlights: [
      'Centro Afro-Cultural — valorização da identidade afro-brasileira',
      'Escola de Capoeira Angola — patrimônio da UNESCO',
      'Programa de renda complementar para artistas da periferia',
    ],
    svgX: 704,
    svgY: 445,
  },
  {
    id: 'goiania-go',
    name: 'Goiânia',
    state: 'Goiás',
    stateAbbr: 'GO',
    region: 'CENTRO_OESTE',
    pillars: ['AMBIENTAL', 'SOCIAL'],
    primaryPillar: 'AMBIENTAL',
    beneficiaries: 3800,
    projects: 5,
    sroi: 4.0,
    since: 2014,
    highlights: [
      'Cerrado em Pé — conservação do bioma Cerrado com comunidades locais',
      'Hortas comunitárias urbanas em 8 bairros periféricos',
      'Capacitação em agroecologia para agricultores familiares',
    ],
    svgX: 498,
    svgY: 528,
  },
  {
    id: 'belo-horizonte-mg',
    name: 'Belo Horizonte',
    state: 'Minas Gerais',
    stateAbbr: 'MG',
    region: 'SUDESTE',
    pillars: ['SOCIAL', 'EDUCACAO'],
    primaryPillar: 'SOCIAL',
    beneficiaries: 8200,
    projects: 11,
    sroi: 4.7,
    since: 2007,
    highlights: [
      'Primeira sede do Instituto — berço de todos os programas',
      'Centro de Referência em Desenvolvimento Humano Integral',
      'Programa Escola Família Comunidade — 4.100 famílias',
    ],
    svgX: 598,
    svgY: 598,
  },
  {
    id: 'sao-paulo-sp',
    name: 'São Paulo',
    state: 'São Paulo',
    stateAbbr: 'SP',
    region: 'SUDESTE',
    pillars: ['SOCIAL', 'EDUCACAO', 'CULTURAL'],
    primaryPillar: 'SOCIAL',
    beneficiaries: 9100,
    projects: 13,
    sroi: 4.9,
    since: 2009,
    highlights: [
      'Centro de Triagem Social — 2.800 pessoas em situação de rua atendidas',
      'Escola Maker — capacitação em tecnologia e empreendedorismo',
      'Festival das Periferias — 18 bairros, 5.000 participantes',
    ],
    svgX: 545,
    svgY: 668,
  },
  {
    id: 'rio-de-janeiro-rj',
    name: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    stateAbbr: 'RJ',
    region: 'SUDESTE',
    pillars: ['CULTURAL', 'SOCIAL'],
    primaryPillar: 'CULTURAL',
    beneficiaries: 6800,
    projects: 9,
    sroi: 4.3,
    since: 2011,
    highlights: [
      'Projeto Morro em Foco — documentários comunitários em favelas',
      'Centro de Artes Afro-Cariocas — 1.200 artistas residentes',
      'Programa de reinserção social para egressos do sistema penal',
    ],
    svgX: 628,
    svgY: 668,
  },
  {
    id: 'curitiba-pr',
    name: 'Curitiba',
    state: 'Paraná',
    stateAbbr: 'PR',
    region: 'SUL',
    pillars: ['AMBIENTAL', 'EDUCACAO'],
    primaryPillar: 'AMBIENTAL',
    beneficiaries: 4100,
    projects: 6,
    sroi: 4.2,
    since: 2013,
    highlights: [
      'Programa Cidade Verde — arborização participativa em 15 bairros',
      'Educação ambiental nas escolas públicas — 12.000 alunos',
      'Compostagem comunitária e agricultura urbana orgânica',
    ],
    svgX: 506,
    svgY: 735,
  },
  {
    id: 'porto-alegre-rs',
    name: 'Porto Alegre',
    state: 'Rio Grande do Sul',
    stateAbbr: 'RS',
    region: 'SUL',
    pillars: ['EDUCACAO', 'SOCIAL'],
    primaryPillar: 'EDUCACAO',
    beneficiaries: 3600,
    projects: 5,
    sroi: 4.0,
    since: 2016,
    highlights: [
      'Escola de Futuro — capacitação profissional para jovens de 16 a 24 anos',
      'Programa de combate ao abandono escolar — 94% de retenção',
      'Centro de Apoio à Terceira Idade — 800 idosos atendidos/mês',
    ],
    svgX: 470,
    svgY: 828,
  },
];

// ── Serviço ───────────────────────────────────────────────────────────────────

export const AtuacaoMapService = {

  /** Retorna todos os municípios de forma síncrona (fallback) */
  getAll(): Municipality[] {
    return MUNICIPALITIES;
  },

  /** Retorna todos os municípios buscando do Firestore com fallback para lista padrão (NC-013) */
  async getAllAsync(): Promise<Municipality[]> {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const q = query(collection(db, 'atuacao_map'), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      if (snap.empty) return MUNICIPALITIES;
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Municipality));
    } catch (err) {
      console.warn('[AtuacaoMapService] Firestore indisponível, usando fallback:', err);
      return MUNICIPALITIES;
    }
  },


  /** Filtra por pilar de impacto */
  filterByPillar(pillar: ImpactPillar | 'ALL'): Municipality[] {
    if (pillar === 'ALL') return MUNICIPALITIES;
    return MUNICIPALITIES.filter((m) => m.pillars.includes(pillar));
  },

  /** Filtra por região geográfica */
  filterByRegion(region: Municipality['region'] | 'ALL'): Municipality[] {
    if (region === 'ALL') return MUNICIPALITIES;
    return MUNICIPALITIES.filter((m) => m.region === region);
  },

  /** Busca por nome ou estado */
  search(query: string): Municipality[] {
    const q = query.toLowerCase().trim();
    if (!q) return MUNICIPALITIES;
    return MUNICIPALITIES.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        m.stateAbbr.toLowerCase().includes(q)
    );
  },

  /** Estatísticas globais de atuação */
  getStats() {
    const total = MUNICIPALITIES;
    return {
      totalMunicipalities: total.length,
      totalStates: new Set(total.map((m) => m.stateAbbr)).size,
      totalBeneficiaries: total.reduce((acc, m) => acc + m.beneficiaries, 0),
      totalProjects: total.reduce((acc, m) => acc + m.projects, 0),
      avgSROI: parseFloat(
        (total.reduce((acc, m) => acc + m.sroi, 0) / total.length).toFixed(2)
      ),
      regions: [...new Set(total.map((m) => m.region))].length,
    };
  },

  /** Retorna o top-5 municípios por beneficiários */
  getTopByBeneficiaries(limit = 5): Municipality[] {
    return [...MUNICIPALITIES]
      .sort((a, b) => b.beneficiaries - a.beneficiaries)
      .slice(0, limit);
  },
};
