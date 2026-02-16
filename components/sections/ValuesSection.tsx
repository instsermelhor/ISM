import React from 'react';
import { StrapiItem, ValueBlockAttributes } from '../../types';
import { ValueCard } from '../ui/ValueCard';

interface Props {
  values: StrapiItem<ValueBlockAttributes>[];
}

export const ValuesSection: React.FC<Props> = ({ values }) => {
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
          {values.map((item) => (
            <ValueCard key={item.id} data={item.attributes} />
          ))}
        </div>
      </div>
    </section>
  );
};