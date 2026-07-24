/**
 * DonationFlow.test.tsx
 * Integration tests for the DonationForm with react-hook-form + zod validation.
 * Tests: field validation, pillar selector, PIX/payment flow, success state.
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
    // Click a preset amount (R$100 — default)
    const continueBtn = screen.getByTestId('continue-btn');
    await user.click(continueBtn);

    // Should navigate to details step
    expect(await screen.findByRole('heading', { name: /identificação/i })).toBeInTheDocument();
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

describe('DonationForm — Details Step Validation (zod)', () => {
  const goToDetails = async (user: ReturnType<typeof userEvent.setup>) => {
    const continueBtn = screen.getByTestId('continue-btn');
    await user.click(continueBtn);
    await screen.findByRole('heading', { name: /identificação/i });
  };

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
  it('shows success state after successful donation', async () => {
    const user = userEvent.setup();

    (InstitutionalService.processDonation as any).mockResolvedValueOnce({
      transactionId: 'TXN-TEST-12345',
    });

    render(<DonationForm />);

    // Step 1: Continue
    const continueBtn = screen.getByTestId('continue-btn');
    await user.click(continueBtn);
    await screen.findByRole('heading', { name: /identificação/i });

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

    // Navigate to details
    await user.click(screen.getByTestId('continue-btn'));
    await screen.findByRole('heading', { name: /identificação/i });

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

    // Navigate to details
    await user.click(screen.getByTestId('continue-btn'));
    await screen.findByRole('heading', { name: /identificação/i });

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
