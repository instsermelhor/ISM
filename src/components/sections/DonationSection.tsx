import React from 'react';
import { Heart } from 'lucide-react';
import { DonationForm } from '../payment/DonationForm';

export const DonationSection: React.FC = () => {
  return (
    <section id="donate" className="py-24 bg-gradient-to-br from-brand-900 to-secondary-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 border border-brand-500/50 rounded-full text-brand-400 font-bold text-xs uppercase tracking-widest mb-4">
                <Heart size={14} fill="currentColor" />
                Apoie Agora
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Fundo de Sustentabilidade Perpétua</h2>
            <p className="text-gray-300 max-w-2xl text-lg">
                Sua doação não é apenas um ato de caridade; é um investimento direto na transformação sistêmica.
            </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white text-secondary-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
            
            {/* Left Panel: Impact Context */}
            <div className="md:w-5/12 bg-secondary-100 p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10">
                    <h3 className="font-bold text-xl mb-4">Seu impacto direto</h3>
                    <ul className="space-y-4 text-sm text-gray-600">
                        <li className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                            <span>Financiamento de bolsas para jovens líderes climáticos.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                            <span>Proteção de biomas através de tecnologia de monitoramento via satélite.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                            <span>Independência total de verbas governamentais.</span>
                        </li>
                    </ul>
                </div>
                <div className="relative z-10 mt-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Total Arrecadado (2025)</p>
                        <p className="text-2xl font-black text-brand-600">R$ 12.4M</p>
                        <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                            <div className="bg-brand-500 h-full w-[75%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form Component */}
            <div className="md:w-7/12 p-8 md:p-12 relative">
                <DonationForm />
            </div>
        </div>
      </div>
    </section>
  );
};