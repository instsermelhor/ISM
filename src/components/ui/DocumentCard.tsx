import React from 'react';
import { FileText, FileBarChart, Scale, Book, Download } from 'lucide-react';
import { TransparencyDocument } from '../../types';

interface Props {
  data: TransparencyDocument;
}

const getDocIcon = (type: string) => {
  switch (type) {
    case 'Financeiro': return <FileBarChart size={18} className="text-blue-400" />;
    case 'Legal': return <Scale size={18} className="text-red-400" />;
    case 'Código de Conduta': return <Book size={18} className="text-purple-400" />;
    default: return <FileText size={18} className="text-brand-400" />;
  }
};

const typeColors: Record<string, string> = {
  'Financeiro': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Legal': 'bg-red-500/10 text-red-300 border-red-500/20',
  'Código de Conduta': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  'Impacto': 'bg-brand-500/10 text-brand-300 border-brand-500/20',
};

export const DocumentCard: React.FC<Props> = ({ data }) => {
  const typeStyle = typeColors[data.documentType] || typeColors['Impacto'];

  return (
    <div className="group bg-secondary-800/50 hover:bg-secondary-800 border border-secondary-700 hover:border-brand-500/40 rounded-2xl p-4 transition-all duration-250 flex items-center justify-between backdrop-blur-sm">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-secondary-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0">
          {getDocIcon(data.documentType)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-white text-sm truncate">{data.documentName}</h4>
            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border font-bold shrink-0 ${typeStyle}`}>
              {data.documentType}
            </span>
          </div>
          <p className="text-xs text-secondary-500 font-mono">
            {new Date(data.publicationDate).toLocaleDateString('pt-BR')} · {data.fileSize || 'PDF'}
          </p>
        </div>
      </div>

      <a
        href={data.documentFile}
        className="ml-3 w-9 h-9 rounded-full bg-secondary-900 text-secondary-400 hover:bg-brand-600 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shrink-0"
        title={`Baixar ${data.documentName}`}
        aria-label={`Baixar ${data.documentName}`}
      >
        <Download size={16} />
      </a>
    </div>
  );
};