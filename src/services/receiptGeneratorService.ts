/**
 * receiptGeneratorService.ts — E001: Gerador de Recibo Oficial de Doação
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Gera dados e template imprimível do Recibo Oficial de Doação para doadores do ISM.
 * CNPJ Oficial: 09.040.440/0001-47
 */

export interface DonationReceiptData {
  receiptId: string;
  transactionId: string;
  donorName: string;
  donorEmail: string;
  donorTaxId?: string;
  amount: number;
  frequency: string;
  pillar: string;
  paymentMethod: string;
  issuedAt: string;
  sroiRatio: number;
  socialValueGenerated: number;
}

export const ReceiptGeneratorService = {
  /** Compila recibo oficial de doação com cálculo SROI correspondente */
  buildReceiptData(params: {
    transactionId: string;
    donorName: string;
    donorEmail: string;
    donorTaxId?: string;
    amount: number;
    frequency: string;
    pillar: string;
    paymentMethod: string;
  }): DonationReceiptData {
    const sroiRatio = 4.83; // Razão oficial ISM (R$ 4,83x)
    const socialValueGenerated = params.amount * sroiRatio;

    return {
      receiptId: `REC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      transactionId: params.transactionId,
      donorName: params.donorName,
      donorEmail: params.donorEmail,
      donorTaxId: params.donorTaxId || 'Não informado',
      amount: params.amount,
      frequency: params.frequency,
      pillar: params.pillar,
      paymentMethod: params.paymentMethod,
      issuedAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      sroiRatio,
      socialValueGenerated,
    };
  },

  /** Dispara a caixa de diálogo de impressão do recibo */
  printReceiptWindow(data: DonationReceiptData) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Recibo de Doação — ${data.receiptId}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #111827; max-width: 700px; margin: 0 auto; }
          .header { border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-space-between; }
          .logo-title { font-size: 20px; font-weight: 900; color: #1e293b; }
          .subtitle { font-size: 11px; color: #6b7280; margin-top: 4px; }
          .box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
          .amount { font-size: 32px; font-weight: 900; color: #15803d; font-family: monospace; }
          .sroi { font-size: 13px; color: #166534; font-weight: 700; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
          td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          td.label { color: #6b7280; font-weight: 600; width: 40%; }
          td.val { font-weight: 700; color: #111827; }
          .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; pt: 20px; text-align: center; font-size: 10px; color: #9ca3af; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-title">INSTITUTO SER MELHOR</div>
            <div class="subtitle">CNPJ 09.040.440/0001-47 · Organização Não Governamental</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #16a34a; font-weight: 800;">
            RECIBO OFICIAL DE DOAÇÃO<br>
            <span style="color: #6b7280; font-weight: 400;">${data.receiptId}</span>
          </div>
        </div>

        <div class="box">
          <div style="font-size: 11px; color: #15803d; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">VALOR DA DOAÇÃO CONTRIBUÍDA</div>
          <div class="amount">R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="sroi">🌱 Retorno Social Estimado (SROI R$ 4,83): <strong>R$ ${data.socialValueGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
        </div>

        <table>
          <tr><td class="label">Doador(a):</td><td class="val">${data.donorName}</td></tr>
          <tr><td class="label">E-mail:</td><td class="val">${data.donorEmail}</td></tr>
          <tr><td class="label">CPF/CNPJ:</td><td class="val">${data.donorTaxId}</td></tr>
          <tr><td class="label">Pilar Contemplado:</td><td class="val">${data.pillar}</td></tr>
          <tr><td class="label">Periodicidade:</td><td class="val">${data.frequency}</td></tr>
          <tr><td class="label">Forma de Pagamento:</td><td class="val">${data.paymentMethod}</td></tr>
          <tr><td class="label">ID da Transação:</td><td class="val" style="font-family: monospace;">${data.transactionId}</td></tr>
          <tr><td class="label">Data de Emissão:</td><td class="val">${data.issuedAt}</td></tr>
        </table>

        <div style="margin-top: 40px; text-align: center;">
          <div style="border-bottom: 1px solid #9ca3af; width: 250px; margin: 0 auto 6px;"></div>
          <div style="font-size: 12px; font-weight: 800;">Instituto Ser Melhor</div>
          <div style="font-size: 10px; color: #6b7280;">Comprovante de Doação Sem Fins Lucrativos</div>
        </div>

        <div class="footer">
          Documento gerado eletronicamente em estrita observância à Lei 13.709/2018 (LGPD).<br>
          Instituto Ser Melhor · Sapere Aude — Ouse Saber
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
    }
  },
};
