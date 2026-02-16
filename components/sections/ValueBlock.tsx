import React from 'react';
import { StrapiItem, ValueBlockAttributes } from '../../types';
import { Shield, Users, Heart, Zap, Star, Infinity, LucideIcon } from 'lucide-react';

interface Props {
  values: StrapiItem<ValueBlockAttributes>[];
}

const IconMap: Record<string, LucideIcon> = {
  shield: Shield,
  users: Users,
  heart: Heart,
  zap: Zap,
  star: Star,
  infinity: Infinity,
  diamond: Star // Fallback alias
};

export const ValueBlock: React.FC<Props> = ({ values }) => {
  return (
    <section id="values" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">Nossos Princípios Inegociáveis</h2>
          <p className="text-gray-600">
            Os pilares éticos e comportamentais que sustentam nossa posição de liderança.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
          {values.map((item) => {
            const { attributes } = item;
            const Icon = IconMap[attributes.iconIdentifier] || Heart;
            return (
              <div 
                key={item.id} 
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border border-slate-100 flex flex-col items-start"
              >
                <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-sm">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">{attributes.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {attributes.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};