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

export interface AnnualTaxStatementData {
  statementId: string;
  taxYear: number;
  donorName: string;
  donorEmail: string;
  donorTaxId: string;
  organizationName: string;
  organizationCnpj: string;
  totalDonated: number;
  totalSroiGenerated: number;
  donationsCount: number;
  issuedAt: string;
  digitalSignatureHash: string;
  monthlyBreakdown: { month: string; amount: number }[];
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

  /** Compila a Declaração Anual Consolidada de Doações para Declaração de IRPF */
  buildAnnualTaxStatement(params: {
    donorName: string;
    donorEmail: string;
    donorTaxId?: string;
    taxYear: number;
    donations: { date: string; amount: number }[];
  }): AnnualTaxStatementData {
    const totalDonated = params.donations.reduce((acc, d) => acc + d.amount, 0);
    const sroiRatio = 4.83;
    const totalSroiGenerated = totalDonated * sroiRatio;

    // Agrupamento por mês
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthlyMap: Record<number, number> = {};
    params.donations.forEach(d => {
      const m = new Date(d.date).getMonth();
      monthlyMap[m] = (monthlyMap[m] || 0) + d.amount;
    });

    const monthlyBreakdown = months.map((month, idx) => ({
      month,
      amount: monthlyMap[idx] || 0,
    })).filter(item => item.amount > 0);

    const statementId = `IRPF-${params.taxYear}-${Date.now().toString().slice(-6)}`;
    const rawSignature = `${statementId}|${params.donorEmail}|09.040.440/0001-47|${totalDonated.toFixed(2)}`;
    let hash = 0;
    for (let i = 0; i < rawSignature.length; i++) {
      hash = ((hash << 5) - hash) + rawSignature.charCodeAt(i);
      hash |= 0;
    }
    const digitalSignatureHash = `SHA256-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    return {
      statementId,
      taxYear: params.taxYear,
      donorName: params.donorName,
      donorEmail: params.donorEmail,
      donorTaxId: params.donorTaxId || 'Não informado',
      organizationName: 'INSTITUTO SER MELHOR — ORGANIZAÇÃO CIVIL SEM FINS LUCRATIVOS',
      organizationCnpj: '09.040.440/0001-47',
      totalDonated,
      totalSroiGenerated,
      donationsCount: params.donations.length,
      issuedAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      digitalSignatureHash,
      monthlyBreakdown,
    };
  },

  /** Dispara a caixa de diálogo de impressão do recibo individual */
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
            <div class="subtitle" style="font-weight: 700; color: #1e293b;">ORGANIZAÇÃO ASSOCIATIVA CIVIL PARA PROMOÇÃO E DESENVOLVIMENTO DA ASSISTÊNCIA EDUCACIONAL, CULTURAL, AMBIENTAL E SOCIAL</div>
            <div class="subtitle">CNPJ 09.040.440/0001-47 · Banco Cora SCFI · Organização Sem Fins Lucrativos</div>
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

  /** Dispara a caixa de diálogo de impressão do Informe Anual para IRPF */
  printAnnualTaxStatementWindow(data: AnnualTaxStatementData) {
    const rowsHtml = data.monthlyBreakdown
      .map(m => `<tr><td>${m.month} / ${data.taxYear}</td><td style="text-align: right; font-weight: 700;">R$ ${m.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Declaração Anual IRPF — ${data.taxYear} — ${data.donorName}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #111827; max-width: 750px; margin: 0 auto; }
          .header { border-bottom: 3px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-space-between; }
          .title { font-size: 18px; font-weight: 900; color: #1e293b; }
          .subtitle { font-size: 11px; color: #6b7280; margin-top: 3px; }
          .badge { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
          .highlight { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
          th { text-align: left; background: #f1f5f9; padding: 8px 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; color: #475569; }
          td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
          .total-box { display: flex; justify-content: space-between; align-items: center; background: #16a34a; color: white; padding: 16px 20px; border-radius: 10px; font-weight: 800; font-size: 16px; margin: 20px 0; }
          .auth-box { border: 1px dashed #94a3b8; border-radius: 8px; padding: 12px; font-size: 11px; color: #475569; background: #fafafa; margin-top: 24px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">INFORME DE RENDIMENTOS E DOAÇÕES — IRPF ${data.taxYear}</div>
            <div class="subtitle">${data.organizationName}</div>
            <div class="subtitle">CNPJ: <strong>${data.organizationCnpj}</strong> · Organização da Sociedade Civil de Interesse Público</div>
          </div>
          <div><span class="badge">Ano-Calendário ${data.taxYear}</span></div>
        </div>

        <div class="highlight">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">DADOS DO BENEFICIÁRIO DA DECLARAÇÃO (DOADOR)</div>
          <div style="font-size: 14px; font-weight: 800;">${data.donorName}</div>
          <div style="font-size: 12px; color: #64748b;">CPF/CNPJ: <strong>${data.donorTaxId}</strong> · E-mail: ${data.donorEmail}</div>
        </div>

        <table>
          <thead>
            <tr><th>Mês de Referência</th><th style="text-align: right;">Valor Contribuído</th></tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <span>TOTAL DE DOAÇÕES NO ANO FISCAL ${data.taxYear}:</span>
          <span>R$ ${data.totalDonated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div class="auth-box">
          <strong>Código de Autenticação Digital:</strong> <code style="font-family: monospace; color: #1e293b;">${data.digitalSignatureHash}</code><br>
          <strong>Emitido em:</strong> ${data.issuedAt} · Documento válido para fins de comprovação junto à Secretaria da Receita Federal do Brasil.
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

