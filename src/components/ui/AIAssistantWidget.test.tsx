/**
 * AIAssistantWidget.test.tsx — D001: Agente IA de Atendimento & Captação
 * ───────────────────────────────────────────────────────────────────────
 * Testes de integração unitária do Assistente IA de Atendimento.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { AIAssistantWidget } from './AIAssistantWidget';

describe('AIAssistantWidget Component', () => {
  beforeEach(() => {
    render(<AIAssistantWidget />);
  });

  it('renders floating assistant toggle button', () => {
    const toggleBtn = screen.getByRole('button', { name: /abrir assistente virtual de ia/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('opens chat dialog on button click', async () => {
    const user = userEvent.setup();
    const toggleBtn = screen.getByRole('button', { name: /abrir assistente virtual de ia/i });

    await user.click(toggleBtn);

    expect(screen.getByRole('dialog', { name: /assistente virtual de atendimento ism/i })).toBeInTheDocument();
    expect(screen.getByText(/Assistente de Impacto do Instituto Ser Melhor/i)).toBeInTheDocument();
  });

  it('sends a PIX query and receives response with official CNPJ', async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /abrir assistente virtual de ia/i }));

    const pixQuickBtn = screen.getByRole('button', { name: /como doar via pix/i });
    await user.click(pixQuickBtn);

    await waitFor(() => {
      expect(screen.getByText(/09\.040\.440\/0001-47/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('sends a custom input message and receives contextual AI reply', async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /abrir assistente virtual de ia/i }));

    const input = screen.getByPlaceholderText(/digite sua dúvida/i);
    await user.type(input, 'Qual a razão SROI?');

    const sendBtn = screen.getByRole('button', { name: /enviar mensagem/i });
    await user.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Social Return on Investment/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
