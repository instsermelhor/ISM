import React from 'react';
import { StrapiItem, TimelineMilestoneAttributes } from '../../types';
import { Flag, History } from 'lucide-react';

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
                <div key={event.id} className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Date Bubble */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${isLast ? 'bg-brand-600 animate-pulse' : 'bg-brand-400'}`}></div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block md:w-1/2"></div>

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                    <div className="relative">
                        {/* Year Label */}
                        <div className={`text-4xl font-black text-brand-100 absolute -top-6 ${isEven ? 'md:right-0' : 'md:left-0'} left-0 -z-10`}>
                            {event.attributes.year}
                        </div>
                        
                        <span className="inline-block px-2 py-1 bg-secondary-900 text-white text-xs font-bold rounded mb-2">
                            {event.attributes.year}
                        </span>
                        
                        <h3 className="text-xl font-bold text-secondary-900 mb-2 leading-tight">
                            {event.attributes.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {event.attributes.impactDescription}
                        </p>

                        {isLast && (
                            <div className={`mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 uppercase tracking-widest ${isEven ? 'flex-row-reverse' : ''}`}>
                                <Flag size={14} />
                                <span>Marco Atual</span>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};