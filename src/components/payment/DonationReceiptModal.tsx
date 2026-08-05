/**
 * DonationReceiptModal.tsx — E001: Componente de Recibo Oficial de Doação
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Modal/Painel para exibição do recibo oficial da doação, com botão de impressão/PDF
 * e resumo do valor de retorno social (SROI R$ 4,83x) gerado.
 */

import React from 'react';
import { Heart, Printer, CheckCircle, ShieldCheck, Download, X } from 'lucide-react';
import { ReceiptGeneratorService, type DonationReceiptData } from '../../services/receiptGeneratorService';

interface DonationReceiptModalProps {
  receiptData: DonationReceiptData;
  onClose: () => void;
}

export const DonationReceiptModal: React.FC<DonationReceiptModalProps> = ({ receiptData, onClose }) => {
  const handlePrint = () => {
    ReceiptGeneratorService.printReceiptWindow(receiptData);
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
      aria-labelledby="receipt-modal-title"
    >
      <div
        style={{
          background: 'white', borderRadius: 24, maxWidth: 560, width: '100%',
          padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative',
          fontFamily: 'Inter, system-ui, sans-serif', color: '#111827',
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
          aria-label="Fechar recibo"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlignment: 'center', textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 56, height: 56, background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '50%', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', color: '#16a34a', marginBottom: 12,
            }}
          >
            <CheckCircle size={32} />
          </div>
          <h2 id="receipt-modal-title" style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 4px 0' }}>
            Recibo Oficial de Doação
          </h2>
          <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
            INSTITUTO SER MELHOR · CNPJ 09.040.440/0001-47
          </p>
        </div>

        {/* Highlight SROI Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #052e16 0%, #166534 100%)',
            borderRadius: 16, padding: '20px 24px', color: 'white', textAlign: 'center',
            marginBottom: 24, boxShadow: '0 4px 12px rgba(22,163,74,0.2)',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
            VALOR CONTRIBUÍDO
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace' }}>
            R$ {receiptData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: '#bbf7d0', marginTop: 4, fontWeight: 600 }}>
            🌱 Retorno Social Estimado (SROI R$ 4,83):{' '}
            <strong style={{ color: '#4ade80' }}>
              R$ {receiptData.socialValueGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Details Table */}
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb', marginBottom: 24, fontSize: 12 }}>
          {[
            { label: 'Doador(a)', val: receiptData.donorName },
            { label: 'E-mail', val: receiptData.donorEmail },
            { label: 'CPF / CNPJ', val: receiptData.donorTaxId },
            { label: 'Pilar Contemplado', val: receiptData.pillar },
            { label: 'Periodicidade', val: receiptData.frequency },
            { label: 'Método', val: receiptData.paymentMethod },
            { label: 'ID Transação', val: receiptData.transactionId, isCode: true },
            { label: 'Emitido em', val: receiptData.issuedAt },
          ].map((row, idx) => (
            <div
              key={row.label}
              style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                borderBottom: idx < 7 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              <span style={{ color: '#6b7280', fontWeight: 600 }}>{row.label}:</span>
              <span style={{ fontWeight: 700, color: '#111827', fontFamily: row.isCode ? 'monospace' : 'inherit' }}>{row.val}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1, padding: '12px 18px', background: '#16a34a', color: 'white',
              fontWeight: 800, borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}
          >
            <Printer size={16} /> Imprimir / Salvar PDF
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px', background: '#f3f4f6', color: '#374151',
              fontWeight: 700, borderRadius: 12, border: '1px solid #e5e7eb', cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
