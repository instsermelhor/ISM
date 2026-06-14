import React, { useState } from 'react';
import { Heart, Lock, Calendar, CreditCard, RefreshCcw, CheckCircle, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { InstitutionalService } from '../../services/data';
import { DonationType } from '../../types';

type Step = 'select' | 'details' | 'processing' | 'success';

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

export const DonationForm: React.FC = () => {
  const [step, setStep] = useState<Step>('select');
  const [frequency, setFrequency] = useState<DonationType>('Mensal');
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');

  // BUG FIX: erro inline ao invés de alert() nativo
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [donorDetails, setDonorDetails] = useState({
    name: '',
    email: '',
    taxId: ''
  });
  const [consent, setConsent] = useState(false);

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setAmount(val);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    // BUG FIX: validação com mensagem inline, não alert()
    if (!consent) {
      setInlineError('Para prosseguir, é obrigatório aceitar a Política de Privacidade.');
      return;
    }

    setInlineError(null);
    setStep('processing');

    try {
      const result = await InstitutionalService.processDonation({
        amount,
        currency: 'BRL',
        type: frequency,
        donorName: donorDetails.name,
        donorEmail: donorDetails.email,
        taxId: donorDetails.taxId
      });

      setTransactionId(result.transactionId);
      setStep('success');
    } catch (error) {
      setInlineError('Erro ao processar doação. Por favor, verifique os dados e tente novamente.');
      setStep('details');
    }
  };

  // Thank You State
  if (step === 'success') {
    return (
      <div className="bg-gradient-to-br from-brand-800 to-secondary-900 text-white p-8 rounded-3xl text-center h-full flex flex-col justify-center items-center animate-fade-in relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center text-white mb-6 mx-auto shadow-[0_0_40px_rgba(34,197,94,0.5)] animate-bounce">
            <Heart size={46} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-black mb-1">Muito Obrigado!</h2>
          <p className="text-brand-200 font-bold uppercase tracking-widest text-xs mb-6">Transação Aprovada</p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
            <p className="text-secondary-300 text-sm mb-1">Você doou</p>
            <p className="text-4xl font-black text-white mb-2">R$ {amount},00</p>
            <div className="inline-block px-3 py-1 bg-brand-600 rounded-full text-xs font-bold uppercase mb-3">
              {frequency === 'Única' ? 'Doação Única' : 'Recorrência Mensal'}
            </div>
            <div className="text-xs text-secondary-400 font-mono">ID: {transactionId}</div>
          </div>
          <p className="text-sm text-secondary-300 mb-8 max-w-sm mx-auto leading-relaxed">
            Um recibo fiscal foi enviado para <strong className="text-white">{donorDetails.email}</strong>.
          </p>
          <button
            onClick={() => { setStep('select'); setAmount(100); setDonorDetails({ name: '', email: '', taxId: '' }); setConsent(false); }}
            className="px-8 py-3 bg-white text-secondary-900 font-bold rounded-full hover:bg-brand-50 transition-colors shadow-lg"
          >
            Fazer Nova Doação
          </button>
        </div>
      </div>
    );
  }

  // Processing State
  if (step === 'processing') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl p-8 text-center">
        <RefreshCcw size={48} className="text-brand-600 animate-spin mb-6" />
        <p className="text-xl font-bold text-secondary-800">Processando Pagamento...</p>
        <p className="text-sm text-secondary-400 mt-2 max-w-xs">
          Conectando ao Gateway Seguro (256-bit SSL). Por favor, não feche esta janela.
        </p>
      </div>
    );
  }

  // Form
  return (
    <div className="relative h-full flex flex-col">
      {step === 'select' ? (
        <div className="animate-fade-in flex flex-col h-full">
          {/* Frequency Toggle */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-7 border border-gray-200">
            <button
              onClick={() => setFrequency('Única')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${frequency === 'Única' ? 'bg-white shadow-sm text-secondary-900 ring-1 ring-black/5' : 'text-secondary-400 hover:text-secondary-700'}`}
            >
              Doação Única
            </button>
            <button
              onClick={() => setFrequency('Mensal')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${frequency === 'Mensal' ? 'bg-brand-600 shadow-sm text-white' : 'text-secondary-400 hover:text-secondary-700'}`}
            >
              <Zap size={14} fill="currentColor" />
              Mensalmente
            </button>
          </div>

          {/* Amount Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => { setAmount(val); setCustomAmount(''); }}
                className={`py-4 px-2 rounded-xl border-2 font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                  amount === val && !customAmount
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-inner shadow-brand-100'
                    : 'border-gray-100 bg-white text-secondary-600 hover:border-brand-200 hover:shadow-sm'
                }`}
              >
                <span className="text-xs font-normal text-current opacity-60">R$</span>
                <span className="text-lg">{val}</span>
              </button>
            ))}
            <div className="relative col-span-3 mt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-bold text-sm">R$</span>
              <input
                type="number"
                placeholder="Outro valor"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 font-bold outline-none transition-all text-lg ${
                  customAmount
                    ? 'border-brand-500 bg-brand-50 text-brand-900'
                    : 'border-gray-100 bg-white focus:border-brand-300'
                }`}
              />
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => setStep('details')}
              className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-brand-700/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
            >
              Continuar com R$ {amount}
            </button>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-secondary-400 bg-gray-50 py-2 rounded-lg border border-gray-100">
              <ShieldCheck size={14} className="text-brand-500" />
              <span>Ambiente Seguro Certificado</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDonate} className="animate-fade-in h-full flex flex-col">
          <div className="mb-5">
            <button
              type="button"
              onClick={() => { setStep('select'); setInlineError(null); }}
              className="text-sm text-secondary-400 hover:text-brand-600 font-bold mb-4 flex items-center gap-1 group transition-colors"
            >
              <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
              Alterar valor
            </button>
            <h3 className="text-xl font-bold text-secondary-900">Identificação</h3>
            <p className="text-sm text-secondary-400">Seus dados estão protegidos pela LGPD.</p>
          </div>

          {/* BUG FIX: inline error message */}
          {inlineError && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{inlineError}</span>
            </div>
          )}

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Seu nome completo"
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                value={donorDetails.name}
                onChange={(e) => setDonorDetails({ ...donorDetails, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1.5">E-mail *</label>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                value={donorDetails.email}
                onChange={(e) => setDonorDetails({ ...donorDetails, email: e.target.value })}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest">CPF / CNPJ</label>
                <span className="text-[10px] text-secondary-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">Opcional para recibo</span>
              </div>
              <input
                type="text"
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="Apenas números"
                value={donorDetails.taxId}
                onChange={(e) => setDonorDetails({ ...donorDetails, taxId: e.target.value })}
              />
            </div>
          </div>

          {/* LGPD Consent */}
          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-100 transition-colors">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:border-brand-500 checked:bg-brand-500 transition-all"
                  checked={consent}
                  onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setInlineError(null); }}
                />
                <CheckCircle size={13} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
              </div>
              <div className="text-xs text-secondary-500 leading-relaxed select-none">
                Concordo com a <strong className="text-secondary-800">Política de Privacidade</strong> e autorizo o processamento seguro dos meus dados para fins de doação.
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 mt-auto flex items-center justify-center gap-2 group transition-all duration-200"
          >
            <CreditCard size={20} className="group-hover:scale-110 transition-transform" />
            Ir para Pagamento Seguro
          </button>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 mt-5 opacity-50">
            <div className="flex items-center gap-1">
              <Lock size={11} className="text-secondary-600" />
              <span className="text-[10px] font-bold text-secondary-600">SSL ENCRYPTED</span>
            </div>
            <div className="h-3 w-px bg-gray-300" />
            <span className="text-[10px] font-bold text-secondary-600">POWERED BY <span className="font-extrabold" style={{ color: '#635BFF' }}>STRIPE</span></span>
          </div>
        </form>
      )}
    </div>
  );
};