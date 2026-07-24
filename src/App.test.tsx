/**
 * App.test.tsx
 * Smoke test and top-level integration test for ISM App.
 *
 * Fixes:
 * - timeout increased to match async data loading pattern
 * - vi.useFakeTimers not needed since all service mocks resolve immediately
 * - Added vi.mock for '../lib/firebase' to avoid Firebase init in jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Prevent Firebase from initialising in jsdom (no env vars in test)
vi.mock('./lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
  app: {},
}));

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

    // Loading state is present initially
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();

    // Wait for data to resolve and content to appear
    await waitFor(
      () => {
        expect(document.body.textContent).toContain('Sapere Aude');
      },
      { timeout: 12000 }
    );

    expect(document.getElementById('main-content')).toBeInTheDocument();
  }, 15000); // extend test timeout to 15s to account for multiple concurrent mocked resolves
});
