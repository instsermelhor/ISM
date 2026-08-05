/**
 * DonationFlow.test.tsx
 * Integration tests for the DonationForm with multi-step payment flow:
 * select → payment_method → (pix_panel | boleto_panel | details) → processing → success
 *
 * C002: Gateway de Doações — PIX CNPJ 09.040.440/0001-47, Cartão e Boleto.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DonationForm } from '../payment/DonationForm';

/* ── Mock InstitutionalService ── */
vi.mock('../../services/data', () => ({
  InstitutionalService: {
    processDonation: vi.fn(),
  },
}));

import { InstitutionalService } from '../../services/data';

/** Helper: vai do step 'select' ao step 'payment_method' */
const goToPaymentMethod = async (user: ReturnType<typeof userEvent.setup>) => {
  const continueBtn = screen.getByTestId('continue-btn');
  await user.click(continueBtn);
  await screen.findByRole('heading', { name: /forma de pagamento/i });
};

/**
 * Helper: vai do step 'select' até o step 'details' (via Cartão de Crédito).
 * Cartão é o único meio que leva direto a 'details'.
 */
const goToDetails = async (user: ReturnType<typeof userEvent.setup>) => {
  await goToPaymentMethod(user);
  // Seleciona Cartão de Crédito
  const cartaoBtn = screen.getByRole('button', { name: /cartão de crédito/i });
  await user.click(cartaoBtn);
  // Clica em 'Continuar com Cartão'
  const continueWithCard = screen.getByRole('button', { name: /continuar com cart/i });
  await user.click(continueWithCard);
  await screen.findByRole('heading', { name: /identificação/i });
};

