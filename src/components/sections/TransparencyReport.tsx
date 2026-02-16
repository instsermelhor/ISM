import React from 'react';
import { StrapiItem, TransparencyDocumentAttributes, FinancialEntry } from '../../../types';
import { ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DocumentCard } from '../ui/DocumentCard';

interface Props {
  documents: StrapiItem<TransparencyDocumentAttributes>[];
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-brand-500" size={24} />
                    <span className="text-brand-500 font-bold tracking-wider uppercase text-sm">Portal da Transparência</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Transparência Quântica</h2>
                <p className="text-gray-400 text-lg">
                    {intro}
                </p>
            </div>
            
            <div className="flex items-center gap-2 bg-secondary-800/50 px-4 py-2 rounded-lg border border-secondary-700">
                <Lock size={16} className="text-brand-500" />
                <span className="text-xs text-gray-400 font-mono">Auditoria Independente: KPMG/Deloitte</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Col: Financial Chart */}
            <div className="bg-secondary-800/50 rounded-2xl p-8 border border-secondary-700 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                    Alocação de Recursos (2024)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={financials}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
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
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">
                        A cada <span className="text-white font-bold">R$ 100,00</span> doados, <span className="text-brand-400 font-bold">R$ 90,00</span> vão diretamente para os programas de ponta.
                    </p>
                </div>
            </div>

            {/* Right Col: Documents List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                    Documentos Oficiais & Prestação de Contas
                </h3>
                
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <DocumentCard key={doc.id} data={doc.attributes} />
                    ))}
                </div>

                <div className="mt-8 p-4 bg-brand-900/20 border border-brand-900/50 rounded-lg flex items-start gap-3">
                    <ExternalLink size={20} className="text-brand-500 shrink-0 mt-1" />
                    <p className="text-sm text-brand-200">
                        Para acessar os relatórios auditados completos de anos anteriores (2007-2023), acesse nosso <a href="#" className="underline hover:text-white font-bold">Acervo Histórico de Governança</a>.
                    </p>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};