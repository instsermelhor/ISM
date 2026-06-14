import React, { useRef } from 'react';
import { StrapiItem, TimelineMilestoneAttributes } from '../../types';
import { motion, useInView } from 'framer-motion';
import { TimelineEvent } from '../ui/TimelineEvent';

interface Props {
  milestones: StrapiItem<TimelineMilestoneAttributes>[];
}

export const TimelineSection: React.FC<Props> = ({ milestones }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="history" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center mb-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-100 text-secondary-700 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
            Nossa Trajetória
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900 mb-4 leading-tight">
            Linha do Tempo
          </h2>
          <p className="text-lg text-secondary-500 max-w-xl">
            Uma trajetória de impacto inigualável construída passo a passo.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line (desktop only) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-200 via-brand-400 to-brand-200 transform -translate-x-1/2 hidden md:block pointer-events-none" />

          {/* BUG FIX: passa index ao invés de isEven para componente filho */}
          <div className="space-y-8 md:space-y-2">
            {milestones.map((event, index) => (
              <TimelineEvent
                key={event.id}
                data={event.attributes}
                index={index}
                isLast={index === milestones.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};