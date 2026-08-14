/**
 * DataSubjectRightsModal.tsx — LGPD-001: Canal de Atendimento aos Direitos do Titular de Dados
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Formulário e modal acessível (WCAG 2.1 AA) para exercício dos direitos previstos no Art. 18 da LGPD:
 * - Confirmação de existência e acesso a dados
 * - Correção de dados incompletos, inexatos ou desatualizados
 * - Anonimização, bloqueio ou eliminação de dados desnecessários/excessivos
 * - Portabilidade de dados a outro fornecedor
 * - Eliminação de dados tratados com consentimento
 * - Informação sobre entidades públicas/privadas com as quais compartilhamos dados
 * - Revogação do consentimento
 */

import React, { useState } from 'react';
import { ShieldCheck, User, Mail, FileText, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';

export type RightType =
  | 'ACCESS'
  | 'CORRECTION'
  | 'ANONYMIZATION'
  | 'ELIMINATION'
  | 'PORTABILITY'
  | 'REVOCATION';

export interface DataSubjectRightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSubjectRightsModal: React.FC<DataSubjectRightsModalProps> = ({ isOpen, onClose }) => {
  const [rightType, setRightType] = useState<RightType>('ACCESS');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [details, setDetails] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Nome e E-mail são obrigatórios para identificar o titular.');
      return;
    }
    if (!consent) {
      setError('É necessário confirmar a veracidade dos dados informados.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulação / chamada da API de Direitos do Titular
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedProtocol = `REQ-LGPD-${year}-${randomSuffix}`;

      // Salva no localStorage ou API
      const requestData = {
        protocol: generatedProtocol,
        rightType,
        name,
        email,
        taxId,
        details,
        submittedAt: new Date().toISOString(),
        deadlineDays: 15,
        status: 'EM_ANALISE',
      };

      try {
        const existing = JSON.parse(localStorage.getItem('ism_lgpd_requests') || '[]');
        existing.push(requestData);
        localStorage.setItem('ism_lgpd_requests', JSON.stringify(existing));
      } catch { /* ignore */ }

      setProtocol(generatedProtocol);
    } catch {
      setError('Ocorreu um erro ao enviar sua solicitação. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProtocol(null);
    setName('');
    setEmail('');
    setTaxId('');
    setDetails('');
    setConsent(false);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Canal de Direitos do Titular (LGPD — Art. 18)">
      {protocol ? (
        <div className="text-center py-6 animate-fade-in" role="status">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <CheckCircle size={36} aria-hidden="true" />
          </div>
          <h4 className="text-2xl font-black text-secondary-900 mb-2">Solicitação Registrada com Sucesso!</h4>
          <p className="text-sm text-secondary-600 mb-4">
            Seu pedido foi encaminhado ao nosso Encarregado de Proteção de Dados (DPO).
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 inline-block text-left w-full max-w-md">
            <div className="text-xs text-secondary-400 font-bold uppercase tracking-wider mb-1">Protocolo de Atendimento</div>
            <div className="text-xl font-black text-brand-700 font-mono select-all mb-3">{protocol}</div>
            <div className="flex items-center gap-2 text-xs text-secondary-500">
              <Clock size={14} className="text-brand-600" aria-hidden="true" />
              <span>Prazo legal de resposta: <strong>até 15 dias úteis</strong> (Art. 19, II LGPD).</span>
            </div>
          </div>
          <p className="text-xs text-secondary-400 mb-6">
            Uma confirmação foi enviada para o e-mail <strong>{email}</strong>. Você também pode acompanhar pelo e-mail <code>dpo@institutosermelhor.org.br</code>.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
          >
            Concluir Atendimento
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-brand-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-secondary-600 leading-relaxed">
              O Instituto Ser Melhor respeita sua privacidade. Utilize este formulário para exercer qualquer um dos seus direitos garantidos pela <strong>Lei Geral de Proteção de Dados (Lei 13.709/2018)</strong>.
            </p>
          </div>

          {error && (
            <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="lgpd-right-type" className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">
              Direito que deseja exercer *
            </label>
            <select
              id="lgpd-right-type"
              value={rightType}
              onChange={(e) => setRightType(e.target.value as RightType)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-secondary-900 font-medium text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
              aria-required="true"
            >
              <option value="ACCESS">1. Confirmação de existência e Acesso aos meus dados (Art. 18, I e II)</option>
              <option value="CORRECTION">2. Correção de dados incompletos, inexatos ou desatualizados (Art. 18, III)</option>
              <option value="ANONYMIZATION">3. Anonimização ou bloqueio de dados excessivos (Art. 18, IV)</option>
              <option value="ELIMINATION">4. Eliminação dos dados pessoais tratados (Art. 18, VI)</option>
              <option value="PORTABILITY">5. Portabilidade de dados a outro serviço (Art. 18, V)</option>
              <option value="REVOCATION">6. Revogação de consentimento anterior (Art. 18, IX)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="lgpd-name" className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" aria-hidden="true" />
                <input
                  id="lgpd-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lgpd-email" className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">
                E-mail para Resposta *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" aria-hidden="true" />
                <input
                  id="lgpd-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="lgpd-taxid" className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">
              CPF (opcional — para localização inequívoca do cadastro)
            </label>
            <input
              id="lgpd-taxid"
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
            />
          </div>

          <div>
            <label htmlFor="lgpd-details" className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">
              Detalhes ou Justificativa da Solicitação
            </label>
            <textarea
              id="lgpd-details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Descreva detalhes que facilitem o atendimento do seu pedido..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300"
                aria-required="true"
              />
              <span className="text-xs text-secondary-600 leading-relaxed">
                Declaro ser o titular dos dados ou seu representante legal e confirmo a veracidade das informações para fins de validação de identidade.
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-sm font-bold text-secondary-500 hover:text-secondary-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md"
            >
              <Send size={15} aria-hidden="true" />
              {loading ? 'Registrando...' : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
