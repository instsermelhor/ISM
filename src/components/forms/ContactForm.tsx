import React, { useState } from 'react';
import { Send, User, Mail, Phone, MessageSquare, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { InstitutionalService } from '../../services/data';

interface ContactFormProps {
  onSuccess?: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    subject: 'Dúvidas e Informações Geral',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) { setError('Nome completo é obrigatório.'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setError('E-mail válido é obrigatório.'); return; }
    if (!form.message.trim() || form.message.length < 5) { setError('Mensagem deve ter pelo menos 5 caracteres.'); return; }
    if (!consent) { setError('Você deve concordar com os Termos de Privacidade LGPD.'); return; }

    setLoading(true);
    setError(null);

    try {
      await InstitutionalService.submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        companyName: form.companyName,
        category: form.companyName ? 'Empresa' : 'PessoaFisica',
        sourceChannel: 'Site',
        subject: form.subject,
        message: form.message,
        interestArea: form.subject,
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch {
      setError('Falha ao enviar mensagem. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-brand-100 text-center animate-fade-in">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mx-auto mb-4">
          <CheckCircle size={36} />
        </div>
        <h3 className="text-2xl font-black text-secondary-900 mb-2">Mensagem Recebida!</h3>
        <p className="text-secondary-500 text-sm mb-6 max-w-sm mx-auto">
          Obrigado pelo contato, <strong className="text-secondary-900">{form.name}</strong>. Nossa equipe acolherá sua solicitação e responderá em breve em <strong className="text-brand-600">{form.email}</strong>.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ name: '', email: '', phone: '', companyName: '', subject: 'Dúvidas e Informações Geral', message: '' });
            setConsent(false);
          }}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          Enviar Nova Mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 relative">
      <h3 className="text-xl font-bold text-secondary-900 mb-2 flex items-center gap-2">
        <MessageSquare size={20} className="text-brand-600" />
        Fale Conosco
      </h3>
      <p className="text-xs text-secondary-400 mb-6">Envie sua dúvida, sugestão ou solicitação de atendimento.</p>

      {error && (
        <div role="alert" className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4 mb-5">
        <div>
          <label htmlFor="contact-name" className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">Nome Completo *</label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact-email" className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">E-mail *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-phone" className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">Telefone / WhatsApp</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">Assunto / Motivo</label>
          <select
            id="contact-subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
          >
            <option value="Dúvidas e Informações Geral">Dúvidas e Informações Geral</option>
            <option value="Proposta de Parceria ou Patrocínio">Proposta de Parceria ou Patrocínio</option>
            <option value="Voluntariado Comunitário">Voluntariado Comunitário</option>
            <option value="Atendimento de Programas Sociais">Atendimento de Programas Sociais</option>
            <option value="Imprensa e Comunicação">Imprensa e Comunicação</option>
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">Sua Mensagem *</label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            value={form.message}
            onChange={handleChange}
            placeholder="Como podemos ajudar você ou sua organização?"
            className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm resize-none"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-secondary-500 leading-relaxed">
              Autorizo o Instituto Ser Melhor a armazenar meus dados para fins de atendimento e resposta conforme a <strong className="text-secondary-800">LGPD</strong>.
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
      >
        {loading ? 'Enviando Mensagem...' : <><Send size={18} /> Enviar Mensagem</>}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-secondary-400">
        <ShieldCheck size={14} className="text-brand-500" />
        <span>Tratamento de Dados Protegido pela LGPD</span>
      </div>
    </form>
  );
};
