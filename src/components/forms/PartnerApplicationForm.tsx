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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.companyName?.trim()) return 'O nome da organização é obrigatório.';
    if (!formData.contactName?.trim()) return 'O nome do contato é obrigatório.';
    if (!formData.email || !formData.email.includes('@')) return 'Insira um e-mail válido.';
    if (!formData.areaOfInterest?.trim()) return 'A área de interesse é obrigatória.';
    if (!consent) return 'É obrigatório aceitar a Política de Privacidade.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const payload = { ...formData, submissionDate: new Date().toISOString() } as PartnerApplicationPayload;
      await InstitutionalService.submitPartnerApplication(payload);
      setSuccess(true);
      setError(null);
    } catch {
      setError('Falha na comunicação com o servidor. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-brand-100 flex flex-col items-center text-center animate-fade-in">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mb-6 shadow-sm">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-secondary-900 mb-3">Solicitação Recebida!</h2>
        <div className="bg-brand-50 border border-brand-100 px-4 py-2 rounded-full mb-4">
          <p className="text-xs text-brand-800 font-bold uppercase tracking-widest">Status: Em Análise</p>
        </div>
        <p className="text-secondary-500 mb-8 max-w-sm leading-relaxed text-sm">
          Sua proposta para <strong className="text-secondary-900">{formData.companyName}</strong> está com nossa equipe de Relações Institucionais. Retornaremos em até 48h úteis.
        </p>
        <button
          onClick={() => { setSuccess(false); setFormData({ type: 'Corporativo', status: 'Novo' }); setConsent(false); }}
          className="px-6 py-2.5 rounded-full border border-brand-200 text-brand-600 font-bold text-sm hover:bg-brand-50 transition-colors"
        >
          Nova Solicitação
        </button>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-sm";
  const inputWithIconClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-sm";
  const labelClass = "block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative"
    >
      {/* Accent top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />

      <div className="p-8">
        <h3 className="text-xl font-bold text-secondary-900 mb-6 pb-5 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Target size={16} className="text-white" />
          </div>
          Formulário de Aplicação
        </h3>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de Parceiro *</label>
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="Corporativo">Corporativo</option>
                  <option value="Institucional/ONG">Institucional / OSC</option>
                  <option value="Pesquisa/Academia">Pesquisa / Academia</option>
                  <option value="Individual">Grande Doador (Individual)</option>
                </select>
                <Briefcase size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Organização *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ''}
                placeholder="Nome da Empresa / Instituto"
                className={inputClass}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome do Contato *</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName || ''}
                  placeholder="Seu nome completo"
                  className={inputWithIconClass}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Cargo / Título *</label>
              <input
                type="text"
                name="contactTitle"
                value={formData.contactTitle || ''}
                placeholder="Ex: Diretor de ESG"
                className={inputClass}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>E-mail Corporativo *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  placeholder="nome@empresa.com"
                  className={inputWithIconClass}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  placeholder="(XX) XXXXX-XXXX"
                  className={inputWithIconClass}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Área de Interesse */}
          <div>
            <label className={labelClass}>Área de Interesse *</label>
            <input
              type="text"
              name="areaOfInterest"
              value={formData.areaOfInterest || ''}
              placeholder="Ex: Educação, Créditos de Carbono, Governança"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          {/* Proposta */}
          <div>
            <label className={labelClass}>Proposta de Contribuição</label>
            <div className="relative">
              <FileText size={15} className="absolute left-3.5 top-3.5 text-secondary-400" />
              <textarea
                name="intendedContribution"
                value={formData.intendedContribution || ''}
                rows={4}
                placeholder="Descreva brevemente como gostariam de colaborar com o Instituto..."
                className={`${inputWithIconClass} resize-none pt-3`}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* LGPD Consent */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-brand-200 transition-colors">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex items-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:border-brand-500 checked:bg-brand-500 transition-all"
                  checked={consent}
                  onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setError(null); }}
                />
                <CheckCircle size={13} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
              </div>
              <span className="text-xs text-secondary-500 leading-relaxed select-none">
                Concordo com a <strong className="text-secondary-800">Política de Privacidade</strong> e autorizo o processamento dos dados para fins de análise de conformidade e contato institucional.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-600/25 hover:shadow-brand-700/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={17} />
                Enviar Proposta
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};