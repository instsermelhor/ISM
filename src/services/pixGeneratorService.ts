/**
 * pixGeneratorService.ts — E001: Engine de Geração de PIX Dinâmico EMV (Padrão Banco Central do Brasil)
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Gera payload PIX Copia e Cola no padrão EMV QRCPS-MPM (Bacen) com CRC16-CCITT real.
 * Chave PIX Oficial (CNPJ): 09.040.440/0001-47
 */

export interface PixPayloadParams {
  chave: string; // CNPJ ou Chave Pix
  nomeRecebedor: string;
  cidade: string;
  valor?: number;
  txid?: string;
}

/** Calcula CRC16-CCITT (polynomial 0x1021, init 0xFFFF) exigido pelo Padrão Bacen */
export function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Formata campo EMV de tamanho fixo: ID (2 dígitos) + Tamanho (2 dígitos) + Valor */
function formatEMVField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export const PixGeneratorService = {
  /** Chave PIX CNPJ Oficial ISM */
  ISM_CNPJ: '09.040.440/0001-47',
  ISM_CNPJ_CLEAN: '09040440000147',
  RECEBEDOR_NOME: 'ORGANIZACAO ASSOC CIVIL',
  RECEBEDOR_NOME_COMPLETO: 'ORGANIZAÇÃO ASSOCIATIVA CIVIL PARA PROMOÇÃO E DESENVOLVIMENTO DA ASSISTÊNCIA EDUCACIONAL, CULTURAL, AMBIENTAL E SOCIAL',
  BANCO_NOME: 'Cora SCFI',
  RECEBEDOR_CIDADE: 'SAO PAULO',

  /**
   * Gera a string EMV completa do PIX Copia e Cola para doações
   */
  generatePayload(params: Partial<PixPayloadParams> = {}): string {
    const chaveClean = (params.chave || this.ISM_CNPJ_CLEAN).replace(/\D/g, '');
    const nome = (params.nomeRecebedor || this.RECEBEDOR_NOME).substring(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cidade = (params.cidade || this.RECEBEDOR_CIDADE).substring(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const txid = (params.txid || '***').substring(0, 25);

    // Merchant Account Info (GUI + Chave)
    const guiField = formatEMVField('00', 'br.gov.bcb.pix');
    const chaveField = formatEMVField('01', chaveClean);
    const merchantAccount = formatEMVField('26', `${guiField}${chaveField}`);

    // Additional Data Field (TXID)
    const txidField = formatEMVField('05', txid);
    const additionalData = formatEMVField('62', txidField);

    let payload = [
      formatEMVField('00', '01'), // Payload Format Indicator
      merchantAccount,
      formatEMVField('52', '0000'), // Merchant Category Code
      formatEMVField('53', '986'),  // Currency BRL
    ].join('');

    if (params.valor && params.valor > 0) {
      payload += formatEMVField('54', params.valor.toFixed(2));
    }

    payload += [
      formatEMVField('58', 'BR'),     // Country Code
      formatEMVField('59', nome),   // Merchant Name
      formatEMVField('60', cidade), // Merchant City
      additionalData,
      '6304',                       // CRC16 ID + Length
    ].join('');

    const calculatedCrc = crc16(payload);
    return `${payload}${calculatedCrc}`;
  },
};
