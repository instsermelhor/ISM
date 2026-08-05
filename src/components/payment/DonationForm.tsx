/**
 * DonationForm.tsx — Gateway de Doações ISM
 * Multi-método: PIX CNPJ, Cartão de Crédito e Boleto Bancário.
 * Inclui seletor de pilar, validação Zod + react-hook-form, LGPD consent.
 *
 * Chave Pix Oficial (CNPJ): 09.040.440/0001-47
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Heart, Lock, CreditCard, RefreshCcw, CheckCircle,
  ShieldCheck, Zap, AlertCircle, BookOpen, Users, Leaf, Palette,
  Copy, Check, QrCode, FileText,
} from 'lucide-react';
import { InstitutionalService } from '../../services/data';
import type { DonationType, DonationPillar } from '../../types';

/* ── PIX ISM ── */
const ISM_PIX_CNPJ = '09.040.440/0001-47';
const ISM_PIX_BANK = 'Banco do Brasil';
const ISM_PIX_NAME = 'Instituto Ser Melhor';

/* ── Zod Schema ────────────────────────────────────────────────────── */
const donationSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .email('E-mail inválido')
    .min(1, 'E-mail é obrigatório'),
  taxId: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{11,14}$/.test(val.replace(/\D/g, '')),
      'CPF deve ter 11 dígitos, CNPJ deve ter 14 dígitos',
    ),
  consent: z
    .boolean()
    .refine((val) => val === true, 'Você precisa aceitar a Política de Privacidade para continuar'),
});

type DonationFormData = z.infer<typeof donationSchema>;

/* ── Constants ─────────────────────────────────────────────────────── */
type Step = 'select' | 'payment_method' | 'pix_panel' | 'boleto_panel' | 'details' | 'processing' | 'success';
type PaymentMethod = 'PIX' | 'CARTAO' | 'BOLETO';
const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];
const MIN_AMOUNT = 5;

interface PillarOption {
  key: DonationPillar;
  label: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}

const PILLAR_OPTIONS: PillarOption[] = [
  { key: 'Geral',         label: 'Geral',         Icon: Heart,    color: '#16a34a', bg: 'rgba(22,163,74,0.12)'   },
  { key: 'Educação',      label: 'Educação',      Icon: BookOpen, color: '#1E3A8A', bg: 'rgba(30,58,138,0.12)'   },
  { key: 'Social',        label: 'Social',        Icon: Users,    color: '#D97706', bg: 'rgba(217,119,6,0.12)'   },
  { key: 'Meio Ambiente', label: 'Meio Ambiente', Icon: Leaf,     color: '#15803D', bg: 'rgba(21,128,61,0.12)'   },
  { key: 'Cultura',       label: 'Cultura',       Icon: Palette,  color: '#C2410C', bg: 'rgba(194,65,12,0.12)'   },
];

interface DonationFormProps {
  initialPillar?: DonationPillar;
}

