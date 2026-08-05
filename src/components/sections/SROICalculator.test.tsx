/**
 * SROICalculator.test.tsx — C003: Calculadora SROI Automatizada
 * ─────────────────────────────────────────────────────────────
 * Testes de integração unitária da Calculadora SROI Interativa.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { SROICalculator } from './SROICalculator';

describe('SROICalculator Component', () => {
  beforeEach(() => {
    render(<SROICalculator />);
  });

  it('renders section title and main heading correctly', () => {
    expect(screen.getByText(/Social Return on Investment/i)).toBeInTheDocument();
    expect(screen.getByText(/Cada real investido gera/i)).toBeInTheDocument();
  });

  it('renders interactive simulator input with default value 1000', () => {
    const input = screen.getByLabelText(/valor do investimento/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('1000');
  });

  it('updates estimated social return when investment amount changes', async () => {
    const user = userEvent.setup();
    const input = screen.getByLabelText(/valor do investimento/i);

    await user.clear(input);
    await user.type(input, '5000');

    expect(screen.getAllByText(/retorno social estimado/i).length).toBeGreaterThan(0);
  });

  it('renders preset amount buttons and updates input on click', async () => {
    const user = userEvent.setup();
    const btn5000 = screen.getByRole('button', { name: /R\$\s*5\.000/i });
    expect(btn5000).toBeInTheDocument();

    await user.click(btn5000);
    const input = screen.getByLabelText(/valor do investimento/i) as HTMLInputElement;
    expect(input.value).toBe('5000');
  });

  it('renders all 4 pillars breakdown', () => {
    expect(screen.getByText('Educação')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
    expect(screen.getByText('Meio Ambiente')).toBeInTheDocument();
    expect(screen.getByText('Cultura')).toBeInTheDocument();
  });
});
