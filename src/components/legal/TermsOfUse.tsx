import React from 'react';

// BUG FIX: removida classe 'prose' (plugin @tailwindcss/typography não instalado)

export const TermsOfUse: React.FC = () => {
  const sections = [
    {
      title: '1. Aceitação',
      content: 'Ao acessar o portal do Instituto Ser Melhor e utilizar nossos serviços de doação ou inscrição, você concorda integralmente com estes termos.',
    },
    {
      title: '2. Destinação de Recursos',
      content: 'O Instituto compromete-se a aplicar os recursos doados conforme descrito em nossos relatórios de transparência, respeitando o princípio da eficiência e integridade.',
    },
    {
      title: '3. Propriedade Intelectual',
      content: 'Todo o conteúdo deste site, incluindo textos, logotipos e imagens, é propriedade do Instituto Ser Melhor e está protegido por leis de direitos autorais.',
    },
    {
      title: '4. Isenção de Responsabilidade',
      content: 'Embora nos esforcemos pela precisão, não garantimos que as informações no site estejam isentas de erros técnicos ou operacionais a todo momento.',
    },
  ];

  return (
    <div className="text-secondary-700 text-sm leading-relaxed space-y-5">
      <p className="text-xs font-bold uppercase tracking-widest text-secondary-400 border-b border-gray-100 pb-3">
        Vigência: A partir de Janeiro de 2025
      </p>

      {sections.map(({ title, content }) => (
        <div key={title}>
          <h4 className="text-base font-bold text-secondary-900 mb-2">{title}</h4>
          <p>{content}</p>
        </div>
      ))}
    </div>
  );
};