export const DonationForm: React.FC<DonationFormProps> = ({ initialPillar = 'Geral' }) => {
  const [step, setStep] = useState<Step>('select');
  const [frequency, setFrequency] = useState<DonationType>('Mensal');
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<DonationPillar>(initialPillar);
  const [transactionId, setTransactionId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [pixCopied, setPixCopied] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(ISM_PIX_CNPJ.replace(/\D/g, ''));
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2500);
    } catch {
      /* fallback silencioso */
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: { consent: false },
  });

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) { setAmount(val); setAmountError(null); }
  };

  const handleContinue = () => {
    if (amount < MIN_AMOUNT) {
      setAmountError(`O valor mínimo para doação é R$ ${MIN_AMOUNT},00.`);
      return;
    }
    setAmountError(null);
    setStep('payment_method');
  };

  const onSubmit = async (data: DonationFormData) => {
    setSubmitError(null);
    setStep('processing');
    try {
      const result = await InstitutionalService.processDonation({
        amount,
        currency: 'BRL',
        type: frequency,
        donorName: data.name,
        donorEmail: data.email,
        taxId: data.taxId,
        destinationPillar: selectedPillar,
      });
      setTransactionId(result.transactionId);
      setStep('success');
    } catch {
      setSubmitError('Erro ao processar doação. Por favor, verifique os dados e tente novamente.');
      setStep('details');
    }
  };

  const handleReset = () => {
    setStep('select');
    setAmount(100);
    setCustomAmount('');
    setSelectedPillar('Geral');
    setSubmitError(null);
    setPaymentMethod('PIX');
    setPixCopied(false);
    reset();
  };

  /* ── Success ── */
  if (step === 'success') {
    const pillar = PILLAR_OPTIONS.find((p) => p.key === selectedPillar)!;
    return (
      <div
        className="bg-gradient-to-br from-brand-800 to-secondary-900 text-white p-8 rounded-3xl text-center h-full flex flex-col justify-center items-center animate-fade-in relative overflow-hidden shadow-2xl"
        role="alert"
        aria-live="polite"
      >
        <div className="relative z-10">
          <div className="w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center text-white mb-6 mx-auto shadow-[0_0_40px_rgba(34,197,94,0.5)] animate-bounce">
            <Heart size={46} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-black mb-1">Muito Obrigado!</h2>
          <p className="text-brand-200 font-bold uppercase tracking-widest text-xs mb-6">Transação Aprovada</p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
            <p className="text-secondary-300 text-sm mb-1">Você doou</p>
            <p className="text-4xl font-black text-white mb-2">
              R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3"
              style={{ background: pillar.color }}
            >
              <pillar.Icon size={11} />
              Pilar: {pillar.label}
            </div>
            <div className="text-xs text-secondary-400 font-mono">ID: {transactionId}</div>
          </div>
          {paymentMethod === 'PIX' && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 text-left">
              <p className="text-[10px] text-brand-400 uppercase font-bold tracking-widest mb-1">Chave Pix para Confirmação</p>
              <p className="text-xs font-bold font-mono select-all break-all text-white">{ISM_PIX_CNPJ}</p>
              <p className="text-[10px] text-secondary-400 mt-1">{ISM_PIX_NAME} · {ISM_PIX_BANK}</p>
            </div>
          )}
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-white text-secondary-900 font-bold rounded-full hover:bg-brand-50 transition-colors shadow-lg"
          >
            Fazer Nova Doação
          </button>
        </div>
      </div>
    );
  }

  /* ── Processing ── */
  if (step === 'processing') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl p-8 text-center" role="status" aria-live="polite">
        <RefreshCcw size={48} className="text-brand-600 animate-spin mb-6" aria-hidden="true" />
        <p className="text-xl font-bold text-secondary-800">Processando Pagamento...</p>
        <p className="text-sm text-secondary-400 mt-2 max-w-xs">
          Conectando ao Gateway Seguro (256-bit SSL). Por favor, não feche esta janela.
        </p>
      </div>
    );
  }

  /* ── Step: payment_method ── */
  if (step === 'payment_method') {
    const methods: { id: PaymentMethod; label: string; desc: string; icon: React.ElementType; badge: string; color: string }[] = [
      { id: 'PIX',    label: 'PIX Instantâneo',        desc: 'Chave CNPJ · Aprovação imediata',                   icon: QrCode,    badge: '⚡ Instantâneo',  color: '#16a34a' },
      { id: 'CARTAO', label: 'Cartão de Crédito',      desc: 'Débito automático · Parcelamento em até 12x',       icon: CreditCard, badge: '💳 Recorrente', color: '#2563eb' },
      { id: 'BOLETO', label: 'Boleto Bancário',        desc: 'Vencimento em 3 dias úteis · Sem taxas extras',      icon: FileText,  badge: '📄 Sem taxa',    color: '#d97706' },
    ];
    return (
      <div className="animate-fade-in flex flex-col h-full">
        <button
          type="button"
          onClick={() => setStep('select')}
          className="text-sm text-secondary-400 hover:text-brand-600 font-bold mb-5 flex items-center gap-1 group transition-colors"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block" aria-hidden="true">←</span>
          Alterar valor
        </button>
        <h3 className="text-xl font-bold text-secondary-900 mb-1">Forma de Pagamento</h3>
        <p className="text-sm text-secondary-400 mb-6">
          Doação de <strong className="text-secondary-900">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> · {frequency}
        </p>
        <div className="space-y-3 mb-6">
          {methods.map(m => (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              aria-pressed={paymentMethod === m.id}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                paymentMethod === m.id
                  ? 'border-brand-500 bg-brand-50 shadow-inner shadow-brand-100'
                  : 'border-gray-100 bg-white hover:border-brand-200'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: paymentMethod === m.id ? `${m.color}18` : '#f3f4f6', color: m.color }}
              >
                <m.icon size={20} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-secondary-900">{m.label}</span>
                  <span className="text-[10px] font-bold text-secondary-400 bg-gray-100 px-2 py-0.5 rounded-full">{m.badge}</span>
                </div>
                <p className="text-xs text-secondary-400 mt-0.5">{m.desc}</p>
              </div>
              {paymentMethod === m.id && (
                <CheckCircle size={18} className="text-brand-500 shrink-0" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-auto">
          <button
            onClick={() => {
              if (paymentMethod === 'PIX')   setStep('pix_panel');
              else if (paymentMethod === 'BOLETO') setStep('boleto_panel');
              else setStep('details');
            }}
            className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continuar com {paymentMethod === 'PIX' ? 'PIX' : paymentMethod === 'CARTAO' ? 'Cartão' : 'Boleto'}
          </button>
        </div>
      </div>
    );
  }

  /* ── Step: pix_panel ── */
  if (step === 'pix_panel') {
    return (
      <div className="animate-fade-in flex flex-col h-full">
        <button
          type="button"
          onClick={() => setStep('payment_method')}
          className="text-sm text-secondary-400 hover:text-brand-600 font-bold mb-5 flex items-center gap-1 group transition-colors"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block" aria-hidden="true">←</span>
          Voltar
        </button>
        <div className="flex flex-col items-center text-center flex-1 justify-center">
          {/* QR Code visual */}
          <div className="w-36 h-36 bg-gray-50 border-2 border-gray-200 rounded-2xl flex flex-col items-center justify-center mb-5 mx-auto">
            <QrCode size={64} className="text-secondary-300" aria-hidden="true" />
            <span className="text-[9px] text-secondary-300 font-mono mt-1">QR PIX ISM</span>
          </div>
          <h3 className="text-lg font-black text-secondary-900 mb-1">Pix CNPJ — Instituto Ser Melhor</h3>
          <p className="text-xs text-secondary-400 mb-5">
            Valor: <strong className="text-secondary-900">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> · {frequency}
          </p>
          {/* Chave */}
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-[10px] text-brand-600 uppercase font-bold tracking-widest mb-1">Chave Pix (CNPJ)</p>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-secondary-900 select-all text-sm flex-1 text-left break-all">
                {ISM_PIX_CNPJ}
              </span>
              <button
                id="pix-copy-btn"
                onClick={handleCopyPix}
                aria-label="Copiar chave Pix"
                className="shrink-0 p-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 transition-colors"
              >
                {pixCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-secondary-400 mt-1">{ISM_PIX_NAME} · {ISM_PIX_BANK}</p>
          </div>
          {pixCopied && (
            <p role="status" aria-live="polite" className="text-xs text-brand-600 font-bold mb-3 flex items-center gap-1">
              <Check size={12} /> Chave copiada!
            </p>
          )}
          <p className="text-xs text-secondary-400 mb-6">
            Após o pagamento, salve o comprovante. Envie para
            {' '}<strong className="text-secondary-700">financeiro@institutosm.com.br</strong> para receber o certificado de impacto.
          </p>
          <button
            id="pix-confirm-btn"
            onClick={() => {
              setTransactionId(`PIX-${Date.now().toString(36).toUpperCase()}`);
              setStep('success');
            }}
            className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all duration-200"
          >
            Já realizei o Pix ✓
          </button>
        </div>
      </div>
    );
  }

  /* ── Step: boleto_panel ── */
  if (step === 'boleto_panel') {
    return (
      <div className="animate-fade-in flex flex-col h-full">
        <button
          type="button"
          onClick={() => setStep('payment_method')}
          className="text-sm text-secondary-400 hover:text-brand-600 font-bold mb-5 flex items-center gap-1 group transition-colors"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block" aria-hidden="true">←</span>
          Voltar
        </button>
        <div className="flex flex-col items-center text-center flex-1 justify-center">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mb-5 mx-auto">
            <FileText size={32} className="text-amber-500" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-black text-secondary-900 mb-1">Boleto Bancário</h3>
          <p className="text-sm text-secondary-400 mb-6">Informe seus dados para gerar o boleto.</p>
          <button
            onClick={() => setStep('details')}
            className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all duration-200"
          >
            Preencher dados
          </button>
        </div>
      </div>
    );
  }

  /* ── Step: select ── */
  if (step === 'select') {
    return (
      <div className="animate-fade-in flex flex-col h-full">

        {/* Frequency Toggle */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl mb-5 border border-gray-200" role="group" aria-label="Frequência da doação">
          <button
            onClick={() => setFrequency('Única')}
            aria-pressed={frequency === 'Única'}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${frequency === 'Única' ? 'bg-white shadow-sm text-secondary-900 ring-1 ring-black/5' : 'text-secondary-400 hover:text-secondary-700'}`}
          >
            Doação Única
          </button>
          <button
            onClick={() => setFrequency('Mensal')}
            aria-pressed={frequency === 'Mensal'}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${frequency === 'Mensal' ? 'bg-brand-600 shadow-sm text-white' : 'text-secondary-400 hover:text-secondary-700'}`}
          >
            <Zap size={14} fill="currentColor" aria-hidden="true" />
            Mensalmente
          </button>
        </div>

        {/* Pillar selector */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary-500 mb-2">
            Destinar para o Pilar:
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Escolha o pilar de destino">
            {PILLAR_OPTIONS.map((opt) => {
              const isActive = selectedPillar === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelectedPillar(opt.key)}
                  aria-pressed={isActive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border"
                  style={{
                    background: isActive ? opt.bg : 'transparent',
                    color: isActive ? opt.color : '#64748b',
                    borderColor: isActive ? opt.color : 'rgba(0,0,0,0.1)',
                    boxShadow: isActive ? `0 2px 8px ${opt.color}30` : 'none',
                  }}
                >
                  <opt.Icon size={12} aria-hidden="true" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-2">
          {PRESET_AMOUNTS.map((val) => (
            <button
              key={val}
              onClick={() => { setAmount(val); setCustomAmount(''); setAmountError(null); }}
              aria-pressed={amount === val && !customAmount}
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-bold text-sm" aria-hidden="true">R$</span>
            <label htmlFor="donation-custom-amount" className="sr-only">Valor personalizado em reais</label>
            <input
              id="donation-custom-amount"
              type="number"
              min={MIN_AMOUNT}
              placeholder="Outro valor"
              value={customAmount}
              onChange={handleCustomAmountChange}
              aria-describedby={amountError ? 'amount-error' : undefined}
              aria-invalid={!!amountError}
              className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 font-bold outline-none transition-all text-lg ${
                customAmount ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-gray-100 bg-white focus:border-brand-300'
              }`}
            />
          </div>
        </div>
        {amountError && (
          <p id="amount-error" role="alert" className="text-red-600 text-xs mb-3 flex items-center gap-1">
            <AlertCircle size={12} aria-hidden="true" /> {amountError}
          </p>
        )}

        <div className="mt-auto">
          <button
            onClick={handleContinue}
            data-testid="continue-btn"
            className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-brand-700/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continuar com R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </button>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-secondary-400 bg-gray-50 py-2 rounded-lg border border-gray-100">
            <ShieldCheck size={14} className="text-brand-500" aria-hidden="true" />
            <span>Ambiente Seguro Certificado</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step: details ── */
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in h-full flex flex-col" aria-label="Formulário de identificação do doador">
      <div className="mb-5">
        <button
          type="button"
          onClick={() => { setStep('select'); setSubmitError(null); }}
          className="text-sm text-secondary-400 hover:text-brand-600 font-bold mb-4 flex items-center gap-1 group transition-colors"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block" aria-hidden="true">←</span>
          Alterar valor
        </button>
        <h3 className="text-xl font-bold text-secondary-900">Identificação</h3>
        <p className="text-sm text-secondary-400">Seus dados estão protegidos pela LGPD.</p>
      </div>

      {submitError && (
        <div role="alert" aria-live="assertive" className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="space-y-4 mb-5">
        {/* Name */}
        <div>
          <label htmlFor="donor-name" className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1.5">
            Nome Completo <span aria-hidden="true">*</span>
          </label>
          <input
            id="donor-name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
            aria-required="true"
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
            className={`w-full p-3.5 border rounded-xl outline-none transition-all bg-gray-50 focus:bg-white ${errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent'}`}
            {...register('name')}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={11} aria-hidden="true" /> {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="donor-email" className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1.5">
            E-mail <span aria-hidden="true">*</span>
          </label>
          <input
            id="donor-email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            aria-required="true"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
            className={`w-full p-3.5 border rounded-xl outline-none transition-all bg-gray-50 focus:bg-white ${errors.email ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent'}`}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={11} aria-hidden="true" /> {errors.email.message}
            </p>
          )}
        </div>

        {/* CPF/CNPJ */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="donor-taxid" className="block text-xs font-bold text-secondary-400 uppercase tracking-widest">
              CPF / CNPJ
            </label>
            <span className="text-[10px] text-secondary-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">Opcional para recibo</span>
          </div>
          <input
            id="donor-taxid"
            type="text"
            inputMode="numeric"
            placeholder="Apenas números"
            aria-describedby={errors.taxId ? 'taxid-error' : undefined}
            aria-invalid={!!errors.taxId}
            className={`w-full p-3.5 border rounded-xl outline-none transition-all bg-gray-50 focus:bg-white ${errors.taxId ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent'}`}
            {...register('taxId')}
          />
          {errors.taxId && (
            <p id="taxid-error" role="alert" className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={11} aria-hidden="true" /> {errors.taxId.message}
            </p>
          )}
        </div>
      </div>

      {/* LGPD Consent */}
      <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-100 transition-colors">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center mt-0.5 shrink-0">
            <input
              type="checkbox"
              aria-required="true"
              aria-describedby={errors.consent ? 'consent-error' : undefined}
              aria-invalid={!!errors.consent}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:border-brand-500 checked:bg-brand-500 transition-all"
              {...register('consent')}
            />
            <CheckCircle size={13} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" aria-hidden="true" />
          </div>
          <div className="text-xs text-secondary-500 leading-relaxed select-none">
            Concordo com a <strong className="text-secondary-800">Política de Privacidade</strong> e autorizo o processamento seguro dos meus dados para fins de doação.
          </div>
        </label>
        {errors.consent && (
          <p id="consent-error" role="alert" className="text-red-600 text-xs mt-2 flex items-center gap-1">
            <AlertCircle size={11} aria-hidden="true" /> {errors.consent.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        data-testid="submit-btn"
        className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 mt-auto flex items-center justify-center gap-2 group transition-all duration-200"
      >
        <CreditCard size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
        {paymentMethod === 'BOLETO' ? 'Gerar Boleto' : 'Ir para Pagamento Seguro'}
      </button>

      <div className="flex items-center justify-center gap-4 mt-5 opacity-50">
        <div className="flex items-center gap-1">
          <Lock size={11} className="text-secondary-600" aria-hidden="true" />
          <span className="text-[10px] font-bold text-secondary-600">SSL ENCRYPTED</span>
        </div>
        <div className="h-3 w-px bg-gray-300" aria-hidden="true" />
        <span className="text-[10px] font-bold text-secondary-600">
          POWERED BY <span className="font-extrabold" style={{ color: '#635BFF' }}>STRIPE</span>
        </span>
      </div>
    </form>
  );
};