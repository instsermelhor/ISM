import React from 'react';
import { StrapiItem, TimelineMilestoneAttributes } from '../../types';
import { History } from 'lucide-react';
import { TimelineEvent } from '../ui/TimelineEvent';

interface Props {
  milestones: StrapiItem<TimelineMilestoneAttributes>[];
}

export const TimelineSection: React.FC<Props> = ({ milestones }) => {
  return (
    <section id="history" className="py-24 bg-white relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute left-0 top-0 text-[20rem] font-bold text-gray-50 opacity-30 select-none -z-10 leading-none">
        2007
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-20 text-center">
            <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mb-4">
                <History size={24} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-secondary-900 mb-4">
                Linha do Tempo Estratégica
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
                Uma trajetória de impacto inigualável.
            </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Central Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 via-brand-500 to-brand-200 transform md:-translate-x-1/2"></div>

          <div className="space-y-12">
            {milestones.map((event, index) => {
              const isEven = index % 2 === 0;
              const isLast = index === milestones.length - 1;

              return (
                <TimelineEvent 
                    key={event.id}
                    data={event.attributes}
                    isEven={isEven}
                    isLast={isLast}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};