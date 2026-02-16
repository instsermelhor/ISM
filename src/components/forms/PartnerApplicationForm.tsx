import React, { useState } from 'react';
import { Send, User, Mail, CheckCircle, Briefcase, Phone, Target, FileText, AlertCircle } from 'lucide-react';
import { PartnerApplicationPayload, PartnerType } from '../../types';
import { InstitutionalService } from '../../services/data';

export const PartnerApplicationForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    // Clear error when user types
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.companyName) return "O nome da organização é obrigatório.";
    if (!formData.contactName) return "O nome do contato é obrigatório.";
    if (!formData.email || !formData.email.includes('@')) return "Insira um e-mail válido.";
    if (!formData.areaOfInterest) return "A área de interesse é obrigatória.";
    if (!consent) return "É obrigatório aceitar a Política de Privacidade.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        return;
    }

    setLoading(true);
    
    try {
      // Prepare payload with current timestamp
      const payload = {
        ...formData,
        submissionDate: new Date().toISOString()
      } as PartnerApplicationPayload;

      await InstitutionalService.submitPartnerApplication(payload);
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError("Falha na comunicação com o servidor. Por favor, tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-xl border border-brand-100 flex flex-col items-center text-center animate-fade-in">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mb-6 shadow-sm">
            <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-secondary-900 mb-4">Solicitação Recebida!</h2>
        <div className="bg-brand-50 border border-brand-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-brand-800 font-medium">Status: <span className="uppercase tracking-wider font-bold">Em Análise</span></p>
        </div>
        <p className="text-gray-600 mb-8 max-w-lg leading-relaxed">
            Agradecemos o interesse em integrar nossa Rede de Colaboração de Elite. Sua proposta para <strong>{formData.companyName}</strong> já está com nossa equipe de Relações Institucionais. Retornaremos em até 48 horas úteis.
        </p>
        <button 
            onClick={() => { setSuccess(false); setFormData({ type: 'Corporativo', status: 'Novo' }); setConsent(false); }}
            className="px-6 py-2 rounded-full border border-brand-200 text-brand-600 font-bold hover:bg-brand-50 transition-colors"
        >
            Nova Solicitação
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>

        <h3 className="text-xl font-bold text-secondary-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
            <Target className="text-brand-500" size={20} />
            Formulário de Aplicação
        </h3>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm animate-pulse">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
            </div>
        )}

        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Parceiro *</label>
                    <div className="relative">
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleChange}
                            className="w-full pl-4 pr-8 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                        >
                            <option value="Corporativo">Corporativo</option>
                            <option value="Institucional/ONG">Institucional / OSC</option>
                            <option value="Pesquisa/Academia">Pesquisa / Academia</option>
                            <option value="Individual">Grande Doador (Individual)</option>
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                            <Briefcase size={16} />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Organização *</label>
                    <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName || ''}
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
                            value={formData.contactName || ''}
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
                        value={formData.contactTitle || ''}
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
                            value={formData.email || ''}
                            placeholder="nome@empresa.com"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Telefone</label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone || ''}
                            placeholder="(XX) XXXXX-XXXX"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Área de Interesse (Sinergia) *</label>
                <input 
                    type="text" 
                    name="areaOfInterest"
                    value={formData.areaOfInterest || ''}
                    placeholder="Ex: Educação, Créditos de Carbono, Governança"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    onChange={handleChange}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Proposta de Contribuição</label>
                <div className="relative">
                    <FileText size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <textarea 
                        name="intendedContribution"
                        value={formData.intendedContribution || ''}
                        rows={4}
                        placeholder="Descreva brevemente como vocês gostariam de colaborar com o Instituto..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
                        onChange={handleChange}
                    ></textarea>
                </div>
            </div>

            {/* LGPD Consent */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-200 transition-colors">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                        <input 
                            type="checkbox" 
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-brand-500 checked:bg-brand-500 transition-all"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                        />
                        <CheckCircle size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed select-none">
                        Concordo com a <strong className="text-secondary-900 cursor-pointer hover:underline">Política de Privacidade</strong>. Autorizo o processamento dos dados para fins de análise de conformidade e contato institucional.
                    </div>
                </label>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-brand-500/30"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Enviando...
                    </>
                ) : (
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