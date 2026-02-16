import React from 'react';
import { StrapiItem, ValueBlockAttributes } from '../../types';
import { ValueCard } from '../ui/ValueCard';

interface Props {
  values: StrapiItem<ValueBlockAttributes>[];
}

export const ValueBlock: React.FC<Props> = ({ values }) => {
  return (
    <section id="values" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6">Nossos Princípios Inegociáveis</h2>
          <p className="text-xl text-gray-600 font-light">
            Os pilares éticos e comportamentais que sustentam nossa posição de liderança inquestionável.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {values.map((item) => (
            <div 
              key={item.id} 
              className="w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] min-w-[280px] flex"
            >
              <ValueCard data={item.attributes} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};