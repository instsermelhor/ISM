import React from 'react';
import { motion } from 'framer-motion';
import { InstitutionalPageAttributes } from '../../types';

interface HeroInstitutionalProps {
  data: InstitutionalPageAttributes;
}

export const HeroInstitutional: React.FC<HeroInstitutionalProps> = ({ data }) => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-secondary-900 text-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={data.heroImage} 
          alt="Hero Background" 
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/80 via-secondary-900/50 to-secondary-900" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {data.title}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 sm:text-xl md:text-2xl">
            {data.introduction}
          </p>
          
          {/* Motto */}
          <div className="mt-12 inline-block rounded-full border border-white/10 bg-white/5 px-6 py-2 backdrop-blur-sm">
            <span className="font-serif text-xl italic text-brand-400">"{data.motto}"</span>
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-sm text-gray-300">{data.mottoExplanation}</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-gray-500">Explore</span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-brand-500 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
};
