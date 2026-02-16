import React, { useState } from 'react';
import { Send, User, Mail, CheckCircle } from 'lucide-react';
import { PartnerApplicationPayload } from '../../types';
import { InstitutionalService } from '../../services/data';

export const PartnerApplicationForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [consent, setConsent] = useState(false);
  
  const [formData, setFormData] = useState<Partial<PartnerApplicationPayload>>({
    type: 'Corporativo',
    status: 'Novo',
    submissionDate: new Date().toISOString()
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consent) {
        alert("Para prosseguir, é obrigatório aceitar a Política de Privacidade.");
        return;
    }

    setLoading(true);
    
    try {
      await InstitutionalService.submitPartnerApplication({
          ...formData,
          consentLGPD: consent
      } as PartnerApplicationPayload);
      setSuccess(true);
    } catch (error) {
      alert("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-xl border border-brand-100 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mb-6">
            <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-secondary-900 mb-4">Solicitação Enviada!</h2>
        <p className="text-gray-600 mb-8 max-w-lg">
            Agradecemos o interesse em fazer parte da nossa Rede de Colaboração de Elite. Nossa equipe de Relações Institucionais analisará sua proposta e entrará em contato em até 48 horas úteis.
        </p>
        <button 
            onClick={() => { setSuccess(false); setFormData({}); setConsent(false); }}
            className="text-brand-600 font-bold hover:underline"
        >
            Enviar nova solicitação
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-secondary-900 mb-6 border-b border-gray-200 pb-4">
            Formulário de Aplicação
        </h3>

        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Parceiro *</label>
                    <select 
                        name="type" 
                        value={formData.type} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="Corporativo">Corporativo</option>
                        <option value="Institucional/ONG">Institucional / ONG</option>
                        <option value="Pesquisa/Academia">Pesquisa / Academia</option>
                        <option value="Individual">Grande Doador (Individual)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Organização *</label>
                    <input 
                        type="text" 
                        name="companyName"
                        required
                        placeholder="Nome da Empresa/Instituto"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Contato *</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                            type="text" 
                            name="contactName"
                            required
                            placeholder="Seu nome completo"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cargo / Título *</label>
                    <input 
                        type="text" 
                        name="contactTitle"
                        required
                        placeholder="Ex: Diretor de ESG"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">E-mail Corporativo *</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                            type="email" 
                            name="email"
                            required
                            placeholder="nome@empresa.com"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Telefone</label>
                    <input 
                        type="tel" 
                        name="phone"
                        placeholder="(XX) XXXXX-XXXX"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Área de Interesse *</label>
                <input 
                    type="text" 
                    name="areaOfInterest"
                    required
                    placeholder="Ex: Educação, Carbono Zero, Tecnologia Social"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    onChange={handleChange}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Proposta Inicial</label>
                <textarea 
                    name="intendedContribution"
                    rows={4}
                    placeholder="Descreva brevemente como vocês gostariam de colaborar com o Instituto..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
                    onChange={handleChange}
                ></textarea>
            </div>

             {/* LGPD Consent Section */}
             <div className="p-4 bg-white rounded-xl border border-gray-200">
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
                        Li e concordo com os <strong className="text-secondary-900">Termos de Uso</strong> e a <strong className="text-brand-600">Política de Privacidade</strong>. Autorizo o processamento dos dados para análise de parceria.
                    </div>
                </label>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? 'Enviando...' : (
                    <>
                        <Send size={18} />
                        Enviar Proposta
                    </>
                )}
            </button>
        </div>
    </form>
  );
};