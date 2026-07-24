/**
 * TransparencyPortal.test.tsx
 * Integration tests for the TransparencyReport document filter functionality.
 * Tests: year filter, category filter, text search, download links, paginator.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { TransparencyReport } from './TransparencyReport';
import type { TransparencyDocument, FinancialEntry } from '../../types';

/* ── Mock data ── */
const mockDocuments: TransparencyDocument[] = [
  {
    id: 1,
    documentName: 'Relatório Anual 2024',
    documentType: 'Impacto',
    documentFile: 'https://example.com/relatorio-2024.pdf',
    publicationDate: '2024-03-15',
    fileSize: '4.2 MB',
  },
  {
    id: 2,
    documentName: 'Demonstrações Financeiras 2023',
    documentType: 'Financeiro',
    documentFile: 'https://example.com/financas-2023.pdf',
    publicationDate: '2023-06-01',
    fileSize: '2.1 MB',
  },
  {
    id: 3,
    documentName: 'Estatuto Social ISM',
    documentType: 'Legal',
    documentFile: 'https://example.com/estatuto.pdf',
    publicationDate: '2022-01-10',
    fileSize: '800 KB',
  },
  {
    id: 4,
    documentName: 'Código de Conduta 2024',
    documentType: 'Código de Conduta',
    documentFile: 'https://example.com/codigo-conduta.pdf',
    publicationDate: '2024-02-01',
    fileSize: '1.5 MB',
  },
  {
    id: 5,
    documentName: 'Prestação de Contas 2023',
    documentType: 'Financeiro',
    documentFile: 'https://example.com/prestacao-2023.pdf',
    publicationDate: '2023-12-31',
    fileSize: '3.0 MB',
  },
];

const mockFinancials: FinancialEntry[] = [
  { id: 1, name: 'Programas', value: 75, color: '#16a34a' },
  { id: 2, name: 'Admin', value: 15, color: '#1e293b' },
  { id: 3, name: 'Captação', value: 10, color: '#94a3b8' },
];

const defaultProps = {
  documents: mockDocuments,
  financials: mockFinancials,
  intro: 'Transparência total em nossas operações.',
  efficiencyPct: 90,
};

describe('TransparencyReport — Document Filters', () => {
  beforeEach(() => {
    render(<TransparencyReport {...defaultProps} />);
  });

  /* ── 1. All documents visible initially ── */
  it('shows all documents when no filter is applied', () => {
    // Should show result count
    expect(
      screen.getByText(/5 documentos encontrados/i),
    ).toBeInTheDocument();
  });

  /* ── 2. Year filter ── */
  it('filters documents by year', async () => {
    const user = userEvent.setup();
    const yearSelect = screen.getByLabelText(/filtrar por ano/i);

    await user.selectOptions(yearSelect, '2024');

    // 2024 has 2 docs (Relatório 2024 + Código de Conduta 2024)
    expect(screen.getByText(/2 documentos encontrados/i)).toBeInTheDocument();
    expect(screen.getByText('Relatório Anual 2024')).toBeInTheDocument();
    expect(screen.getByText('Código de Conduta 2024')).toBeInTheDocument();
    expect(screen.queryByText('Demonstrações Financeiras 2023')).not.toBeInTheDocument();
  });

  /* ── 3. Category filter ── */
  it('filters documents by category', async () => {
    const user = userEvent.setup();
    const catSelect = screen.getByLabelText(/filtrar por categoria/i);

    await user.selectOptions(catSelect, 'Financeiro');

    // 2 Financeiro docs
    expect(screen.getByText(/2 documentos encontrados/i)).toBeInTheDocument();
    expect(screen.getByText('Demonstrações Financeiras 2023')).toBeInTheDocument();
    expect(screen.getByText('Prestação de Contas 2023')).toBeInTheDocument();
    expect(screen.queryByText('Estatuto Social ISM')).not.toBeInTheDocument();
  });

  /* ── 4. Text search filter ── */
  it('filters documents by text search', async () => {
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/buscar documento/i);

    await user.type(searchInput, 'Estatuto');

    expect(screen.getByText(/1 documento encontrado/i)).toBeInTheDocument();
    expect(screen.getByText('Estatuto Social ISM')).toBeInTheDocument();
    expect(screen.queryByText('Relatório Anual 2024')).not.toBeInTheDocument();
  });

  /* ── 5. No results state ── */
  it('shows empty state when no documents match filter', async () => {
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/buscar documento/i);

    await user.type(searchInput, 'xyznotexistent');

    expect(screen.getByText(/Nenhum documento encontrado/i)).toBeInTheDocument();
    expect(screen.getByText(/Nenhum documento corresponde/i)).toBeInTheDocument();
  });

  /* ── 6. Combined year + category filter ── */
  it('applies year and category filters simultaneously', async () => {
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/filtrar por ano/i), '2023');
    await user.selectOptions(screen.getByLabelText(/filtrar por categoria/i), 'Financeiro');

    expect(screen.getByText(/2 documentos encontrados/i)).toBeInTheDocument();
  });

  /* ── 7. Live region updates on filter change ── */
  it('aria-live region updates result count after filtering', async () => {
    const user = userEvent.setup();
    const liveEl = document.querySelector('[aria-live="polite"]');
    expect(liveEl).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filtrar por ano/i), '2024');
    expect(liveEl?.textContent).toMatch(/2 documentos encontrados/i);
  });
});

describe('TransparencyReport — Download Links', () => {
  beforeEach(() => {
    render(<TransparencyReport {...defaultProps} />);
  });

  /* ── 8. Download links have download attribute ── */
  it('all document download links have the download attribute', () => {
    const downloadLinks = screen.getAllByRole('link', { name: /baixar.*PDF/i });
    expect(downloadLinks.length).toBeGreaterThan(0);
    downloadLinks.forEach((link) => {
      expect(link).toHaveAttribute('download');
    });
  });

  /* ── 9. Download links have descriptive aria-label ── */
  it('all download links have descriptive aria-label including document name', () => {
    const downloadLinks = screen.getAllByRole('link', { name: /baixar/i });
    downloadLinks.forEach((link) => {
      const label = link.getAttribute('aria-label') || '';
      expect(label).toMatch(/baixar/i);
      expect(label.length).toBeGreaterThan(10); // not just "Baixar"
    });
  });

  /* ── 10. Download links have valid href ── */
  it('all download links have non-empty href', () => {
    const downloadLinks = screen.getAllByRole('link', { name: /baixar/i });
    downloadLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      expect(href).not.toBe('');
      expect(href).not.toBe('#');
    });
  });
});
