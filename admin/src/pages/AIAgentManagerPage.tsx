/**
 * AIAgentManagerPage.tsx — D001: Gestão & Logs do Agente IA (Admin)
 * ───────────────────────────────────────────────────────────────
 * Painel administrativo para monitorar atendimentos do assistente de IA,
 * revisar tópicos da base de conhecimento e acompanhar perguntas dos usuários.
 *
 * Coleção Firestore: ai_conversations
 */

import React, { useState, useEffect } from 'react';
import {
  Bot, Sparkles, MessageSquare, ShieldCheck, Activity, Search,
  RefreshCw, CheckCircle, HelpCircle, Layers, FileText, Database
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AIConversationLog {
  id: string;
  userMessage: string;
  assistantReply: string;
  timestamp?: any;
  source?: string;
}

export const AIAgentManagerPage: React.FC = () => {
  const [logs, setLogs] = useState<AIConversationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'ai_conversations'), orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AIConversationLog));
      setLogs(items);
    } catch {
      // Fallback em caso de Firestore local
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const filteredLogs = logs.filter(l =>
    !search ||
    l.userMessage.toLowerCase().includes(search.toLowerCase()) ||
    l.assistantReply.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bot size={26} color="#16a34a" />
            Agente IA &amp; Logs de Atendimento
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Monitore o assistente conversacional do site público e revise o histórico de atendimento.
          </p>
        </div>
        <button
          onClick={loadLogs}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', background: '#16a34a', color: 'white',
            fontWeight: 800, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13,
          }}
        >
          <RefreshCw size={15} /> Atualizar Logs
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Status do Agente', value: 'Ativo ⚡', desc: 'Atendimento 24/7', color: '#16a34a', icon: Activity },
          { label: 'Base de Conhecimento', value: 'V1.0 Auditada', desc: 'Dados Oficiais ISM', color: '#2563eb', icon: Database },
          { label: 'Chave Pix Conhecida', value: '09.040.440/0001-47', desc: 'PIX CNPJ Validado', color: '#d97706', icon: CheckCircle },
          { label: 'SROI Referência', value: 'R$ 4,83x', desc: 'Retorno Social 2024', color: '#059669', icon: Sparkles },
        ].map(item => (
          <div key={item.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Topics Summary */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#374151', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={16} color="#6b7280" /> Tópicos Institucionais Mapeados na IA
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: '⚡ Doações & PIX', detail: 'CNPJ 09.040.440/0001-47, Banco do Brasil, Boleto e Cartão' },
            { title: '📊 Razão SROI', detail: 'R$ 4,83 por R$ 1,00 investido + Metodologia Auditada' },
            { title: '🌿 Projeto AURA & Pilares', detail: 'Saúde Mental, Educação, Biomas e Cultura' },
            { title: '📄 Transparência & Governança', detail: 'Demonstrativos auditados e conselho deliberativo' },
          ].map(t => (
            <div key={t.title} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
              <strong style={{ fontSize: 12, color: '#111827', display: 'block', marginBottom: 4 }}>{t.title}</strong>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.4 }}>{t.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#374151', margin: 0 }}>Histórico de Atendimentos Recentes</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8, padding: '4px 10px', width: 220 }}>
            <Search size={14} color="#9ca3af" />
            <input
              type="text"
              placeholder="Filtrar conversas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, width: '100%' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            <RefreshCw size={24} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
            Carregando histórico...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center', color: '#9ca3af' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
            <p style={{ fontWeight: 700, margin: 0 }}>Nenhum atendimento registrado ainda</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>As conversas do assistente virtual no site aparecerão aqui em tempo real.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Mensagem do Usuário</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Resposta do Agente IA</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 14px', verticalAlign: 'top', width: '40%' }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{l.userMessage}</div>
                  </td>
                  <td style={{ padding: '12px 14px', verticalAlign: 'top', color: '#374151', fontSize: 12, lineHeight: 1.5 }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{l.assistantReply}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
