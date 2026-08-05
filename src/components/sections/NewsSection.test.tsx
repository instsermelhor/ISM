/**
 * NewsSection.test.tsx — C004: Hub de Notícias, Mídia e Artigos do Blog
 * ───────────────────────────────────────────────────────────────────
 * Testes de integração unitária do NewsSection.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { NewsSection } from './NewsSection';

describe('NewsSection Component', () => {
  beforeEach(() => {
    render(<NewsSection />);
  });

  it('renders section title and main heading correctly', () => {
    expect(screen.getByText(/Hub de Notícias/i)).toBeInTheDocument();
    expect(screen.getByText(/Notícias e/i)).toBeInTheDocument();
  });

  it('renders search input for articles', () => {
    const input = screen.getByLabelText(/buscar artigos do blog/i);
    expect(input).toBeInTheDocument();
  });

  it('renders default category filter buttons', () => {
    const allBtn = screen.getByRole('tab', { name: /todos/i });
    expect(allBtn).toBeInTheDocument();
    expect(allBtn).toHaveAttribute('aria-selected', 'true');
  });

  it('renders fallback blog posts when props are empty', () => {
    expect(screen.getAllByText(/Relatório de Impacto Socioambiental 2024/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Projeto AURA/i).length).toBeGreaterThan(0);
  });

  it('filters posts based on search input query', async () => {
    const user = userEvent.setup();
    const input = screen.getByLabelText(/buscar artigos do blog/i);

    await user.type(input, 'AURA');

    expect(screen.getAllByText(/Projeto AURA/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Inovação Educacional/i)).not.toBeInTheDocument();
  });

  it('opens post modal when clicking on an article card', async () => {
    const user = userEvent.setup();
    const articleCard = screen.getByRole('button', { name: /ler artigo: relatório de impacto/i });

    await user.click(articleCard);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Metodologia M-IS/i)).toBeInTheDocument();
  });
});
