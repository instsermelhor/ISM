import React from 'react';
import { StrapiItem, ValueBlockAttributes } from '../../types';
import { ValueBlock } from '../ui/ValueBlock';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Props {
  values: StrapiItem<ValueBlockAttributes>[];
}

export const ValuesSection: React.FC<Props> = ({ values }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="values" className="py-24 bg-slate-50 section-pattern">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            Nossos Pilares
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900 mb-5 leading-tight">
            Princípios <span className="text-gradient-brand">Inegociáveis</span>
          </h2>
          <p className="text-xl text-secondary-500 font-light leading-relaxed">
            Os pilares éticos e comportamentais que sustentam nossa posição de liderança.
          </p>
        </motion.div>

        {/* BUG FIX: grid 2x2 para 4 itens, sem card orfão desalinhado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {values.map((item, index) => (
            <ValueBlock key={item.id} data={item.attributes} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};