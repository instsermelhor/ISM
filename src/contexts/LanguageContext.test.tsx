/**
 * LanguageContext.test.tsx — C005: Internacionalização (i18n PT / EN / ES)
 * ────────────────────────────────────────────────────────────────────────
 * Testes de integração unitária do LanguageContext e LanguageSelector.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { LanguageSelector } from '../components/ui/LanguageSelector';

const TestComponent: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="translated-title">{t.hero.ctaDonate}</span>
      <LanguageSelector />
      <button data-testid="btn-en" onClick={() => setLanguage('EN')}>Set EN</button>
      <button data-testid="btn-es" onClick={() => setLanguage('ES')}>Set ES</button>
      <button data-testid="btn-pt" onClick={() => setLanguage('PT')}>Set PT</button>
    </div>
  );
};

describe('LanguageContext i18n System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default Portuguese (PT) language and translations', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang')).toHaveTextContent('PT');
    expect(screen.getByTestId('translated-title')).toHaveTextContent('Fazer uma Doação');
  });

  it('switches to English (EN) and updates dictionary translations', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const btnEn = screen.getByTestId('btn-en');
    await user.click(btnEn);

    expect(screen.getByTestId('current-lang')).toHaveTextContent('EN');
    expect(screen.getByTestId('translated-title')).toHaveTextContent('Make a Donation');
  });

  it('switches to Spanish (ES) and updates dictionary translations', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const btnEs = screen.getByTestId('btn-es');
    await user.click(btnEs);

    expect(screen.getByTestId('current-lang')).toHaveTextContent('ES');
    expect(screen.getByTestId('translated-title')).toHaveTextContent('Hacer una Donación');
  });

  it('persists selected language in localStorage', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const btnEn = screen.getByTestId('btn-en');
    await user.click(btnEn);

    expect(localStorage.getItem('ism_lang')).toBe('EN');
  });
});
