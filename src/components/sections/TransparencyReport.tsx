import React, { useRef } from 'react';
import { TransparencyDocument, FinancialEntry } from '../../types';
import { ExternalLink, ShieldCheck, Lock, Scale, UserCheck, Megaphone, Fingerprint } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DocumentCard } from '../ui/DocumentCard';
import { motion, useInView } from 'framer-motion';

interface Props {
  documents: TransparencyDocument[];
  financials: FinancialEntry[];
  intro: string;
}

const integrityPillars = [
  {
    Icon: UserCheck,
    title: 'Estrutura Remuneratória',
    body: 'Membros da Assembleia e dos Conselhos atuam em caráter estritamente voluntário. A remuneração da Diretoria-Executiva segue critérios de mercado e metas de impacto.',
    cta: null,
  },
  {
    Icon: Megaphone,
    title: 'Canal de Integridade',
    body: 'Canal de Denúncias operado por empresa terceirizada independente. Garantia absoluta de anonimato e imparcialidade na apuração de desvios do Código de Conduta.',
    cta: { label: 'Acessar Ouvidoria', href: '#' },
  },
  {
    Icon: Fingerprint,
    title: 'Privacidade Global',
    body: 'Conformidade rigorosa com a LGPD (Brasil) e GDPR (Europa). Tratamos dados de doadores e beneficiários com criptografia e protocolos de segurança cibernética.',
    cta: null,
  },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-secondary-900 border border-secondary-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-white font-bold text-sm">{payload[0].name}</p>
        <p className="text-brand-400 font-black text-lg">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export const TransparencyReport: React.FC<Props> = ({ documents, financials, intro }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="transparency" className="py-24 bg-secondary-950 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-brand-400" size={22} />
              <span className="text-brand-400 font-bold tracking-widest uppercase text-xs">Prestação de Contas</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
              Transparência{' '}
              <span className="text-gradient-brand">Quântica</span>
            </h2>
            <p className="text-secondary-300 text-lg leading-relaxed">{intro}</p>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0">
            {[
              { Icon: Lock, label: 'Auditoria: Tier 1 (Big Four)' },
              { Icon: Scale, label: 'Normas: IFRS / CPC' },
            ].map(({ Icon, label }) => (
              <div key={label} className="glass-dark flex items-center gap-2.5 px-4 py-2.5 rounded-xl">
                <Icon size={14} className="text-brand-400 shrink-0" />
                <span className="text-xs text-secondary-300 font-mono">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 1: Chart + Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-dark rounded-3xl p-8 border border-secondary-800 flex flex-col"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-500 rounded-full shrink-0" />
              Eficiência na Alocação de Recursos
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financials}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {financials.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span className="text-secondary-300 text-xs font-medium">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center border-t border-secondary-800 pt-4">
              <p className="text-secondary-300 text-sm">
                <span className="text-brand-400 font-black text-3xl">90%</span> de Eficiência Operacional
              </p>
              <p className="text-xs text-secondary-500 mt-1">Recursos destinados diretamente à atividade-fim.</p>
            </div>
          </motion.div>

          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-500 rounded-full shrink-0" />
                Repositório de Governança
              </h3>
              <a
                href="#"
                className="text-xs text-brand-400 hover:text-white transition-colors uppercase font-bold flex items-center gap-1 group"
              >
                Ver Acervo <ExternalLink size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
            <div className="space-y-3 flex-grow">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} data={doc} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Row 2: Integrity Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {integrityPillars.map(({ Icon, title, body, cta }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="bg-gradient-to-br from-secondary-800/60 to-secondary-900/60 p-7 rounded-3xl border border-secondary-800 hover:border-brand-500/30 transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="w-11 h-11 bg-secondary-700 rounded-xl flex items-center justify-center mb-5 text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-250">
                <Icon size={22} />
              </div>
              <h4 className="text-base font-bold text-white mb-3">{title}</h4>
              <p className="text-secondary-400 text-sm leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: body.replace(/LGPD|GDPR/g, '<strong class="text-secondary-200">$&</strong>').replace(/voluntário/g, '<strong class="text-secondary-200">$&</strong>') }}
              />
              {cta && (
                <a
                  href={cta.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-white uppercase tracking-wider transition-colors group/link"
                >
                  {cta.label}
                  <ExternalLink size={10} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};