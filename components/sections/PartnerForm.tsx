import React, { useState } from 'react';
import { Handshake, Building2, User, Mail, Send, CheckCircle } from 'lucide-react';
import { PartnerApplicationPayload, PartnerType } from '../../types';
import { InstitutionalService } from '../../services/data';

export const PartnerForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
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
    setLoading(true);
    
    try {
      await InstitutionalService.submitPartnerApplication(formData as PartnerApplicationPayload);
      setSuccess(true);
    } catch (error) {
      alert("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section id="partner" className="py-24 bg-brand-50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-white p-12 rounded-2xl shadow-xl border border-brand-100 flex flex-col items-center">
                <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-4">Solicitação Enviada!</h2>
                <p className="text-gray-600 mb-8 max-w-lg">
                    Agradecemos o interesse em fazer parte da nossa Rede de Colaboração de Elite. Nossa equipe de Relações Institucionais analisará sua proposta e entrará em contato em até 48 horas úteis.
                </p>
                <button 
                    onClick={() => { setSuccess(false); setFormData({}); }}
                    className="text-brand-600 font-bold hover:underline"
                >
                    Enviar nova solicitação
                </button>
            </div>
        </div>
      </section>
    );
  }

  return (
    <section id="partner" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            {/* Left Column: Copy */}
            <div className="lg:w-1/2 sticky top-24">
                <div className="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                    Seja Parceiro
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6 leading-tight">
                    Construa o Futuro Conosco
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Buscamos alianças estratégicas com organizações e líderes que compartilham nossa visão de excelência inflexível. Junte-se à nossa Rede de Colaboração de Elite (R-CE) e amplifique seu impacto ESG.
                </p>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-secondary-700 shrink-0">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-secondary-900">Parcerias Corporativas</h4>
                            <p className="text-sm text-gray-500">Desenvolvimento de projetos customizados e voluntariado executivo.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-secondary-700 shrink-0">
                            <Handshake size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-secondary-900">Cooperação Técnica</h4>
                            <p className="text-sm text-gray-500">Intercâmbio de expertise com Universidades, Academias e Institutos de pesquisa.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:w-1/2 w-full">
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
                                    <option value="Institucional/ONG">Institucional / OSC</option>
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
            </div>

        </div>
      </div>
    </section>
  );
};