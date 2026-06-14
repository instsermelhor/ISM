import React from 'react';

// BUG FIX: removida classe 'prose' (plugin @tailwindcss/typography não instalado)
// Estilos aplicados diretamente via classes Tailwind

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="text-secondary-700 text-sm leading-relaxed space-y-5">
      <p className="text-xs font-bold uppercase tracking-widest text-secondary-400 border-b border-gray-100 pb-3">
        Última atualização: Março de 2025
      </p>
      <p>
        O Instituto Ser Melhor valoriza sua privacidade e está comprometido com a proteção de seus dados pessoais,
        em conformidade com a <strong className="text-secondary-900">Lei Geral de Proteção de Dados (LGPD)</strong> — Lei nº 13.709/2018.
      </p>

      <div>
        <h4 className="text-base font-bold text-secondary-900 mb-2">1. Coleta de Dados</h4>
        <p>
          Coletamos informações essenciais para processamento de doações e parcerias, incluindo nome, e-mail,
          telefone e, quando necessário, CPF/CNPJ para emissão de recibos fiscais.
        </p>
      </div>

      <div>
        <h4 className="text-base font-bold text-secondary-900 mb-2">2. Uso das Informações</h4>
        <p className="mb-2">Seus dados são utilizados exclusivamente para:</p>
        <ul className="space-y-1.5 pl-4">
          {[
            'Processamento seguro de transações financeiras;',
            'Emissão de recibos fiscais;',
            'Comunicação institucional e prestação de contas.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-base font-bold text-secondary-900 mb-2">3. Compartilhamento</h4>
        <p>
          Não vendemos ou comercializamos seus dados. O compartilhamento ocorre apenas com parceiros
          essenciais para a operação (ex: gateways de pagamento) ou por obrigação legal.
        </p>
      </div>

      <div>
        <h4 className="text-base font-bold text-secondary-900 mb-2">4. Seus Direitos</h4>
        <p>
          Você pode solicitar a correção, exclusão ou portabilidade de seus dados a qualquer momento
          através do e-mail{' '}
          <a href="mailto:dpo@institutosermelhor.org" className="text-brand-600 hover:underline font-medium">
            dpo@institutosermelhor.org
          </a>.
        </p>
      </div>
    </div>
  );
};