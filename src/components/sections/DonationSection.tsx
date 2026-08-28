import React, { useRef } from 'react';
import { Heart } from 'lucide-react';
import { DonationForm } from '../payment/DonationForm';
import { motion, useInView } from 'framer-motion';

/** Chave Pix oficial do Instituto Ser Melhor (CNPJ) */
const ISM_PIX_CNPJ = '09.040.440/0001-47';
const ISM_PIX_BANK = 'Cora SCFI';
const ISM_PIX_NAME = 'ORGANIZAÇÃO ASSOCIATIVA CIVIL PARA PROMOÇÃO E DESENVOLVIMENTO DA ASSISTÊNCIA EDUCACIONAL, CULTURAL, AMBIENTAL E SOCIAL';

interface DonationSectionProps {
  donationData?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    pixKey?: string;
    bankName?: string;
    benefits?: string[];
    /** Valor total arrecadado (ex: "R$ 12,4M") — configurável no CMS */
    raisedAmount?: string;
    /** Meta total (ex: "R$ 16M") — configurável no CMS */
    goalAmount?: string;
    /** Ano da meta (ex: 2025) — configurável no CMS */
    goalYear?: number | string;
    /** Percentual de progresso em relação à meta (0-100) — configurável no CMS */
    progressPct?: number;
  } | null;
}

export const DonationSection: React.FC<DonationSectionProps> = ({ donationData }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const badge = donationData?.badge || 'Apoie Agora';
  const subtitle = donationData?.subtitle || 'Sua doação fortalece diretamente programas de transformação social, educacional e ambiental com impacto mensurável.';
  const benefits = donationData?.benefits?.length ? donationData.benefits : [
    'Financiamento de bolsas e programas educacionais para jovens em vulnerabilidade.',
    'Proteção e restauração de biomas com envolvimento comunitário e apoio técnico.',
    'Sustentabilidade financeira e gestão transparente de recursos.'
  ];
  /** Chave Pix: usa o valor do CMS se disponível, senão usa o CNPJ oficial ISM */
  const pixKey = donationData?.pixKey || ISM_PIX_CNPJ;
  const bankName = donationData?.bankName || ISM_PIX_BANK;


  const renderTitle = () => {
    if (donationData?.title) {
      const words = donationData.title.split(' ');
      if (words.length > 1) {
        const lastWord = words.pop();
        return (
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            {words.join(' ')} <span className="text-gradient-brand">{lastWord}</span>
          </h2>
        );
      }
      return (
        <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
          {donationData.title}
        </h2>
      );
    }
    return (
      <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
        Fundo de Sustentabilidade<br className="hidden sm:block" />
        <span className="text-gradient-brand"> Perpétua</span>
      </h2>
    );
  };

  return (
    <section id="donate" className="py-12 md:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary-950 via-secondary-900 to-brand-950" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/15 border border-brand-500/30 rounded-full text-brand-300 font-bold text-xs uppercase tracking-widest mb-5">
            <Heart size={13} fill="currentColor" />
            {badge}
          </div>
          {renderTitle()}
          <p className="text-secondary-300 max-w-2xl text-lg leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/30 flex flex-col md:flex-row min-h-[620px]"
        >
          {/* Left Panel: Impact Context */}
          <div className="md:w-5/12 bg-secondary-900 p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-6 text-white">Seu impacto direto</h3>
              <ul className="space-y-5">
                {benefits.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0 font-black text-xs">
                      {i + 1}
                    </div>
                    <span className="text-secondary-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PIX Panel — QR Code oficial + CNPJ como fallback */}
            <div className="relative z-10 mt-6 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm text-white">
              <p className="text-[10px] text-brand-400 uppercase font-bold tracking-widest mb-3">Pix Direto ⚡ — Escaneie o QR</p>
              <div className="flex justify-center mb-3">
                <img
                  src="/images/qrcode-pix-ism.jpg"
                  alt="QR Code Pix — Instituto Ser Melhor"
                  className="w-40 h-40 object-contain rounded-xl border-2 border-brand-400/40 shadow-lg"
                />
              </div>
              <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-wider text-center mb-2">ou copie a chave:</p>
              <p className="text-xs font-bold font-mono select-all break-all text-center">{pixKey}</p>
              <p className="text-[10px] text-secondary-300 mt-1 font-medium leading-tight">{ISM_PIX_NAME}</p>
              {bankName && <p className="text-[10px] text-brand-300 font-bold mt-0.5">{bankName}</p>}
            </div>
            {donationData?.raisedAmount && (
              /* Bloco de progresso — só renderiza quando os dados vierem do CMS */
              <div className="relative z-10 mt-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                  <p className="text-xs text-secondary-400 uppercase font-bold tracking-widest mb-1">
                    Total Arrecadado{donationData.goalYear ? ` (${donationData.goalYear})` : ''}
                  </p>
                  <p className="text-3xl font-black text-brand-400 mb-3">{donationData.raisedAmount}</p>
                  {donationData.goalAmount && (
                    <>
                      <div className="w-full bg-secondary-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-brand-500 to-brand-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, donationData.progressPct ?? 75)}%` }}
                        />
                      </div>
                      <p className="text-xs text-secondary-500 mt-2">
                        {donationData.progressPct ?? 75}% da meta {donationData.goalYear ?? ''}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Panel: Form */}
          <div className="md:w-7/12 p-8 md:p-10">
            <DonationForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
};