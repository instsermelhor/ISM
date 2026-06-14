import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { InstitutionalPageAttributes } from '../../types';
import { Target, Eye, Leaf, Users, Globe } from 'lucide-react';

interface Props {
  data: InstitutionalPageAttributes;
}

// Animated counter hook
function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const frame = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * ease));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [active, target, duration]);
  return count;
}

const StatCard = ({ value, label, suffix = '', icon: Icon }: { value: number; label: string; suffix?: string; icon: React.ElementType }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useCountUp(value, 1800, isInView);
  return (
    <div ref={ref} className="text-center p-6 rounded-2xl bg-brand-50 border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all duration-300 group">
      <Icon size={20} className="text-brand-500 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
      <p className="text-4xl font-black text-brand-700 leading-none mb-1">
        {count}{suffix}
      </p>
      <p className="text-xs font-bold text-secondary-500 uppercase tracking-widest">{label}</p>
    </div>
  );
};

export const MissionVisionValues: React.FC<Props> = ({ data }) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const cards = [
    {
      Icon: Target,
      label: 'Nossa Missão',
      text: data.missionStatement,
      accent: 'border-brand-500',
      iconBg: 'bg-brand-600',
    },
    {
      Icon: Eye,
      label: 'Nossa Visão',
      text: data.visionStatement,
      accent: 'border-secondary-700',
      iconBg: 'bg-secondary-800',
    },
  ];

  return (
    <section id="mission" className="py-24 bg-white section-pattern overflow-hidden" ref={sectionRef}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24">

          {/* Text Content */}
          <div className="lg:w-1/2 space-y-8 w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                Sobre Nós
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-secondary-900 leading-[1.05] mb-4">
                Quem <span className="text-gradient-brand">Somos</span>
              </h2>
              <p className="text-secondary-500 text-lg leading-relaxed">
                Uma organização que acredita no poder transformador da educação, da sustentabilidade e do engajamento coletivo.
              </p>
            </motion.div>

            {/* Mission + Vision cards */}
            <div className="space-y-5">
              {cards.map(({ Icon, label, text, accent, iconBg }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.15 }}
                  className={`relative p-6 rounded-2xl bg-white border-l-4 ${accent} shadow-sm hover:shadow-md transition-shadow duration-300 group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0 text-white group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-secondary-400 uppercase tracking-widest mb-2">{label}</h3>
                      <blockquote className="text-secondary-800 font-medium leading-relaxed text-[15px]">
                        "{text}"
                      </blockquote>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual + Stats */}
          <motion.div
            className="lg:w-1/2 w-full"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Decorative rings — confinadas ao container com overflow-hidden */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-brand-200 rounded-full z-0 opacity-60 pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 w-36 h-36 border border-secondary-100 rounded-full z-0 pointer-events-none" />

              <img
                src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80"
                alt="Instituto Ser Melhor em ação"
                className="relative z-10 w-full h-[400px] md:h-[480px] object-cover rounded-3xl shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/800/600?grayscale';
                }}
              />

              {/* FIX: badges reposicionados para ficarem dentro do container em todos os breakpoints */}
              {/* Badge inferior esquerdo — ajustado para não vazar */}
              <div className="absolute bottom-6 left-4 z-20 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 hidden sm:block">
                <p className="text-4xl font-black text-secondary-900 leading-none">15+</p>
                <p className="text-xs text-secondary-400 uppercase font-bold tracking-wider mt-1">Anos de impacto</p>
                <div className="flex gap-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-1.5 rounded-full bg-brand-500" />
                  ))}
                </div>
              </div>

              {/* Badge superior direito — ajustado para não vazar */}
              <div className="absolute top-5 right-4 z-20 bg-secondary-900 text-white px-4 py-2.5 rounded-xl shadow-xl hidden sm:block">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-400">Impacto Global</p>
                <p className="text-xl font-black">1M+ vidas</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <StatCard value={15} suffix="+" label="Anos" icon={Leaf} />
              <StatCard value={50} suffix="+" label="Parceiros" icon={Globe} />
              <StatCard value={90} suffix="%" label="Eficiência" icon={Users} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};