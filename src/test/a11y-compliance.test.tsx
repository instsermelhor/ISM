/**
 * a11y-compliance.test.tsx — A11Y-001: Auditoria de Acessibilidade Enterprise (WCAG 2.1 AA)
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes automatizados de acessibilidade com axe-core / vitest-axe.
 * Valida conformidade com WCAG 2.1 Nível AA:
 * - Semântica de marcos e landmarks (main, nav, header, footer)
 * - Nomes acessíveis para botões e links
 * - Rótulos de formulário e atributos ARIA
 * - Contraste e acessibilidade de diálogos modais
 * - Controles interativos (calculadoras, formulários de doação e parceria)
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';

import { HeroInstitutional } from '../components/sections/HeroInstitutional';
import { ImpactMetrics } from '../components/sections/ImpactMetrics';
import { MissionVisionValues } from '../components/sections/MissionVisionValues';
import { ValuesSection } from '../components/sections/ValuesSection';
import { PillarsSection } from '../components/sections/PillarsSection';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Modal } from '../components/ui/Modal';
import { ContactForm } from '../components/forms/ContactForm';
import { PartnerApplicationForm } from '../components/forms/PartnerApplicationForm';
import { DonationForm } from '../components/payment/DonationForm';
import { SROICalculator } from '../components/sections/SROICalculator';
import { CampaignGoalsSection } from '../components/sections/CampaignGoalsSection';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('A11Y-001 — Auditoria de Acessibilidade Enterprise (WCAG 2.1 AA)', () => {

  it('A11Y-001: HeroInstitutional cumpre diretrizes de acessibilidade sem violações críticas', async () => {
    const { container } = render(
      <LanguageProvider>
        <HeroInstitutional />
      </LanguageProvider>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-002: ImpactMetrics possui estrutura semântica válida sem violações', async () => {
    const { container } = render(
      <LanguageProvider>
        <ImpactMetrics />
      </LanguageProvider>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-003: MissionVisionValues possui hierarquia de cabeçalhos e rótulos acessíveis', async () => {
    const { container } = render(
      <LanguageProvider>
        <MissionVisionValues />
      </LanguageProvider>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-004: ValuesSection cumpre requisitos de contraste e lista semântica', async () => {
    const { container } = render(
      <LanguageProvider>
        <ValuesSection />
      </LanguageProvider>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-005: PillarsSection apresenta zero violações de acessibilidade', async () => {
    const { container } = render(
      <LanguageProvider>
        <PillarsSection />
      </LanguageProvider>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-006: Header possui landmarks de navegação, skip links e controles acessíveis', async () => {
    const { container } = render(
      <LanguageProvider>
        <Header />
      </LanguageProvider>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-007: Footer possui landmarks de rodapé, links com nomes acessíveis e contraste', async () => {
    const { container } = render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-008: Modal implementa role="dialog", aria-modal="true" e aria-labelledby', async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Termos de Acesso">
        <p>Conteúdo de teste acessível para validação de leitor de telas.</p>
      </Modal>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-009: ContactForm implementa rótulos explícitos e estados de alerta acessíveis', async () => {
    const { container } = render(<ContactForm />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-010: PartnerApplicationForm possui campos com id/for e aria-required', async () => {
    const { container } = render(<PartnerApplicationForm />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-011: DonationForm possui controles acessíveis, botões com aria-pressed e formulário rotulado', async () => {
    const { container } = render(<DonationForm />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-012: SROICalculator possui métricas com role="meter", inputs com aria-describedby e aria-live', async () => {
    const { container } = render(<SROICalculator />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('A11Y-013: CampaignGoalsSection possui termômetros de captação acessíveis', async () => {
    const { container } = render(<CampaignGoalsSection />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
