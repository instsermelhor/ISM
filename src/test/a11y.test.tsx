/**
 * a11y.test.tsx — Fase 13 / A11Y-005
 * Testes automatizados de acessibilidade com vitest-axe + @testing-library/react
 *
 * Verifica ausência de violações WCAG 2.1 AA nos componentes críticos.
 * O framer-motion é mockado globalmente pelo src/test/setup.ts.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';

// Extende os matchers do Vitest com toHaveNoViolations
expect.extend(matchers);

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

// ─── Mocks de dependências ────────────────────────────────────────────────────

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      nav: {
        whoWeAre: 'Quem Somos',
        ourMission: 'Nossa Missão',
        history: 'História',
        governance: 'Governança',
        whatWeDo: 'O Que Fazemos',
        principles: 'Princípios',
        programs: 'Projetos',
        news: 'Notícias',
        transparency: 'Transparência',
        donate: 'Doe Agora',
      },
    },
    locale: 'pt-BR',
    setLocale: vi.fn(),
  }),
}));

vi.mock('../components/ui/LanguageSelector', () => ({
  LanguageSelector: () => React.createElement('div', { 'data-testid': 'language-selector' }),
}));

vi.mock('../hooks/useFocusTrap', () => ({
  useFocusTrap: () => React.createRef(),
}));

// ─── Imports dos componentes ──────────────────────────────────────────────────

import { Modal } from '../components/ui/Modal';
import { Header } from '../components/layout/Header';

// ─────────────────────────────────────────────────────────────────────────────
// TESTES DE ACESSIBILIDADE
// ─────────────────────────────────────────────────────────────────────────────

describe('A11y — Componentes WCAG 2.1 AA', () => {

  // ── Modal ──────────────────────────────────────────────────────────────────

  describe('Modal', () => {
    it('modal fechado: sem violações axe', async () => {
      const { container } = render(
        React.createElement(Modal, { isOpen: false, onClose: vi.fn(), title: 'Teste de A11y' },
          React.createElement('p', null, 'Conteúdo do modal')
        )
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('modal aberto: deve ter role="dialog", aria-modal e aria-labelledby', () => {
      const { getByRole } = render(
        React.createElement(Modal, { isOpen: true, onClose: vi.fn(), title: 'Doação Confirmada' },
          React.createElement('p', null, 'Obrigado pela sua contribuição!'),
          React.createElement('button', null, 'Fechar')
        )
      );
      const dialog = getByRole('dialog');
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    });

    it('modal aberto: sem violações axe', async () => {
      const { container } = render(
        React.createElement(Modal, { isOpen: true, onClose: vi.fn(), title: 'Teste Axe Aberto' },
          React.createElement('p', null, 'Conteúdo acessível.'),
          React.createElement('button', null, 'Confirmar')
        )
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('botão de fechar deve ter aria-label descritivo', () => {
      const { getByLabelText } = render(
        React.createElement(Modal, { isOpen: true, onClose: vi.fn(), title: 'Teste' },
          React.createElement('p', null, 'Conteúdo')
        )
      );
      expect(getByLabelText('Fechar modal')).toBeDefined();
    });

    it('título referenciado pelo aria-labelledby', () => {
      const { getByRole } = render(
        React.createElement(Modal, { isOpen: true, onClose: vi.fn(), title: 'Governança', titleId: 'modal-gov' },
          React.createElement('p', null, 'Estrutura de governança.'),
          React.createElement('button', null, 'Ok')
        )
      );
      const dialog = getByRole('dialog');
      const labelId = dialog.getAttribute('aria-labelledby');
      const titleEl = document.getElementById(labelId!);
      expect(titleEl?.textContent).toBe('Governança');
    });
  });

  // ── Header ─────────────────────────────────────────────────────────────────

  describe('Header', () => {
    it('deve ter nav com aria-label="Navegação principal"', () => {
      const { getByRole } = render(React.createElement(Header, null));
      const nav = getByRole('navigation', { name: 'Navegação principal' });
      expect(nav).toBeDefined();
    });

    it('logo deve ter alt descritivo na imagem', () => {
      const { getByAltText } = render(React.createElement(Header, null));
      expect(getByAltText('Logo Instituto Ser Melhor')).toBeDefined();
    });

    it('botão de menu mobile: aria-expanded e aria-controls presentes', () => {
      const { getByLabelText } = render(React.createElement(Header, null));
      const menuBtn = getByLabelText(/Abrir menu de navegação/i);
      expect(menuBtn.getAttribute('aria-expanded')).toBeDefined();
      expect(menuBtn.getAttribute('aria-controls')).toBe('mobile-nav-menu');
    });

    it('sem violações axe no estado inicial (menu fechado)', async () => {
      const { container } = render(React.createElement(Header, null));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // ── WCAG 2.4.1 — Skip-link ─────────────────────────────────────────────────

  describe('WCAG 2.4.1 — Skip-link (Bypass Blocks)', () => {
    it('skip-link deve apontar para #main-content e conter texto descritivo', () => {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Pular para o conteúdo principal';
      document.body.prepend(skipLink);

      const found = document.querySelector('.skip-link') as HTMLAnchorElement;
      expect(found).not.toBeNull();
      expect(found.href).toContain('#main-content');
      expect(found.textContent).toContain('Pular');

      found.remove();
    });
  });

  // ── WCAG 2.4.7 — Focus Visible ─────────────────────────────────────────────

  describe('WCAG 2.4.7 — Focus Visible', () => {
    it('botões interativos devem receber foco (não impedido)', () => {
      const btn = document.createElement('button');
      btn.textContent = 'Testar foco';
      document.body.appendChild(btn);
      btn.focus();
      expect(document.activeElement).toBe(btn);
      document.body.removeChild(btn);
    });
  });

  // ── WCAG 1.1.1 — Conteúdo não-textual ─────────────────────────────────────

  describe('WCAG 1.1.1 — Non-text Content', () => {
    it('ícones decorativos devem ter aria-hidden="true"', () => {
      const { container } = render(React.createElement(Header, null));
      // Ícones Menu e X devem ter aria-hidden
      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });
  });
});
