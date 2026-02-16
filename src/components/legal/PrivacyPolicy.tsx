import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="prose prose-slate max-w-none">
      <div className="mb-8">
        <p className="font-bold text-sm uppercase text-brand-600 tracking-widest mb-1">Documento Oficial</p>
        <h3 className="text-xl font-bold text-secondary-900">Política de Privacidade e Proteção de Dados</h3>
        <p className="text-xs text-gray-500 font-mono mt-1">Última Atualização: Fevereiro de 2026</p>
      </div>

      <p>
        No Instituto Ser Melhor, a "Transparência Quântica" é um pilar. Esta política descreve como tratamos seus dados pessoais com o mais alto nível de segurança e ética.
      </p>

      <h4 className="text-lg font-bold text-secondary-900 mt-6 mb-2">1. Coleta de Dados e Finalidade</h4>
      <p>Coletamos apenas o estritamente necessário para cumprir nossa missão:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>Doações:</strong> Nome, e-mail e CPF/CNPJ. Estes dados são coletados para identificação fiscal, emissão de recibos e processamento de pagamentos via Stripe.</li>
        <li><strong>Parcerias:</strong> Nome, cargo, e-mail institucional e dados da organização. Coletados para avaliação estratégica de sinergia com o Instituto.</li>
        <li><strong>Navegação:</strong> Cookies técnicos para otimizar sua experiência e garantir a segurança das transações.</li>
      </ul>

      <h4 className="text-lg font-bold text-secondary-900 mt-6 mb-2">2. Segurança e Sigilo Bancário</h4>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>PCI-DSS:</strong> Não armazenamos dados de cartão de crédito em nossos servidores. Todo o processamento financeiro é realizado em ambiente criptografado pelo Stripe.</li>
        <li><strong>Criptografia:</strong> Utilizamos protocolos TLS 1.3 para dados em trânsito e criptografia AES-256 para dados em repouso em nosso banco de dados.</li>
      </ul>

      <h4 className="text-lg font-bold text-secondary-900 mt-6 mb-2">3. Compartilhamento de Dados</h4>
      <p>O Instituto jamais comercializa, aluga ou cede seus dados a terceiros para fins de marketing. O compartilhamento ocorre apenas com:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Processadores de pagamento (Stripe).</li>
        <li>Autoridades governamentais (para fins de conformidade fiscal e legal).</li>
      </ul>

      <h4 className="text-lg font-bold text-secondary-900 mt-6 mb-2">4. Seus Direitos (Art. 18 LGPD)</h4>
      <p>Você possui o direito de:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Confirmar a existência de tratamento.</li>
        <li>Acessar, corrigir ou anonimizar seus dados.</li>
        <li>Revogar o consentimento a qualquer momento.</li>
        <li>Solicitar a exclusão definitiva, respeitando os prazos legais de guarda de registros fiscais.</li>
      </ul>
    </div>
  );
};