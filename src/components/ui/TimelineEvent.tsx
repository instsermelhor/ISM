import React from 'react';
import { TimelineMilestoneAttributes } from '../../types';
import { Flag } from 'lucide-react';

interface Props {
  data: TimelineMilestoneAttributes;
  isEven: boolean;
  isLast: boolean;
}

export const TimelineEvent: React.FC<Props> = ({ data, isEven, isLast }) => {
  return (
    <div className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}>
      
      {/* Date Bubble */}
      <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${isLast ? 'bg-brand-600 animate-pulse' : 'bg-brand-400'}`}></div>
      </div>

      {/* Spacer */}
      <div className="hidden md:block md:w-1/2"></div>

      {/* Content Card */}
      <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
        <div className="relative group">
            {/* Year Label */}
            <div className={`text-4xl font-black text-brand-100 absolute -top-6 ${isEven ? 'md:right-0' : 'md:left-0'} left-0 -z-10 group-hover:text-brand-200 transition-colors duration-500`}>
                {data.year}
            </div>
            
            <span className="inline-block px-2 py-1 bg-secondary-900 text-white text-xs font-bold rounded mb-2">
                {data.year}
            </span>
            
            <h3 className="text-xl font-bold text-secondary-900 mb-2 leading-tight">
                {data.title}
            </h3>
            
            <p className="text-gray-600 text-sm leading-relaxed">
                {data.impactDescription}
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
};