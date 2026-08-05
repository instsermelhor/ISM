import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { GovernanceInstanceAttributes, GovernanceMemberAttributes } from '../../types';
import {
  Shield, Users, FileCheck, Briefcase, Globe, CheckCircle, ExternalLink,
  Linkedin, Instagram, Facebook, Twitter, Youtube, BookOpen, Award, FileText, Star
} from 'lucide-react';
import { MemberModal } from './MemberModal';

interface GovernanceStructureProps {
  intro: string;
  instances: GovernanceInstanceAttributes[];
  members: GovernanceMemberAttributes[];
}

const getIconForInstance = (title: string) => {
  if (title.includes('Assembleia')) return Users;
  if (title.includes('Deliberativo')) return Shield;
  if (title.includes('Fiscal')) return FileCheck;
  if (title.includes('Executiva')) return Briefcase;
  if (title.includes('Consultivo')) return Globe;
  return Shield;
};

const instanceColors = [
  'from-brand-600 to-brand-700',
  'from-secondary-700 to-secondary-800',
  'from-blue-600 to-blue-700',
  'from-purple-600 to-purple-700',
  'from-orange-500 to-orange-600',
];

const CATEGORY_LABELS: Record<string, string> = {
  DIRETORIA_EXECUTIVA: 'Diretoria Executiva',
  CONSELHO_DELIBERATIVO: 'Conselho Deliberativo',
  CONSELHO_FISCAL: 'Conselho Fiscal',
  CONSELHO_CONSULTIVO: 'Conselho Consultivo',
  COORDENACAO: 'Coordenação',
  EQUIPE_TECNICA: 'Equipe Técnica',
  CONSULTOR: 'Consultores',
  VOLUNTARIO: 'Voluntários',
  OUTRO: 'Outros',
};

