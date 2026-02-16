import React from 'react';

export const TermsOfUse: React.FC = () => {
  return (
    <div className="prose prose-slate max-w-none">
       <div className="mb-8">
        <p className="font-bold text-sm uppercase text-brand-600 tracking-widest mb-1">Documento Oficial</p>
        <h3 className="text-xl font-bold text-secondary-900">Termos e Condições de Uso</h3>
        <p className="text-xs text-gray-500 font-mono mt-1">Última Atualização: Fevereiro de 2026</p>
      </div>

      <h4 className="text-lg font-bold text-secondary-900 mt-6 mb-2">1. Aceite dos Termos</h4>
      <p>
        Ao navegar no site ou realizar uma doação, você declara estar ciente e concordar com estes Termos. Se você busca a excelência e o "Sapere Aude", está no lugar certo.
      </p>

      <h4 className="text-lg font-bold text-secondary-900 mt-6 mb-2">2. Doações e Apoio Agora</h4>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>Natureza:</strong> As doações são atos voluntários e irrevogáveis após o processamento, destinadas ao custeio de nossos programas educacionais, sociais, animais e ambientais.</li>
        <li><strong>Recorrência:</strong> Doações mensais podem ser canceladas a qualquer momento através do painel do doador ou via contato direto com nossa equipe.</li>
        <li><strong>Transparência:</strong> O doador tem o direito de consultar como os recursos são aplicados através de nossos Relatórios Anuais Auditados.</li>
      </ul>

      <h4 className="text-lg font-bold text-secondary-900 mt-6 mb-2">3. Propriedade Intelectual</h4>
      <p>
        Todo o conteúdo, incluindo o logotipo, a logomarca e o lema "Sapere Aude", são propriedade exclusiva do Instituto Ser Melhor. A reprodução não autorizada para fins comerciais é estritamente proibida, protegendo assim a integridade da nossa marca.
      </p>

      <h4 className="text-lg font-bold text-secondary-900 mt-6 mb-2">4. Parcerias (Seja Parceiro)</h4>
      <p>
        A submissão do formulário de parceria não garante a formalização de vínculo. O Instituto reserva-se o direito de selecionar parceiros baseando-se em critérios internos de ética, impacto e conformidade com nossos valores.
      </p>

      <h4 className="text-lg font-bold text-secondary-900 mt-6 mb-2">5. Limitação de Responsabilidade</h4>
      <p>
        Embora busquemos a perfeição técnica, o Instituto não se responsabiliza por instabilidades momentâneas causadas por provedores de internet ou falhas externas de infraestrutura global.
      </p>
    </div>
  );
};