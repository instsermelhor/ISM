import React from 'react';
import { InstitutionalPageAttributes } from '../../types';

interface Props {
  data: InstitutionalPageAttributes;
}

export const MissionVisionValues: React.FC<Props> = ({ data }) => {
  return (
    <section id="mission" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-12">
            <div>
                <div className="inline-block px-3 py-1 bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                  Sobre Nós
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 leading-tight mb-6">
                  Nossa Missão
                </h2>
                <blockquote className="text-2xl font-light text-brand-700 border-l-4 border-brand-500 pl-6 italic">
                  "{data.missionStatement}"
                </blockquote>
            </div>

            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 leading-tight mb-6">
                    Nossa Visão
                </h2>
                <blockquote className="text-2xl font-light text-brand-700 border-l-4 border-brand-500 pl-6 italic">
                    "{data.visionStatement}"
                </blockquote>
            </div>
          </div>

          {/* Visual Illustration */}
          <div className="lg:w-1/2 w-full">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-200 rounded-full z-0 opacity-50"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-100 rounded-full z-0 opacity-50"></div>
              <img
                src="https://picsum.photos/800/600"
                alt="Mission illustration"
                className="relative z-10 w-full h-[500px] object-cover rounded-xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-10 left-[-20px] z-20 bg-white p-6 rounded-lg shadow-xl max-w-xs border-l-8 border-brand-600 hidden md:block animate-fade-in">
                <p className="text-4xl font-bold text-secondary-900 mb-1">15+</p>
                <p className="text-sm text-gray-500 uppercase font-semibold">Anos de impacto positivo</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};