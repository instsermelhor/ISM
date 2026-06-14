import React from 'react';
import { Shield, Users, Heart, Zap, Star, Infinity, LucideIcon } from 'lucide-react';
import { ValueBlockAttributes } from '../../types';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Props {
  data: ValueBlockAttributes;
  index: number;
}

const IconMap: Record<string, LucideIcon> = {
  shield: Shield,
  users: Users,
  heart: Heart,
  zap: Zap,
  star: Star,
  infinity: Infinity,
  diamond: Star,
};

const accentColors = [
  { bg: 'bg-brand-600', light: 'bg-brand-50', text: 'text-brand-600', border: 'border-brand-200' },
  { bg: 'bg-secondary-700', light: 'bg-secondary-50', text: 'text-secondary-700', border: 'border-secondary-200' },
  { bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  { bg: 'bg-blue-700', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
];

export const ValueBlock: React.FC<Props> = ({ data, index }) => {
  const Icon = IconMap[data.iconIdentifier] || Heart;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const colors = accentColors[index % accentColors.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-400 group cursor-default overflow-hidden"
    >
      {/* Hover background fill */}
      <div className={`absolute inset-0 ${colors.light} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`} />

      {/* Number watermark */}
      <span className="absolute top-4 right-5 text-6xl font-black text-gray-50 group-hover:text-gray-100 transition-colors select-none leading-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-14 h-14 ${colors.light} ${colors.border} border rounded-2xl flex items-center justify-center ${colors.text} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <Icon size={26} />
        </div>

        <h3 className="text-xl font-bold text-secondary-900 mb-3 leading-tight">
          {data.name}
        </h3>
        <p className="text-secondary-500 text-sm leading-relaxed">
          {data.description}
        </p>

        {/* Accent line */}
        <div className={`mt-6 w-8 h-0.5 ${colors.bg} rounded-full group-hover:w-16 transition-all duration-300`} />
      </div>
    </motion.div>
  );
};