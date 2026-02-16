import React from 'react';
import { Shield, Users, Heart, Zap, Star, Infinity, LucideIcon } from 'lucide-react';
import { ValueBlockAttributes } from '../../types';

interface Props {
  data: ValueBlockAttributes;
}

const IconMap: Record<string, LucideIcon> = {
  shield: Shield,
  users: Users,
  heart: Heart,
  zap: Zap,
  star: Star,
  infinity: Infinity,
  diamond: Star
};

export const ValueBlock: React.FC<Props> = ({ data }) => {
  const Icon = IconMap[data.iconIdentifier] || Heart;
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border border-slate-100 flex flex-col items-start h-full">
      <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-sm">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-secondary-900 mb-3">{data.name}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">
        {data.description}
      </p>
    </div>
  );
};