import React from 'react';
import { TransparencyDocument, FinancialEntry } from '../../types';
import { ExternalLink, ShieldCheck, Lock, Scale, UserCheck, Megaphone, Fingerprint } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DocumentCard } from '../ui/DocumentCard';

interface Props {
  documents: TransparencyDocument[];
  financials: FinancialEntry[];
  intro: string;
}

export const TransparencyReport: React.FC<Props> = ({ documents, financials, intro }) => {
  return (
    <section id="transparency" className="py-24 bg-secondary-900 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary-800 to-transparent opacity-50 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 z-0"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-brand-500" size={24} />
                    <span className="text-brand-500 font-bold tracking-wider uppercase text-sm">Prestação de Contas</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Transparência Quântica</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                    {intro}
                </p>
            </div>
            
            <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 bg-secondary-800/80 px-4 py-2 rounded-lg border border-secondary-700 backdrop-blur-sm">
                    <Lock size={16} className="text-brand-500" />
                    <span className="text-xs text-gray-300 font-mono">Auditoria: Tier 1 (Big Four)</span>
                </div>
                 <div className="flex items-center gap-2 bg-secondary-800/80 px-4 py-2 rounded-lg border border-secondary-700 backdrop-blur-sm">
                    <Scale size={16} className="text-brand-500" />
                    <span className="text-xs text-gray-300 font-mono">Normas: IFRS / CPC</span>
                </div>
            </div>
        </div>

        {/* Row 1: Financials & Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            
            {/* Financial Chart */}
            <div className="bg-secondary-800/50 rounded-2xl p-8 border border-secondary-700 backdrop-blur-sm flex flex-col">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                    Eficiência na Alocação de Recursos
                </h3>
                <div className="h-[300px] w-full flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={financials}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {financials.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6 text-center border-t border-secondary-700 pt-4">
                    <p className="text-lg">
                        <span className="text-brand-400 font-bold text-2xl">90%</span> de Eficiência Operacional
                    </p>
                    <p className="text-xs text-gray-500">Recursos destinados diretamente à atividade-fim.</p>
                </div>
            </div>

            {/* Official Documents */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                        Repositório de Governança
                    </h3>
                    <a href="#" className="text-xs text-brand-400 hover:text-white transition-colors uppercase font-bold flex items-center gap-1">
                        Ver Acervo Completo <ExternalLink size={12} />
                    </a>
                </div>
                
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <DocumentCard key={doc.id} data={doc} />
                    ))}
                </div>
            </div>
        </div>

        {/* Row 2: Pillars of Integrity (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Remuneration */}
            <div className="bg-gradient-to-br from-secondary-800 to-secondary-900 p-8 rounded-2xl border border-secondary-700 hover:border-brand-500/30 transition-all group">
                <div className="w-12 h-12 bg-secondary-700 rounded-lg flex items-center justify-center mb-6 text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <UserCheck size={24} />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Estrutura Remuneratória</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Membros da Assembleia e dos Conselhos (Deliberativo, Fiscal e Consultivo) atuam em caráter estritamente <strong>voluntário</strong>. A remuneração da Diretoria-Executiva segue critérios de mercado e metas de impacto.
                </p>
            </div>

            {/* Ethics & Whistleblower */}
            <div className="bg-gradient-to-br from-secondary-800 to-secondary-900 p-8 rounded-2xl border border-secondary-700 hover:border-brand-500/30 transition-all group">
                <div className="w-12 h-12 bg-secondary-700 rounded-lg flex items-center justify-center mb-6 text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Megaphone size={24} />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Canal de Integridade</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Canal de Denúncias (Ouvidoria) operado por empresa terceirizada independente. Garantia absoluta de anonimato e imparcialidade na apuração de desvios do Código de Conduta.
                </p>
                <a href="#" className="text-xs font-bold text-brand-500 hover:text-white uppercase tracking-wider flex items-center gap-1">
                    Acessar Ouvidoria <ExternalLink size={10} />
                </a>
            </div>

            {/* Privacy & LGPD */}
            <div className="bg-gradient-to-br from-secondary-800 to-secondary-900 p-8 rounded-2xl border border-secondary-700 hover:border-brand-500/30 transition-all group">
                <div className="w-12 h-12 bg-secondary-700 rounded-lg flex items-center justify-center mb-6 text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Fingerprint size={24} />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Privacidade Global</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Conformidade rigorosa com a <strong>LGPD</strong> (Brasil) e <strong>GDPR</strong> (Europa). Tratamos os dados de doadores e beneficiários com criptografia de ponta e protocolos de segurança cibernética.
                </p>
            </div>

        </div>

      </div>
    </section>
  );
};