import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="prose prose-sm max-w-none text-gray-600">
      <p><strong>Última atualização: Março de 2025</strong></p>
      <p>O Instituto Ser Melhor valoriza sua privacidade e está comprometido com a proteção de seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
      
      <h4>1. Coleta de Dados</h4>
      <p>Coletamos informações essenciais para processamento de doações e parcerias, incluindo nome, e-mail, telefone e, quando necessário, CPF/CNPJ.</p>
      
      <h4>2. Uso das Informações</h4>
      <p>Seus dados são utilizados exclusivamente para:</p>
      <ul>
        <li>Processamento seguro de transações financeiras;</li>
        <li>Emissão de recibos fiscais;</li>
        <li>Comunicação institucional e prestação de contas.</li>
      </ul>
      
      <h4>3. Compartilhamento</h4>
      <p>Não vendemos ou comercializamos seus dados. O compartilhamento ocorre apenas com parceiros essenciais para a operação (ex: gateways de pagamento) ou por obrigação legal.</p>
      
      <h4>4. Seus Direitos</h4>
      <p>Você pode solicitar a correção, exclusão ou portabilidade de seus dados a qualquer momento através do e-mail dpo@institutosermelhor.org.</p>
    </div>
  );
};