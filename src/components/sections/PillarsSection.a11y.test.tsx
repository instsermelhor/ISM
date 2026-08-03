/**
 * PillarsSection.a11y.test.tsx
 * Automated accessibility audits using vitest-axe / axe-core.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import { PillarsSection } from './PillarsSection';
import { ImpactMetrics } from './ImpactMetrics';

describe('Accessibility Audits (axe-core)', () => {
  it('PillarsSection has 0 critical accessibility violations', async () => {
    const { container } = render(<PillarsSection />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('ImpactMetrics has 0 critical accessibility violations', async () => {
    const { container } = render(<ImpactMetrics />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
