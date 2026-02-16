import React, { useState } from 'react';
import { Heart, Lock, Calendar, CreditCard, RefreshCcw } from 'lucide-react';
import { InstitutionalService } from '../../services/data';

type Step = 'select' | 'details' | 'processing' | 'success';
type Frequency = 'Única' | 'Mensal';

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

export const DonationForm: React.FC = () => {
  const [step, setStep] = useState<Step>('select');
  const [frequency, setFrequency] = useState<Frequency>('Mensal');
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  const [donorDetails, setDonorDetails] = useState({
    name: '',
    email: '',
    taxId: ''
  });

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setAmount(val);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    try {
      await InstitutionalService.processDonation({
        amount,
        currency: 'BRL',
        type: frequency,
        donorName: donorDetails.name,
        donorEmail: donorDetails.email,
        taxId: donorDetails.taxId
      });
      setStep('success');
    } catch (error) {
      alert("Erro ao processar doação.");
      setStep('details');
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-brand-900 text-white p-8 rounded-2xl text-center h-full flex flex-col justify-center items-center">
        <div className="w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center text-white mb-6 animate-bounce">
            <Heart size={48} fill="currentColor" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Obrigado pelo seu apoio!</h2>
        <p className="text-xl text-brand-100 mb-8">
            Sua contribuição de <strong>R$ {amount},00 ({frequency})</strong> ajuda a garantir a perenidade de nossa missão. Um recibo foi enviado para {donorDetails.email}.
        </p>
        <button 
            onClick={() => setStep('select')}
            className="bg-white text-brand-900 font-bold px-8 py-3 rounded-full hover:bg-brand-100 transition-colors"
        >
            Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full">
        {step === 'processing' ? (
            <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center z-20">
                <RefreshCcw size={48} className="text-brand-600 animate-spin mb-4" />
                <p className="text-lg font-bold text-gray-600">Processando transação segura...</p>
            </div>
        ) : null}

        {step === 'select' ? (
            <div className="animate-fade-in">
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
                    className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-700 hover:scale-[1.02] transition-all"
                >
                    Continuar com R$ {amount}
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <Lock size={12} />
                    <span>Pagamento 100% seguro e criptografado</span>
                </div>
            </div>
        ) : (
            <form onSubmit={handleDonate} className="animate-fade-in h-full flex flex-col">
                <div className="mb-6">
                    <button 
                        type="button" 
                        onClick={() => setStep('select')}
                        className="text-sm text-gray-500 hover:text-brand-600 font-bold mb-4"
                    >
                        &larr; Alterar valor
                    </button>
                    <h3 className="text-2xl font-bold text-secondary-900">Seus dados</h3>
                    <p className="text-sm text-gray-500">Para emissão do recibo fiscal.</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            value={donorDetails.name}
                            onChange={(e) => setDonorDetails({...donorDetails, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                        <input 
                            type="email" 
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            value={donorDetails.email}
                            onChange={(e) => setDonorDetails({...donorDetails, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF (Opcional)</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            value={donorDetails.taxId}
                            onChange={(e) => setDonorDetails({...donorDetails, taxId: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-700 mt-auto flex items-center justify-center gap-2"
                >
                    <CreditCard size={20} />
                    Pagar R$ {amount}
                </button>
            </form>
        )}
    </div>
  );
};