import React, { useState } from 'react';
import { Heart, Lock, Calendar, CreditCard, RefreshCcw, ShieldCheck, CheckCircle } from 'lucide-react';
import { InstitutionalService } from '../../services/data';

type Step = 'select' | 'details' | 'processing' | 'success';
type Frequency = 'Única' | 'Mensal';

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

export const DonationForm: React.FC = () => {
  const [step, setStep] = useState<Step>('select');
  const [frequency, setFrequency] = useState<Frequency>('Mensal');
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  // Form State
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
    
    // Client-side Validation for Consent
    if (!consent) {
        alert("Para prosseguir, é obrigatório aceitar a Política de Privacidade e o tratamento de dados.");
        return;
    }

    setStep('processing');
    
    try {
      // Calls the simulated Next.js API Route /api/checkout
      await InstitutionalService.processDonation({
        amount,
        currency: 'BRL',
        type: frequency,
        donorName: donorDetails.name,
        donorEmail: donorDetails.email,
        taxId: donorDetails.taxId,
        consentLGPD: consent
      });
      setStep('success');
    } catch (error) {
      alert("Erro ao iniciar sessão de pagamento seguro. Tente novamente.");
      setStep('details');
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-brand-900 text-white p-8 rounded-2xl text-center h-full flex flex-col justify-center items-center">
        <div className="w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center text-white mb-6 animate-bounce">
            <Heart size={48} fill="currentColor" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Redirecionando...</h2>
        <p className="text-xl text-brand-100 mb-8">
            Você está sendo redirecionado para o ambiente seguro do <strong>Stripe Checkout</strong> para concluir sua doação de <strong>R$ {amount},00</strong>.
        </p>
        <div className="flex gap-2 justify-center opacity-70">
            <Lock size={14} />
            <span className="text-xs font-mono">TLS 1.3 Encrypted Connection</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
        {step === 'processing' ? (
            <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                <RefreshCcw size={48} className="text-brand-600 animate-spin mb-4" />
                <p className="text-lg font-bold text-gray-700">Iniciando Checkout Seguro...</p>
                <p className="text-sm text-gray-500 mt-2">Criptografando dados (256-bit SSL)</p>
            </div>
        ) : null}

        {step === 'select' ? (
            <div className="animate-fade-in flex flex-col h-full">
                {/* Frequency Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
                    <button 
                        onClick={() => setFrequency('Única')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${frequency === 'Única' ? 'bg-white shadow text-secondary-900' : 'text-gray-500'}`}
                    >
                        Doação Única
                    </button>
                    <button 
                        onClick={() => setFrequency('Mensal')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${frequency === 'Mensal' ? 'bg-brand-600 shadow text-white' : 'text-gray-500'}`}
                    >
                        <Calendar size={14} />
                        Mensal
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {PRESET_AMOUNTS.map((val) => (
                        <button
                            key={val}
                            onClick={() => { setAmount(val); setCustomAmount(''); }}
                            className={`py-3 px-2 rounded-xl border-2 font-bold text-lg transition-all ${amount === val && !customAmount ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-brand-200'}`}
                        >
                            R$ {val}
                        </button>
                    ))}
                    <div className="relative col-span-3 mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                        <input 
                            type="number" 
                            placeholder="Outro valor"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 font-bold outline-none transition-all ${customAmount ? 'border-brand-500 bg-brand-50' : 'border-gray-200 focus:border-brand-300'}`}
                        />
                    </div>
                </div>

                <button 
                    onClick={() => setStep('details')}
                    className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-700 hover:scale-[1.02] transition-all mt-auto"
                >
                    Continuar com R$ {amount}
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400 bg-gray-50 py-2 rounded-lg">
                    <ShieldCheck size={14} className="text-brand-500" />
                    <span>Ambiente Seguro Certificado</span>
                </div>
            </div>
        ) : (
            <form onSubmit={handleDonate} className="animate-fade-in h-full flex flex-col">
                <div className="mb-4">
                    <button 
                        type="button" 
                        onClick={() => setStep('select')}
                        className="text-sm text-gray-500 hover:text-brand-600 font-bold mb-2 flex items-center gap-1"
                    >
                        &larr; Voltar
                    </button>
                    <h3 className="text-2xl font-bold text-secondary-900">Identificação</h3>
                    <p className="text-sm text-gray-500">Seus dados estão protegidos pela LGPD.</p>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo *</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            value={donorDetails.name}
                            onChange={(e) => setDonorDetails({...donorDetails, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail *</label>
                        <input 
                            type="email" 
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            value={donorDetails.email}
                            onChange={(e) => setDonorDetails({...donorDetails, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase">CPF / CNPJ</label>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Opcional</span>
                        </div>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="Apenas para recibo fiscal"
                            value={donorDetails.taxId}
                            onChange={(e) => setDonorDetails({...donorDetails, taxId: e.target.value})}
                        />
                    </div>
                </div>

                {/* LGPD Consent Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-brand-500 checked:bg-brand-500 transition-all"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                            />
                            <CheckCircle size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed select-none">
                            Concordo com a <button type="button" className="text-brand-600 font-bold hover:underline">Política de Privacidade</button> e autorizo o Instituto Ser Melhor a processar meus dados para fins de doação e emissão de recibos, conforme a LGPD.
                        </div>
                    </label>
                </div>

                <button 
                    type="submit"
                    className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-700 mt-auto flex items-center justify-center gap-2 group"
                >
                    <CreditCard size={20} className="group-hover:scale-110 transition-transform" />
                    Ir para Pagamento Seguro
                </button>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-4 mt-6 grayscale opacity-60">
                    <div className="flex items-center gap-1">
                        <Lock size={12} className="text-gray-600" />
                        <span className="text-[10px] font-bold text-gray-600">SSL ENCRYPTED</span>
                    </div>
                    <div className="h-3 w-px bg-gray-300"></div>
                    <span className="text-[10px] font-bold text-gray-600 tracking-tight">POWERED BY <span className="font-extrabold text-[#635BFF]">STRIPE</span></span>
                </div>
            </form>
        )}
    </div>
  );
};