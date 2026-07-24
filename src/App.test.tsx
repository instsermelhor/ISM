/**
 * App.test.tsx
 * Smoke test and top-level integration test for ISM App.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('./services/data', () => ({
  InstitutionalService: {
    getPage: vi.fn().mockResolvedValue({
      data: {
        attributes: {
          title: 'Instituto Ser Melhor — Transformando Vidas',
          introduction: 'Construindo o futuro.',
          motto: 'Sapere Aude',
          mottoExplanation: 'Ouse Saber',
          heroImage: '/hero.jpg',
          governanceIntro: 'Nossa estrutura',
          transparencyIntro: 'Transparência total',
          transparencyDocuments: [],
        },
      },
    }),
    getValueBlocks: vi.fn().mockResolvedValue({ data: [] }),
    getGovernanceInstances: vi.fn().mockResolvedValue({ data: [] }),
    getTimelineMilestones: vi.fn().mockResolvedValue({ data: [] }),
    getGovernanceMembers: vi.fn().mockResolvedValue({ data: [] }),
    getPrograms: vi.fn().mockResolvedValue([]),
    getServicesPage: vi.fn().mockResolvedValue({}),
    getDonationSection: vi.fn().mockResolvedValue({}),
    getSeoSettings: vi.fn().mockResolvedValue({ siteTitle: 'ISM Test' }),
  },
}));

describe('App Smoke Test', () => {
  it('renders loading screen initially then displays main page content', async () => {
    render(<App />);

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(document.body.textContent).toContain('Sapere Aude');
    }, { timeout: 8000 });

    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