export const GovernanceStructure: React.FC<GovernanceStructureProps> = ({ intro, instances = [], members = [] }) => {
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true, margin: '-80px' });
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [modalMember, setModalMember] = useState<GovernanceMemberAttributes | null>(null);

  const safeInstances = Array.isArray(instances) ? instances : [];
  const safeMembers = Array.isArray(members) ? members : [];

  const sortedInstances = [...safeInstances].sort((a, b) => {
    const aOrder = a?.order ?? 0;
    const bOrder = b?.order ?? 0;
    return aOrder - bOrder;
  });

  // Extrai lista de membros garantindo consumo do modelo direto
  const unrolledMembers: (GovernanceMemberAttributes & { id?: string })[] = safeMembers.map((m: any) => {
    return { ...m, id: m?.id };
  }).filter(m => m.isPublished !== false && m.status !== 'DRAFT' && m.status !== 'ARCHIVED');

  const categoriesInUse = Array.from(new Set(unrolledMembers.map(m => m.category).filter(Boolean))) as string[];

  const filteredMembers = unrolledMembers.filter(m => {
    if (selectedCategory === 'ALL') return true;
    return m.category === selectedCategory;
  }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section id="governance" className="bg-slate-50 py-12 md:py-20 section-pattern overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            Estrutura de Governança & Liderança
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900 mb-5 leading-tight">
            Transparência &{' '}
            <span className="text-gradient-brand">Integridade</span>
          </h2>
          <p className="text-lg text-secondary-500 leading-relaxed">{intro}</p>
        </motion.div>

        {/* Instâncias de Governança */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedInstances.map((instance, index) => {
            const title = instance.title || '';
            const order = instance.order ?? (index + 1);
            const summary = instance.summary || '';
            const keyAttrs: any[] = Array.isArray(instance.keyAttributes) ? instance.keyAttributes : [];
            const Icon = getIconForInstance(title);
            const gradient = instanceColors[index % instanceColors.length];
            return (
              <motion.div
                key={instance?.id || index}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`bg-gradient-to-r ${gradient} p-6`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white shrink-0">
                      <Icon size={22} />
                    </div>
                    <div>
                      <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                        Instância {String(order).padStart(2, '0')}
                      </span>
                      <h3 className="text-white font-bold text-base leading-tight mt-0.5">
                        {title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-secondary-600 text-sm leading-relaxed mb-5">
                    {summary}
                  </p>
                  <ul className="space-y-2.5">
                    {keyAttrs.map((attr, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-secondary-500">
                        <CheckCircle size={15} className="text-brand-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{attr?.attributeText || attr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Seção Nossa Liderança & Equipe */}
        {unrolledMembers.length > 0 && (
          <div className="mt-24 pt-16 border-t border-gray-200">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h3 className="text-3xl md:text-4xl font-black text-secondary-900 mb-3">
                Nossa Liderança
              </h3>
              <p className="text-sm md:text-base text-secondary-500 max-w-xl mx-auto">
                Conheça os profissionais e conselheiros dedicados a direcionar o propósito e garantir a integridade da nossa atuação.
              </p>

              {/* Filtro por Categorias */}
              {categoriesInUse.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ALL')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === 'ALL'
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        : 'bg-white text-secondary-600 border border-gray-200 hover:bg-slate-100'
                    }`}
                  >
                    Todos ({unrolledMembers.length})
                  </button>
                  {categoriesInUse.map(cat => {
                    const count = unrolledMembers.filter(m => m.category === cat).length;
                    const label = CATEGORY_LABELS[cat] || cat.replace(/_/g, ' ');
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                            : 'bg-white text-secondary-600 border border-gray-200 hover:bg-slate-100'
                        }`}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Grid de Cards Compactos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
              {filteredMembers.map((member, i) => {
                const mName = member.name || 'Integrante';
                const mRole = member.shortRole || member.role || 'Cargo';
                const mBio = member.bio || member.shortBio || '';
                const mCategoryLabel = member.category ? (CATEGORY_LABELS[member.category] || member.category.replace(/_/g, ' ')) : null;

                const socialLinks = [
                  { href: member.linkedinUrl, label: 'LinkedIn', icon: Linkedin },
                  { href: member.instagramUrl, label: 'Instagram', icon: Instagram },
                  { href: member.facebookUrl, label: 'Facebook', icon: Facebook },
                  { href: member.twitterUrl, label: 'X / Twitter', icon: Twitter },
                  { href: member.youtubeUrl, label: 'YouTube', icon: Youtube },
                  { href: member.lattesUrl, label: 'Currículo Lattes', icon: BookOpen },
                  { href: member.orcidUrl, label: 'ORCID', icon: Award },
                  { href: member.websiteUrl, label: 'Website Pessoal', icon: Globe },
                ].filter(l => Boolean(l.href && l.href.startsWith('https://')));

                return (
                  <motion.div
                    key={member.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
                    className="flex flex-col items-center text-center bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group"
                  >
                    {/* Badge Destaque */}
                    {member.isFeatured && (
                      <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star size={10} className="fill-amber-500 text-amber-500" />
                        Destaque
                      </span>
                    )}

                    {/* Foto Oficial com Lazy Loading & ALT Obrigatório */}
                    <div className="relative mb-4 mt-2">
                      {member.imageUrl ? (
                        <img
                          className="h-28 w-28 rounded-2xl object-cover shadow-md border-2 border-slate-100 group-hover:scale-105 transition-transform duration-300"
                          src={member.imageUrl}
                          alt={member.imageAlt || mName}
                          loading="lazy"
                          onError={(e) => {
                            // Oculta a img com erro; o avatar de inicial fica visível abaixo
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        /* Avatar de inicial — sem dependência externa */
                        <div
                          className="h-28 w-28 rounded-2xl shadow-md border-2 border-slate-100 bg-secondary-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                          aria-label={`Foto de ${mName} não disponível`}
                        >
                          <span className="text-4xl font-black text-white select-none">
                            {mName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center shadow-sm">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    </div>

                    {/* Categoria Badge */}
                    {mCategoryLabel && (
                      <span className="text-[10px] font-extrabold text-brand-600 uppercase tracking-widest mb-1">
                        {mCategoryLabel}
                      </span>
                    )}

                    {/* Nome & Cargo */}
                    <h4 className="text-base font-extrabold text-secondary-900 mb-1 leading-snug line-clamp-1">
                      {mName}
                    </h4>
                    <p className="text-xs font-bold text-brand-700 mb-2 leading-tight line-clamp-1">
                      {mRole}
                    </p>

                    {/* Biografia Resumida */}
                    <p className="text-xs text-secondary-500 mb-4 leading-relaxed line-clamp-2 font-normal flex-1">
                      {mBio}
                    </p>

                    {/* Redes Sociais com links HTTPS dinâmicos */}
                    {socialLinks.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                        {socialLinks.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${s.label} de ${mName} (abre em nova aba)`}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-brand-600 hover:text-white text-secondary-600 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <s.icon size={13} />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Botão Saiba Mais */}
                    <button
                      type="button"
                      onClick={() => setModalMember(member)}
                      className="w-full py-2.5 px-4 bg-secondary-900 hover:bg-brand-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <span>Saiba Mais</span>
                      <ExternalLink size={12} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal de Perfil Completo */}
        <MemberModal
          member={modalMember}
          onClose={() => setModalMember(null)}
        />
      </div>
    </section>
  );
};
