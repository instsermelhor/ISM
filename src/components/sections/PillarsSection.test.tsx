/**
 * PillarsSection.test.tsx
 * Integration tests for the 4-pillar interactive section.
 * Tests: correct order, tab switching, ARIA attributes, keyboard navigation.
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { PillarsSection } from './PillarsSection';

describe('PillarsSection', () => {
  beforeEach(() => {
    render(<PillarsSection />);
  });

  /* ── 1. All 4 pillar tabs rendered in correct order ── */
  it('renders all 4 pillar tabs in the correct institutional order', () => {
    const tablist = screen.getByRole('tablist', { name: /pilares institucionais/i });
    const tabs = within(tablist).getAllByRole('tab');

    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveTextContent(/Educação/i);
    expect(tabs[1]).toHaveTextContent(/Social/i);
    expect(tabs[2]).toHaveTextContent(/Meio Ambiente/i);
    expect(tabs[3]).toHaveTextContent(/Cultura/i);
  });

  /* ── 2. First pillar active by default ── */
  it('has Educação as the default active tab', () => {
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[3]).toHaveAttribute('aria-selected', 'false');
  });

  /* ── 3. Clicking Social tab changes content ── */
  it('shows Social pillar content when Social tab is clicked', async () => {
    const user = userEvent.setup();
    const tabs = screen.getAllByRole('tab');

    await user.click(tabs[1]); // Social

    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');

    // Content changes
    const panel = screen.getByRole('tabpanel');
    expect(panel).toBeInTheDocument();
  });

  /* ── 4. Tab panel has correct ARIA relationship ── */
  it('links each tab to its panel via aria-controls / aria-labelledby', () => {
    const tabs = screen.getAllByRole('tab');
    const panel = screen.getByRole('tabpanel');

    const controlledId = tabs[0].getAttribute('aria-controls');
    expect(panel.getAttribute('id')).toBe(controlledId);
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0].getAttribute('id'));
  });

  /* ── 5. Keyboard: ArrowRight moves to next tab ── */
  it('moves focus to next tab on ArrowRight key', async () => {
    const user = userEvent.setup();
    const tabs = screen.getAllByRole('tab');

    // Focus first tab
    tabs[0].focus();
    expect(document.activeElement).toBe(tabs[0]);

    // Press ArrowRight
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  /* ── 6. Keyboard: ArrowLeft wraps around ── */
  it('wraps around to last tab on ArrowLeft from first tab', async () => {
    const user = userEvent.setup();
    const tabs = screen.getAllByRole('tab');

    tabs[0].focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tabs[3]); // wraps to Cultura
    expect(tabs[3]).toHaveAttribute('aria-selected', 'true');
  });

  /* ── 7. Keyboard: End key goes to last tab ── */
  it('moves focus to last tab on End key', async () => {
    const user = userEvent.setup();
    const tabs = screen.getAllByRole('tab');

    tabs[0].focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(tabs[3]);
  });

  /* ── 8. Keyboard: Home key goes to first tab ── */
  it('moves focus to first tab on Home key', async () => {
    const user = userEvent.setup();
    const tabs = screen.getAllByRole('tab');

    // Navigate to last tab first
    tabs[3].focus();
    tabs[3].click();
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(tabs[0]);
  });

  /* ── 9. Section has accessible landmark ── */
  it('wraps content in a section with a descriptive aria-label', () => {
    expect(
      screen.getByRole('region', { name: /4 Pilares do Instituto Ser Melhor/i }),
    ).toBeInTheDocument();
  });

  /* ── 10. CTA link present in active panel ── */
  it('renders a CTA link in the active tab panel', () => {
    const panel = screen.getByRole('tabpanel');
    const link = within(panel).getByRole('link', { name: /Ver projetos deste pilar/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#programs');
  });
});
