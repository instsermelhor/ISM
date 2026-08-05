/**
 * DonorSubscriptionPortalModal.tsx — E003: Portal do Doador Recorrente & Gestão de Assinaturas
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Modal para gestão de doações recorrentes mensais, alteração de valores, pausa,
 * cancelamento e histórico com recibos em 1 clique.
 */

import React, { useState, useEffect } from 'react';
import {
  Heart, RefreshCcw, PauseCircle, PlayCircle, XCircle, CheckCircle2,
  Calendar, CreditCard, ShieldCheck, Download, Edit2, Check, X, Search, FileText
} from 'lucide-react';
import {
  RecurringDonationService,
  type RecurringSubscription,
  type SubscriptionHistoryItem,
} from '../../services/recurringDonationService';
import { ReceiptGeneratorService } from '../../services/receiptGeneratorService';

interface DonorSubscriptionPortalModalProps {
  initialEmail?: string;
  onClose: () => void;
}

export const DonorSubscriptionPortalModal: React.FC<DonorSubscriptionPortalModalProps> = ({ initialEmail = '', onClose }) => {
  const [email, setEmail] = useState(initialEmail);
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>([]);
  const [selectedSub, setSelectedSub] = useState<RecurringSubscription | null>(null);
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState<number>(100);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchSubscriptions = async (searchEmail: string) => {
    if (!searchEmail.trim()) return;
    setLoading(true);
    try {
      const subs = await RecurringDonationService.getSubscriptionsByEmail(searchEmail);
      setSubscriptions(subs);
      if (subs.length > 0) {
        setSelectedSub(subs[0]);
        setNewAmount(subs[0].amount);
        const hist = await RecurringDonationService.getSubscriptionHistory(subs[0].id);
        setHistory(hist);
      } else {
        setSelectedSub(null);
        setHistory([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEmail) {
      fetchSubscriptions(initialEmail);
    }
  }, [initialEmail]);

  const handleUpdateAmount = async () => {
    if (!selectedSub || newAmount <= 0) return;
    const ok = await RecurringDonationService.updateAmount(selectedSub.id, newAmount);
    if (ok) {
      setSelectedSub(prev => prev ? { ...prev, amount: newAmount } : null);
      setIsEditingAmount(false);
      setActionSuccessMessage(`Valor mensal atualizado para R$ ${newAmount},00 com sucesso!`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    }
  };

  const handleTogglePause = async () => {
    if (!selectedSub) return;
    if (selectedSub.status === 'ACTIVE') {
      const ok = await RecurringDonationService.pauseSubscription(selectedSub.id);
      if (ok) {
        setSelectedSub(prev => prev ? { ...prev, status: 'PAUSED' } : null);
        setActionSuccessMessage('Sua doação recorrente foi pausada temporariamente.');
      }
    } else if (selectedSub.status === 'PAUSED') {
      const ok = await RecurringDonationService.resumeSubscription(selectedSub.id);
      if (ok) {
        setSelectedSub(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
        setActionSuccessMessage('Sua doação recorrente foi reativada com sucesso!');
      }
    }
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleCancel = async () => {
    if (!selectedSub) return;
    if (window.confirm('Tem certeza de que deseja cancelar sua doação recorrente mensal?')) {
      const ok = await RecurringDonationService.cancelSubscription(selectedSub.id);
      if (ok) {
        setSelectedSub(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
        setActionSuccessMessage('Sua assinatura foi cancelada. Agradecemos imensamente seu apoio!');
        setTimeout(() => setActionSuccessMessage(null), 4000);
      }
    }
  };

  const handleDownloadPastReceipt = (item: SubscriptionHistoryItem) => {
    if (!selectedSub) return;
    const rData = ReceiptGeneratorService.buildReceiptData({
      transactionId: item.receiptId,
      donorName: selectedSub.donorName,
      donorEmail: selectedSub.donorEmail,
      amount: item.amount,
      frequency: selectedSub.frequency === 'MONTHLY' ? 'Mensal' : 'Anual',
      pillar: selectedSub.pillar,
      paymentMethod: item.paymentMethod,
    });
    ReceiptGeneratorService.printReceiptWindow(rData);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-modal-title"
    >
      <div
        style={{
          background: 'white', borderRadius: 24, maxWidth: 640, width: '100%',
          padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative',
          fontFamily: 'Inter, system-ui, sans-serif', color: '#111827', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20, background: '#f3f4f6',
            border: 'none', borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#6b7280',
          }}
          aria-label="Fechar portal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Heart size={24} color="#16a34a" fill="#16a34a" />
            <h2 id="portal-modal-title" style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>
              Portal do Doador Recorrente
            </h2>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
            Gerencie sua assinatura mensal, altere o valor ou acesse seus recibos de impacto.
          </p>
        </div>

        {/* Email Search Box */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              placeholder="Digite seu e-mail de doador..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchSubscriptions(email)}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #d1d5db',
                fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={() => fetchSubscriptions(email)}
              disabled={loading}
              style={{
                padding: '10px 18px', background: '#16a34a', color: 'white', fontWeight: 700,
                borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Search size={15} /> {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionSuccessMessage && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 12, color: '#166534', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            ✅ {actionSuccessMessage}
          </div>
        )}

        {/* Subscription Found Card */}
        {selectedSub ? (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #052e16 0%, #166534 100%)',
              borderRadius: 16, padding: 24, color: 'white', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1 }}>
                    SUA ASSINATURA RECORRENTE
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginTop: 2 }}>
                    Pilar: {selectedSub.pillar}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 20,
                  background: selectedSub.status === 'ACTIVE' ? '#4ade80' : selectedSub.status === 'PAUSED' ? '#f59e0b' : '#ef4444',
                  color: selectedSub.status === 'ACTIVE' ? '#052e16' : 'white',
                  textTransform: 'uppercase',
                }}>
                  {selectedSub.status === 'ACTIVE' ? '● Ativa' : selectedSub.status === 'PAUSED' ? '❚❚ Pausada' : '✕ Cancelada'}
                </span>
              </div>

              {/* Amount Display or Edit */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#86efac' }}>Valor Mensal Contribuído:</div>
                {isEditingAmount ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#4ade80' }}>R$</span>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={e => setNewAmount(Number(e.target.value))}
                      style={{ width: 100, padding: '4px 8px', borderRadius: 8, fontSize: 18, fontWeight: 900, color: '#111827' }}
                    />
                    <button onClick={handleUpdateAmount} style={{ background: '#4ade80', color: '#052e16', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 800, cursor: 'pointer', fontSize: 11 }}>
                      Salvar
                    </button>
                    <button onClick={() => setIsEditingAmount(false)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 11, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace' }}>
                      R$ {selectedSub.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    {selectedSub.status === 'ACTIVE' && (
                      <button
                        onClick={() => setIsEditingAmount(true)}
                        style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#86efac', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Edit2 size={12} /> Alterar valor
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sub details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11, color: '#bbf7d0', pt: 12, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <div>🗓️ Próxima Cobrança: <strong style={{ color: 'white' }}>{new Date(selectedSub.nextBillingDate).toLocaleDateString('pt-BR')}</strong></div>
                <div>🌱 Total Doado: <strong style={{ color: '#4ade80' }}>R$ {selectedSub.totalDonatedSoFar.toLocaleString('pt-BR')}</strong></div>
              </div>
            </div>

            {/* Action Buttons (Pause / Resume / Cancel) */}
            {selectedSub.status !== 'CANCELLED' && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                <button
                  onClick={handleTogglePause}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #d1d5db',
                    background: '#f9fafb', color: '#374151', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {selectedSub.status === 'ACTIVE' ? <PauseCircle size={15} color="#d97706" /> : <PlayCircle size={15} color="#16a34a" />}
                  {selectedSub.status === 'ACTIVE' ? 'Pausar Doação' : 'Reativar Doação'}
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '10px 14px', borderRadius: 12, border: '1px solid #fecaca',
                    background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <XCircle size={15} /> Cancelar Assinatura
                </button>
              </div>
            )}

            {/* Past Billing History */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 12 }}>
                Histórico de Cobranças &amp; Recibos
              </h3>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                {history.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: 'white',
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: '#111827' }}>R$ {item.amount.toFixed(2)}</span>
                      <span style={{ color: '#6b7280', marginLeft: 8 }}>{item.date}</span>
                    </div>
                    <button
                      onClick={() => handleDownloadPastReceipt(item)}
                      style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
                        padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <FileText size={12} /> Recibo PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          !loading && email && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6b7280' }}>
              <Heart size={36} color="#d1d5db" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, margin: 0 }}>Nenhuma assinatura encontrada para <strong>{email}</strong>.</p>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                Faça uma doação mensal no formulário do site para ativar sua recorrência.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
