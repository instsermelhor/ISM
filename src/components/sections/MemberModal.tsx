/**
 * MemberModal.tsx
 * ────────────────
 * Modal acessível (WCAG 2.1 AA) para exibir o perfil completo de um integrante da liderança.
 * Exibe biografia detalhada, formação acadêmica, especializações, experiência, redes sociais
 * e links institucionais/currículo com validação e controle de privacidade LGPD.
 */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Linkedin, Instagram, Facebook, Twitter, Youtube, Globe,
  BookOpen, Award, FileText, Mail, Phone, CheckCircle2, ExternalLink
} from 'lucide-react';
import { GovernanceMemberAttributes } from '../../types';

interface Props {
  member: GovernanceMemberAttributes | null;
  onClose: () => void;
}

export const MemberModal: React.FC<Props> = ({ member, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (member) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [member, onClose]);

  if (!member) return null;

  const m = member;
  const mName = m.name || 'Integrante';
  const modalId = `member-modal-${m.id || mName.toLowerCase().replace(/\s+/g, '-')}`;

  const socialLinks = [
    { href: m.linkedinUrl, label: 'LinkedIn', icon: Linkedin },
    { href: m.instagramUrl, label: 'Instagram', icon: Instagram },
    { href: m.facebookUrl, label: 'Facebook', icon: Facebook },
    { href: m.twitterUrl, label: 'X / Twitter', icon: Twitter },
    { href: m.youtubeUrl, label: 'YouTube', icon: Youtube },
    { href: m.lattesUrl, label: 'Currículo Lattes', icon: BookOpen },
    { href: m.orcidUrl, label: 'ORCID', icon: Award },
    { href: m.researchGateUrl, label: 'ResearchGate', icon: FileText },
    { href: m.websiteUrl, label: 'Website Pessoal', icon: Globe },
    { href: m.resumeUrl, label: 'Currículo Institucional', icon: ExternalLink },
  ].filter(l => Boolean(l.href && l.href.startsWith('https://')));

  const expertiseList = Array.isArray(m.expertise)
    ? m.expertise
    : (typeof m.expertise === 'string' ? (m.expertise as string).split(',').map(s => s.trim()).filter(Boolean) : []);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${modalId}-title`}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                {m.category ? m.category.replace(/_/g, ' ') : 'Perfil Institucional'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal de perfil"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-6">
            {/* Top Profile Summary */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Photo */}
              <div className="relative shrink-0">
                <img
                  src={m.imageUrl}
                  alt={m.imageAlt || mName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-lg border-2 border-slate-100"
                />
                {m.isFeatured && (
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-xl shadow-md" title="Integrante em Destaque">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>

              {/* Identity & Main Role */}
              <div className="flex-1 space-y-2">
                <h3 id={`${modalId}-title`} className="text-2xl sm:text-3xl font-extrabold text-secondary-900 leading-tight">
                  {mName}
                </h3>
                {m.socialName && (
                  <p className="text-xs text-secondary-400 font-medium">
                    Nome Social: {m.socialName}
                  </p>
                )}
                <p className="text-base font-bold text-brand-600 leading-snug">
                  {m.role}
                </p>
                {m.area && (
                  <p className="text-xs text-secondary-500 font-medium">
                    Área: <span className="text-secondary-700 font-semibold">{m.area}</span>
                  </p>
                )}

                {/* Social links row */}
                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                    {socialLinks.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${s.label} de ${mName} (abre em nova aba)`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-secondary-700 text-xs font-semibold transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <s.icon size={14} className="shrink-0 text-brand-600" />
                        <span>{s.label}</span>
                        <ExternalLink size={10} className="opacity-50" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Complete Bio */}
            <div className="space-y-2 border-t border-gray-100 pt-5">
              <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                Biografia Institucional
              </h4>
              <div className="text-sm text-secondary-700 leading-relaxed space-y-3 font-normal">
                {(m.fullBio || m.bio).split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Academic Formation & Experience Grid */}
            {(m.academicFormation || m.specializations || m.certifications || m.experience) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
                {m.academicFormation && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                    <h5 className="text-xs font-bold text-secondary-900 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-brand-600" />
                      Formação Acadêmica
                    </h5>
                    <p className="text-xs text-secondary-600 leading-relaxed font-medium">
                      {m.academicFormation}
                    </p>
                  </div>
                )}

                {m.specializations && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                    <h5 className="text-xs font-bold text-secondary-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={14} className="text-brand-600" />
                      Especializações
                    </h5>
                    <p className="text-xs text-secondary-600 leading-relaxed font-medium">
                      {m.specializations}
                    </p>
                  </div>
                )}

                {m.certifications && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                    <h5 className="text-xs font-bold text-secondary-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} className="text-brand-600" />
                      Certificações
                    </h5>
                    <p className="text-xs text-secondary-600 leading-relaxed font-medium">
                      {m.certifications}
                    </p>
                  </div>
                )}

                {m.experience && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                    <h5 className="text-xs font-bold text-secondary-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-brand-600" />
                      Trajetória Profissional
                    </h5>
                    <p className="text-xs text-secondary-600 leading-relaxed font-medium">
                      {m.experience}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Expertise Tags */}
            {expertiseList.length > 0 && (
              <div className="border-t border-gray-100 pt-5 space-y-2">
                <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                  Áreas de Expertise & Atuação
                </h4>
                <div className="flex flex-wrap gap-2">
                  {expertiseList.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-brand-50 text-brand-800 border border-brand-200/60 rounded-xl text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Public Contact (LGPD Protected) */}
            {m.showPublicContact && (m.email || m.phone) && (
              <div className="border-t border-gray-100 pt-5 space-y-2 bg-brand-50/50 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                  Contato Institucional Autorizado
                </h4>
                <div className="flex flex-wrap gap-4 text-xs text-secondary-700">
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                      <Mail size={14} /> {m.email}
                    </a>
                  )}
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                      <Phone size={14} /> {m.phone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-secondary-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-secondary-800 transition-colors cursor-pointer"
            >
              Fechar Perfil
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
