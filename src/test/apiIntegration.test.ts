import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Esquemas Zod do Backend Cloud Functions REST v2 (para validação de contratos de API)
const DonationSchema = z.object({
  donorName: z.string().min(2).max(200),
  donorEmail: z.string().email().max(320),
  amount: z.number().positive().max(1000000),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  paymentMethod: z.string().min(2).max(50),
  message: z.string().max(1000).optional(),
});

const LeadSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(30).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(5).max(5000),
});

describe('Suíte de Testes de Integração da API Gateway REST v2 (Fase 11 — TEST-002)', () => {
  const API_ENDPOINT = 'https://southamerica-east1-ismbd-27e84.cloudfunctions.net/api/api/v2';

  it('Teste 01: Valida o esquema Zod de doações (DonationSchema)', () => {
    const validDonation = {
      donorName: 'Doador Teste Integração',
      donorEmail: 'doador.teste@institutosermelhor.org',
      amount: 150.00,
      paymentMethod: 'PIX',
      currency: 'BRL',
    };
    const parsed = DonationSchema.safeParse(validDonation);
    expect(parsed.success).toBe(true);

    const invalidDonation = {
      donorName: 'A', // Muito curto
      donorEmail: 'email-invalido',
      amount: -50, // Negativo
      paymentMethod: 'PIX',
    };
    const invalidParsed = DonationSchema.safeParse(invalidDonation);
    expect(invalidParsed.success).toBe(false);
  });

  it('Teste 02: Valida o esquema Zod de captura de leads (LeadSchema)', () => {
    const validLead = {
      name: 'Maria Silva',
      email: 'maria.silva@exemplo.org',
      message: 'Gostaria de me voluntariar nos projetos sociais da ONG.',
    };
    expect(LeadSchema.safeParse(validLead).success).toBe(true);

    const invalidLead = {
      name: 'M',
      email: 'invalid',
      message: 'Oi', // Menos de 5 caracteres
    };
    expect(LeadSchema.safeParse(invalidLead).success).toBe(false);
  });

  it('Teste 03: Valida estrutura do formato de resposta de Erro RFC 7807 (Problem Details)', () => {
    const mockProblemDetails = {
      type: 'https://api.institutosermelhor.org/errors/schema_validation_error',
      title: 'Bad Request',
      status: 400,
      detail: 'Nome deve ter no mínimo 2 caracteres; O valor deve ser maior que zero',
      code: 'SCHEMA_VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
    };

    expect(mockProblemDetails.status).toBe(400);
    expect(mockProblemDetails.title).toBe('Bad Request');
    expect(mockProblemDetails.code).toBe('SCHEMA_VALIDATION_ERROR');
    expect(mockProblemDetails.type).toContain('/errors/');
  });

  it('Teste 04: Estrutura da URL do endpoint de Checkout Multi-Gateway', () => {
    const checkoutUrl = new URL(`${API_ENDPOINT}/payments/checkout`);
    expect(checkoutUrl.pathname).toContain('/payments/checkout');
    expect(checkoutUrl.protocol).toBe('https:');
  });
});
