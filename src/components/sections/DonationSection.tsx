import React, { useRef } from 'react';
import { Heart } from 'lucide-react';
import { DonationForm } from '../payment/DonationForm';
import { motion, useInView } from 'framer-motion';

export const DonationSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="donate" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary-950 via-secondary-900 to-brand-950" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/15 border border-brand-500/30 rounded-full text-brand-300 font-bold text-xs uppercase tracking-widest mb-5">
            <Heart size={13} fill="currentColor" />
            Apoie Agora
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Fundo de Sustentabilidade<br className="hidden sm:block" />
            <span className="text-gradient-brand"> Perpétua</span>
          </h2>
          <p className="text-secondary-300 max-w-2xl text-lg leading-relaxed">
            Sua doação não é apenas um ato de caridade; é um investimento direto na transformação sistêmica.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/30 flex flex-col md:flex-row min-h-[520px]"
        >
          {/* Left Panel: Impact Context */}
          <div className="md:w-5/12 bg-secondary-900 p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-6 text-white">Seu impacto direto</h3>
              <ul className="space-y-5">
                {[
                  'Financiamento de bolsas para jovens líderes climáticos.',
                  'Proteção de biomas através de tecnologia de monitoramento via satélite.',
                  'Independência total de verbas governamentais.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0 font-black text-xs">
                      {i + 1}
                    </div>
                    <span className="text-secondary-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-8">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                <p className="text-xs text-secondary-400 uppercase font-bold tracking-widest mb-1">Total Arrecadado (2025)</p>
                <p className="text-3xl font-black text-brand-400 mb-3">R$ 12,4M</p>
                <div className="w-full bg-secondary-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-500 to-brand-400 h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-xs text-secondary-500 mt-2">75% da meta 2025</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="md:w-7/12 p-8 md:p-10">
            <DonationForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
};