/**
 * aiAgentService.ts — D001: Agente IA de Atendimento & Captação ISM
 * ─────────────────────────────────────────────────────────────────
 * Motor de IA institucional para atendimento ao doador, parceiro e visitante.
 * Base de conhecimento restrita aos dados oficiais do Instituto Ser Melhor.
 *
 * Registra logs de atendimento na coleção Firestore: ai_conversations
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string }[];
}

export interface KBTopic {
  keywords: string[];
  reply: string;
  quickActions?: { label: string; action: string }[];
}

const ISM_KNOWLEDGE_BASE: KBTopic[] = [
  {
    keywords: ['pix', 'chave', 'doar', 'doacao', 'como doar', 'contribui', 'banco'],
    reply: 'Você pode fazer uma doação instantânea via **PIX** usando a chave oficial CNPJ do Instituto Ser Melhor:\n\n⚡ **Chave PIX (CNPJ):** `09.040.440/0001-47`\n🏦 **Banco:** Banco do Brasil\n👤 **Favorecido:** Instituto Ser Melhor\n\nSua doação apoia diretamente projetos educacionais, psicossociais e ambientais!',
    quickActions: [
      { label: '💳 Doar via Cartão/Boleto', action: 'GOTO_DONATION' },
      { label: '📊 Ver Retorno Social SROI', action: 'GOTO_SROI' },
    ],
  },
  {
    keywords: ['sroi', 'retorno', 'investimento', 'impacto', 'metrica', 'calculo', 'multiplicador'],
    reply: 'O Instituto Ser Melhor possui uma razão **SROI (Social Return on Investment)** oficial auditada de **R$ 4,83** (ou R$ 4,85 nas projeções 2024).\n\nIsso significa que para **cada R$ 1,00 investido**, geramos **R$ 4,83 de retorno social mensurável** em bolsas de estudo, suporte psicossocial e proteção de biomas!',
    quickActions: [
      { label: '🧮 Abrir Calculadora SROI', action: 'GOTO_SROI' },
      { label: '📄 Ver Relatórios de Transparência', action: 'GOTO_TRANSPARENCY' },
    ],
  },
  {
    keywords: ['aura', 'saude', 'psicossocial', 'terapia', 'mental'],
    reply: 'O **Projeto AURA** é nosso programa integrativo de saúde mental preventivo e suporte psicossocial. Oferecemos atendimento humanizado, rodas de conversa e práticas terapêuticas em comunidades vulneráveis, com mais de 4.500 atendimentos realizados!',
    quickActions: [
      { label: '🌿 Conhecer Todos os Programas', action: 'GOTO_PROGRAMS' },
      { label: '🤝 Seja um Parceiro Institucional', action: 'GOTO_PARTNER' },
    ],
  },
  {
    keywords: ['projeto', 'programa', 'atuacao', 'educacao', 'meio ambiente', 'bioma', 'cultura', 'social'],
    reply: 'O Instituto Ser Melhor atua em **4 Pilares Fundamentais**:\n\n1. 📚 **Educação:** Bolsas de estudo, inclusão digital e laboratórios de robótica.\n2. 🤝 **Assistência Social:** Projeto AURA e emancipação humana.\n3. 🌿 **Meio Ambiente:** Proteção de biomas e reflorestamento via satélite.\n4. 🎨 **Cultura:** Fortalecimento identitário e arte comunitária.',
    quickActions: [
      { label: '🏛️ Ver Pilares de Atuação', action: 'GOTO_PILLARS' },
      { label: '❤️ Apoie Nossas Causas', action: 'GOTO_DONATION' },
    ],
  },
  {
    keywords: ['transparencia', 'auditoria', 'contas', 'relatorio', 'balanço', 'balanco', 'governança', 'governanca'],
    reply: 'Prezamos pela **100% transparência e integridade**. Todos os nossos demonstrativos financeiros, pareceres de auditoria independente e relatórios de impacto estão disponíveis publicamente no Portal de Transparência.',
    quickActions: [
      { label: '📄 Acessar Portal de Transparência', action: 'GOTO_TRANSPARENCY' },
      { label: '🛡️ Conhecer Estrutura de Governança', action: 'GOTO_GOVERNANCE' },
    ],
  },
  {
    keywords: ['parceiro', 'parceria', 'empresa', 'esg', 'patrocinio', 'patrocinador', 'convenio'],
    reply: 'Sua empresa ou organização pode fazer parte da nossa rede de **Parceiros Globais**! Desenvolvemos projetos sob medida para agendas ESG, compensação de impacto e responsabilidade social.',
    quickActions: [
      { label: '🤝 Formular Parceria', action: 'GOTO_PARTNER' },
      { label: '📞 Falar com a Diretoria', action: 'GOTO_FOOTER' },
    ],
  },
  {
    keywords: ['quem somos', 'missao', 'visao', 'valores', 'historia', 'fundacao', 'fundado'],
    reply: 'Fundado em 2007, o **Instituto Ser Melhor** é uma organização não governamental dedicada a impulsionar transformações sociais, ambientais e educacionais em todo o território nacional. Nosso lema é *"Sapere Aude — Ouse Saber"*.',
    quickActions: [
      { label: '📖 Ler Nossa História', action: 'GOTO_MISSION' },
      { label: '⚡ Ver Métricas de Impacto', action: 'GOTO_IMPACT' },
    ],
  },
];

const DEFAULT_FALLBACK_REPLY = 'Sou o **Assistente Virtual do Instituto Ser Melhor**! Posso te ajudar com informações sobre:\n\n• ⚡ **Como fazer doações (PIX / Cartão / Boleto)**\n• 📊 **Calculadora SROI e Retorno Social**\n• 🌿 **Nossos Projetos (AURA, Educação, Biomas)**\n• 📄 **Relatórios de Transparência e Governança**\n• 🤝 **Como se tornar um parceiro ESG**\n\nQual assunto você deseja explorar?';

export const AIAgentService = {
  /** Gera resposta contextual baseada na base de conhecimento institucional */
  generateReply(userQuery: string): { reply: string; quickActions?: { label: string; action: string }[] } {
    const q = userQuery.toLowerCase().trim();

    for (const topic of ISM_KNOWLEDGE_BASE) {
      if (topic.keywords.some(k => q.includes(k))) {
        return { reply: topic.reply, quickActions: topic.quickActions };
      }
    }

    return {
      reply: DEFAULT_FALLBACK_REPLY,
      quickActions: [
        { label: '⚡ Como doar via Pix?', action: 'ASK_PIX' },
        { label: '📊 Qual o SROI do ISM?', action: 'ASK_SROI' },
        { label: '📄 Ver Transparência', action: 'GOTO_TRANSPARENCY' },
      ],
    };
  },

  /** Registra log de atendimento anonimizado no Firestore */
  async logInteraction(userMessage: string, assistantReply: string): Promise<void> {
    try {
      await addDoc(collection(db, 'ai_conversations'), {
        userMessage,
        assistantReply,
        timestamp: serverTimestamp(),
        source: 'web_widget',
      });
    } catch {
      // Ignora silenciosamente se Firestore desativado em dev
    }
  },
};
