import React, { useState } from 'react';
import { StrapiItem, GovernanceMemberAttributes, GovernanceInstanceAttributes } from '../../types';
import { Landmark, Scale, Eye, Briefcase, Globe, CheckCircle2 } from 'lucide-react';

interface Props {
  members: StrapiItem<GovernanceMemberAttributes>[];
  instances: StrapiItem<GovernanceInstanceAttributes>[];
  intro: string;
}

const OrganIconMap: Record<number, React.ReactNode> = {
  1: <Landmark size={24} />, // Assembleia
  2: <Scale size={24} />,    // Conselho Deliberativo
  3: <Eye size={24} />,      // Conselho Fiscal
  4: <Briefcase size={24} />, // Diretoria
  5: <Globe size={24} />,    // Conselho Consultivo
};

type TabId = 'board' | 'executive' | 'advisory' | 'fiscal';

export const GovernanceStructure: React.FC<Props> = ({ members, instances, intro }) => {
  const [activeTab, setActiveTab] = useState<TabId>('board');

  const filteredMembers = members.filter((m) => m.attributes.type === activeTab);
  
  const tabs: { id: TabId; label: string }[] = [
    { id: 'board', label: 'Conselho Deliberativo' },
    { id: 'executive', label: 'Diretoria Executiva' },
    { id: 'fiscal', label: 'Conselho Fiscal' },
    { id: 'advisory', label: 'Conselho Consultivo Global' },
  ];

  return (
    <section id="governance" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Intro Section (Single Type Data) */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            Estrutura Institucional
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6">
            Governança: O Padrão Ouro
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {intro}
          </p>
        </div>

        {/* Governance Instances (Collection Type Data) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {instances.sort((a,b) => a.attributes.order - b.attributes.order).map((inst) => (
            <div 
              key={inst.id} 
              className={`p-8 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-xl transition-all duration-300 bg-white group ${
                inst.attributes.order > 3 ? 'lg:col-span-1.5' : ''
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-secondary-50 text-secondary-800 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  {OrganIconMap[inst.attributes.order] || <Landmark />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-secondary-900 leading-tight">{inst.attributes.title}</h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 text-sm leading-relaxed min-h-[60px]">
                {inst.attributes.summary}
              </p>

              <ul className="space-y-3">
                {inst.attributes.keyAttributes.map((attr, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                    <CheckCircle2 size={16} className="text-brand-500 shrink-0 mt-0.5" />
                    <span>{attr.attributeText}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Leadership Team Section */}
        <div className="border-t border-gray-100 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">Liderança Global</h3>
              <p className="text-gray-500">As pessoas que materializam nossa visão de excelência.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-brand-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div key={member.id} className="group relative overflow-hidden rounded-xl bg-gray-50">
                  <div className="aspect-[4/5] w-full overflow-hidden bg-gray-200">
                    <img
                      src={member.attributes.imageUrl}
                      alt={member.attributes.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/40 to-transparent opacity-90 transition-opacity flex flex-col justify-end p-6 text-white">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-brand-400 text-xs font-bold uppercase mb-1 tracking-wider">{member.attributes.role}</p>
                      <h3 className="text-xl font-bold mb-2">{member.attributes.name}</h3>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 py-12 text-center text-gray-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                <p>Nenhum membro listado.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};