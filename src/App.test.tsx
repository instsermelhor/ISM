/**
 * App.test.tsx
 * Smoke test and top-level integration test for ISM App.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Prevent Firebase from initialising in jsdom
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
          title: 'Instituto Ser Melhor',
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
    getMetrics: vi.fn().mockResolvedValue([]),
    getPillars: vi.fn().mockResolvedValue([]),
    getNavigation: vi.fn().mockResolvedValue(null),
    getFooter: vi.fn().mockResolvedValue(null),
    getHeroSection: vi.fn().mockResolvedValue(null),
    getBlogPosts: vi.fn().mockResolvedValue([]),
    getPartners: vi.fn().mockResolvedValue([]),
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
  }, 15000);
});
