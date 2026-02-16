import React from 'react';
import { FileText, FileBarChart, Scale, Book, Download } from 'lucide-react';
import { TransparencyDocumentAttributes } from '../../types';

interface Props {
  data: TransparencyDocumentAttributes;
}

const getDocIcon = (type: string) => {
  switch(type) {
      case 'Financeiro': return <FileBarChart size={20} className="text-blue-400" />;
      case 'Legal': return <Scale size={20} className="text-red-400" />;
      case 'Código de Conduta': return <Book size={20} className="text-purple-400" />;
      default: return <FileText size={20} className="text-brand-400" />;
  }
};

export const DocumentCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="group bg-secondary-800 hover:bg-secondary-700 border border-secondary-700 hover:border-brand-500/50 rounded-xl p-4 transition-all duration-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-secondary-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                {getDocIcon(data.documentType)}
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-sm md:text-base">{data.documentName}</h4>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-secondary-600 text-gray-300 font-bold">
                        {data.documentType}
                    </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">
                    Publicado em: {new Date(data.publicationDate).toLocaleDateString('pt-BR')} • {data.fileSize || 'PDF'}
                </p>
            </div>
        </div>
        
        <a 
            href={data.documentFile} 
            className="w-10 h-10 rounded-full bg-secondary-900 text-gray-400 hover:bg-brand-600 hover:text-white flex items-center justify-center transition-colors"
            title="Baixar Documento"
        >
            <Download size={18} />
        </a>
    </div>
  );
};