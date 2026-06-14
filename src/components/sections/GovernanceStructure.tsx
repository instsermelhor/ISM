import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GovernanceInstanceAttributes, GovernanceMemberAttributes, StrapiItem } from '../../types';
import { Shield, Users, FileCheck, Briefcase, Globe, CheckCircle } from 'lucide-react';

interface GovernanceStructureProps {
  intro: string;
  instances: StrapiItem<GovernanceInstanceAttributes>[];
  members: StrapiItem<GovernanceMemberAttributes>[];
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

export const GovernanceStructure: React.FC<GovernanceStructureProps> = ({ intro, instances, members }) => {
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true, margin: '-80px' });

  const sorted = [...instances].sort((a, b) => a.attributes.order - b.attributes.order);

  return (
    <section id="governance" className="bg-slate-50 py-24 sm:py-32 section-pattern overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            Estrutura de Governança
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900 mb-5 leading-tight">
            Transparência &{' '}
            <span className="text-gradient-brand">Integridade</span>
          </h2>
          <p className="text-lg text-secondary-500 leading-relaxed">{intro}</p>
        </motion.div>

        {/* BUG FIX: grid 2→3 colunas para 5 itens sem layout quebrado */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sorted.map((instance, index) => {
            const Icon = getIconForInstance(instance.attributes.title);
            const gradient = instanceColors[index % instanceColors.length];
            return (
              <motion.div
                key={instance.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card header gradient */}
                <div className={`bg-gradient-to-r ${gradient} p-6`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white shrink-0">
                      <Icon size={22} />
                    </div>
                    <div>
                      <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                        Instância {String(instance.attributes.order).padStart(2, '0')}
                      </span>
                      <h3 className="text-white font-bold text-base leading-tight mt-0.5">
                        {instance.attributes.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <p className="text-secondary-600 text-sm leading-relaxed mb-5">
                    {instance.attributes.summary}
                  </p>
                  <ul className="space-y-2.5">
                    {instance.attributes.keyAttributes.map((attr, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-secondary-500">
                        <CheckCircle size={15} className="text-brand-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{attr.attributeText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Members Section */}
        {members && members.length > 0 && (
          <div className="mt-24 pt-16 border-t border-gray-200">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-black text-secondary-900 text-center mb-12"
            >
              Nossa Liderança
            </motion.h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 justify-center max-w-2xl mx-auto">
              {members.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative mb-5">
                    <img
                      className="h-24 w-24 rounded-2xl object-cover shadow-md"
                      src={member.attributes.imageUrl}
                      alt={member.attributes.name}
                    />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-secondary-900 mb-1">{member.attributes.name}</h4>
                  <p className="text-sm font-semibold text-brand-600 mb-2">{member.attributes.role}</p>
                  <p className="text-sm text-secondary-400">{member.attributes.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
