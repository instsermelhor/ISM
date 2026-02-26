import React from 'react';
import { motion } from 'framer-motion';
import { GovernanceInstanceAttributes, GovernanceMemberAttributes, StrapiItem } from '../../types';
import { Shield, Users, FileCheck, Briefcase, Globe } from 'lucide-react';

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

export const GovernanceStructure: React.FC<GovernanceStructureProps> = ({ intro, instances, members }) => {
  return (
    <section id="governance" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-brand-600">Estrutura de Governança</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Transparência e Integridade
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {intro}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {instances.sort((a, b) => a.attributes.order - b.attributes.order).map((instance) => {
              const Icon = getIconForInstance(instance.attributes.title);
              return (
                <motion.div 
                  key={instance.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand-600">
                      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {instance.attributes.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{instance.attributes.summary}</p>
                    <ul className="mt-4 space-y-2 text-sm text-gray-500">
                      {instance.attributes.keyAttributes.map((attr, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-brand-500">•</span>
                          {attr.attributeText}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </motion.div>
              );
            })}
          </dl>
        </div>

        {/* Members Section (Optional/Legacy support) */}
        {members && members.length > 0 && (
          <div className="mt-24 border-t border-gray-200 pt-24">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Liderança</h3>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member) => (
                <div key={member.id} className="flex flex-col items-center text-center">
                  <img
                    className="h-24 w-24 rounded-full object-cover"
                    src={member.attributes.imageUrl}
                    alt={member.attributes.name}
                  />
                  <h4 className="mt-4 text-lg font-bold text-gray-900">{member.attributes.name}</h4>
                  <p className="text-sm text-brand-600">{member.attributes.role}</p>
                  <p className="mt-2 text-sm text-gray-500">{member.attributes.bio}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