describe('DonationForm — Pillar Selector', () => {
  beforeEach(() => {
    render(<DonationForm />);
  });

  it('renders all 5 pillar options (Geral + 4 pillars)', () => {
    const group = screen.getByRole('group', { name: /escolha o pilar de destino/i });
    const buttons = group.querySelectorAll('button');
    expect(buttons).toHaveLength(5);

    const labels = Array.from(buttons).map((b) => b.textContent);
    expect(labels).toContain('Geral');
    expect(labels.some((l) => l?.includes('Educação'))).toBe(true);
    expect(labels.some((l) => l?.includes('Social'))).toBe(true);
    expect(labels.some((l) => l?.includes('Meio Ambiente'))).toBe(true);
    expect(labels.some((l) => l?.includes('Cultura'))).toBe(true);
  });

  it('Geral is selected by default (aria-pressed=true)', () => {
    const group = screen.getByRole('group', { name: /escolha o pilar de destino/i });
    const buttons = group.querySelectorAll('button');
    const geralBtn = Array.from(buttons).find((b) => b.textContent?.includes('Geral'));
    expect(geralBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('selects a different pillar when clicked', async () => {
    const user = userEvent.setup();
    const group = screen.getByRole('group', { name: /escolha o pilar de destino/i });
    const buttons = group.querySelectorAll('button');
    const educBtn = Array.from(buttons).find((b) => b.textContent?.includes('Educação'))!;

    await user.click(educBtn);
    expect(educBtn).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('DonationForm — Amount Validation', () => {
  beforeEach(() => {
    render(<DonationForm />);
  });

  it('shows error when custom amount below R$5', async () => {
    const user = userEvent.setup();
    const customInput = screen.getByLabelText(/valor personalizado/i);

    await user.clear(customInput);
    await user.type(customInput, '3');

    const continueBtn = screen.getByTestId('continue-btn');
    await user.click(continueBtn);

    expect(await screen.findByText(/valor mínimo/i)).toBeInTheDocument();
  });

  it('does NOT show amount error when valid amount is selected', async () => {
    const user = userEvent.setup();
    await goToPaymentMethod(user);
    // Chegou ao passo de Forma de Pagamento — significa que não houve erro de valor
    expect(screen.queryByText(/valor mínimo/i)).not.toBeInTheDocument();
  });

  it('preset amount buttons update the selected amount on click', async () => {
    const user = userEvent.setup();
    const presetBtns = screen.getAllByRole('button', { name: /R\$/i });
    const btn200 = presetBtns.find((b) => b.textContent?.includes('200'));
    if (btn200) {
      await user.click(btn200);
      expect(btn200).toHaveAttribute('aria-pressed', 'true');
    }
  });
});

describe('DonationForm — Payment Method Step (C002)', () => {
  beforeEach(() => {
    render(<DonationForm />);
  });

  it('shows payment method selector after continuing from amount step', async () => {
    const user = userEvent.setup();
    await goToPaymentMethod(user);
    expect(screen.getByRole('heading', { name: /forma de pagamento/i })).toBeInTheDocument();
  });

  it('PIX is selected by default in payment method step', async () => {
    const user = userEvent.setup();
    await goToPaymentMethod(user);
    const pixBtn = screen.getByRole('button', { name: /pix instant/i });
    expect(pixBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('navigates to PIX panel when PIX is selected and continued', async () => {
    const user = userEvent.setup();
    await goToPaymentMethod(user);
    // PIX já está selecionado por padrão
    const continueBtn = screen.getByRole('button', { name: /continuar com pix/i });
    await user.click(continueBtn);
    // Deve mostrar o painel PIX com chave CNPJ
    expect(await screen.findByText(/09\.040\.440\/0001-47/i)).toBeInTheDocument();
  });

  it('displays official ISM CNPJ PIX key in PIX panel', async () => {
    const user = userEvent.setup();
    await goToPaymentMethod(user);
    const continueBtn = screen.getByRole('button', { name: /continuar com pix/i });
    await user.click(continueBtn);
    expect(await screen.findByText('09.040.440/0001-47')).toBeInTheDocument();
  });

  it('copy button is present in PIX panel', async () => {
    const user = userEvent.setup();
    await goToPaymentMethod(user);
    await user.click(screen.getByRole('button', { name: /continuar com pix/i }));
    await screen.findByText('09.040.440/0001-47');
    const copyBtn = screen.getByRole('button', { name: /copiar chave pix/i });
    expect(copyBtn).toBeInTheDocument();
  });

  it('clicking "Já realizei o Pix" goes to success state', async () => {
    const user = userEvent.setup();
    await goToPaymentMethod(user);
    await user.click(screen.getByRole('button', { name: /continuar com pix/i }));
    await screen.findByText('09.040.440/0001-47');
    const confirmBtn = screen.getByRole('button', { name: /já realizei o pix/i });
    await user.click(confirmBtn);
    expect(await screen.findByText(/Muito Obrigado!/i)).toBeInTheDocument();
    expect(screen.getByText(/Transação Aprovada/i)).toBeInTheDocument();
  });
});

describe('DonationForm — Details Step Validation (zod)', () => {
  beforeEach(() => {
    render(<DonationForm />);
  });

  it('shows name validation error on empty submit', async () => {
    const user = userEvent.setup();
    await goToDetails(user);

    const submitBtn = screen.getByTestId('submit-btn');
    await user.click(submitBtn);

    expect(await screen.findByText(/nome deve ter pelo menos 3/i)).toBeInTheDocument();
  });

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup();
    await goToDetails(user);

    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/e-mail/i), 'not-an-email');

    await user.click(screen.getByTestId('submit-btn'));

    expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
  });

  it('shows consent validation error when checkbox not checked', async () => {
    const user = userEvent.setup();
    await goToDetails(user);

    await user.type(screen.getByLabelText(/nome completo/i), 'Maria Santos');
    await user.type(screen.getByLabelText(/e-mail/i), 'maria@exemplo.com');

    await user.click(screen.getByTestId('submit-btn'));

    expect(await screen.findByText(/aceitar a Política de Privacidade/i)).toBeInTheDocument();
  });

  it('shows CPF validation error for invalid CPF', async () => {
    const user = userEvent.setup();
    await goToDetails(user);

    await user.type(screen.getByLabelText(/CPF/i), '123'); // too short

    await user.click(screen.getByTestId('submit-btn'));

    expect(await screen.findByText(/CPF deve ter 11 dígitos/i)).toBeInTheDocument();
  });
});

describe('DonationForm — Successful Payment Flow', () => {
  it('shows success state after successful donation via Cartão', async () => {
    const user = userEvent.setup();

    (InstitutionalService.processDonation as any).mockResolvedValueOnce({
      transactionId: 'TXN-TEST-12345',
    });

    render(<DonationForm />);

    // Step 1: Continue → payment_method
    await goToDetails(user);

    // Step 2: Fill form
    await user.type(screen.getByLabelText(/nome completo/i), 'Carlos Ferreira');
    await user.type(screen.getByLabelText(/e-mail/i), 'carlos@ism.org.br');

    // Check LGPD consent
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);

    // Submit
    await user.click(screen.getByTestId('submit-btn'));

    // Should show success
    expect(await screen.findByText(/Muito Obrigado!/i)).toBeInTheDocument();
    expect(screen.getByText(/Transação Aprovada/i)).toBeInTheDocument();
    expect(screen.getByText(/TXN-TEST-12345/i)).toBeInTheDocument();
  });

  it('shows error message when payment API fails', async () => {
    const user = userEvent.setup();

    (InstitutionalService.processDonation as any).mockRejectedValueOnce(
      new Error('Payment failed'),
    );

    render(<DonationForm />);

    await goToDetails(user);

    // Fill valid form
    await user.type(screen.getByLabelText(/nome completo/i), 'Ana Lima');
    await user.type(screen.getByLabelText(/e-mail/i), 'ana@ism.org.br');
    await user.click(screen.getByRole('checkbox'));

    // Submit
    await user.click(screen.getByTestId('submit-btn'));

    // Should show error
    expect(
      await screen.findByText(/erro ao processar doação/i),
    ).toBeInTheDocument();
  });

  it('processDonation is called with correct pillar payload', async () => {
    const user = userEvent.setup();

    (InstitutionalService.processDonation as any).mockResolvedValueOnce({
      transactionId: 'TXN-PILLAR-001',
    });

    render(<DonationForm initialPillar="Educação" />);

    // Select Educação pillar explicitly
    const group = screen.getByRole('group', { name: /escolha o pilar de destino/i });
    const educBtn = Array.from(group.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Educação'),
    )!;
    await user.click(educBtn);

    // Navigate to details via Cartão
    await goToDetails(user);

    await user.type(screen.getByLabelText(/nome completo/i), 'Pedro Costa');
    await user.type(screen.getByLabelText(/e-mail/i), 'pedro@ism.org.br');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByTestId('submit-btn'));

    await screen.findByText(/Muito Obrigado!/i);

    expect(InstitutionalService.processDonation).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationPillar: 'Educação',
        donorName: 'Pedro Costa',
        donorEmail: 'pedro@ism.org.br',
      }),
    );
  });
});
