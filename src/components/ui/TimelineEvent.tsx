import React, { useRef } from 'react';
import { TimelineMilestoneAttributes } from '../../types';
import { motion, useInView } from 'framer-motion';
import { Flag, Rocket, Award, TrendingUp, Zap } from 'lucide-react';

interface Props {
  data: TimelineMilestoneAttributes;
  index: number;
  isLast: boolean;
}

const milestoneIcons = [Rocket, Award, TrendingUp, Zap, Flag];

export const TimelineEvent: React.FC<Props> = ({ data, index, isLast }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const isEven = index % 2 === 0;
  const Icon = milestoneIcons[index % milestoneIcons.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.6) }}
    >
      {/* ── Desktop: layout alternado esquerda/direita ── */}
      <div className="relative hidden md:grid grid-cols-[1fr_auto_1fr] items-start gap-0">
        {/* Coluna esquerda */}
        <div className={`py-4 pr-8 ${isEven ? 'flex justify-end' : ''}`}>
          {isEven && (
            <div className="max-w-sm">
              <EventCard data={data} isLast={isLast} Icon={Icon} />
            </div>
          )}
        </div>

        {/* Centro: ícone + ano */}
        <div className="flex flex-col items-center">
          <div
            className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
              isLast
                ? 'bg-brand-600 shadow-brand-600/40 animate-glow'
                : 'bg-secondary-800'
            }`}
          >
            <Icon size={20} className="text-white" />
          </div>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-black ${isLast ? 'bg-brand-100 text-brand-700' : 'bg-secondary-100 text-secondary-700'}`}>
            {data.year}
          </div>
        </div>

        {/* Coluna direita */}
        <div className={`py-4 pl-8 ${!isEven ? 'flex justify-start' : ''}`}>
          {!isEven && (
            <div className="max-w-sm">
              <EventCard data={data} isLast={isLast} Icon={Icon} />
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile: layout linear — ícone + card empilhados ── */}
      <div className="md:hidden flex gap-4 items-start px-2 pb-6">
        {/* Ícone */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
              isLast ? 'bg-brand-600' : 'bg-secondary-800'
            }`}
          >
            <Icon size={18} className="text-white" />
          </div>
          <div className={`mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap ${isLast ? 'bg-brand-100 text-brand-700' : 'bg-secondary-100 text-secondary-600'}`}>
            {data.year}
          </div>
          {!isLast && <div className="w-px flex-1 mt-2 bg-gray-200 min-h-[24px]" />}
        </div>

        {/* Card */}
        <div className="flex-1 min-w-0 pt-1">
          <EventCard data={data} isLast={isLast} Icon={Icon} />
        </div>
      </div>
    </motion.div>
  );
};

const EventCard = ({ data, isLast, Icon }: { data: TimelineMilestoneAttributes; isLast: boolean; Icon: React.ElementType }) => (
  <div
    className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
      isLast
        ? 'bg-brand-50 border-brand-200 hover:border-brand-400'
        : 'bg-white border-gray-100 hover:border-gray-200'
    }`}
  >
    <h3 className="text-lg font-bold text-secondary-900 mb-2 leading-tight">
      {data.title}
    </h3>
    <p className="text-sm text-secondary-500 leading-relaxed">
      {data.impactDescription}
    </p>
    {isLast && (
      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest">
        <Flag size={12} />
        <span>Marco Atual</span>
      </div>
    )}
  </div>
);