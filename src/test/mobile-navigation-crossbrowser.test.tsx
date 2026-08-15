import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../components/layout/Header';
import { Modal } from '../components/ui/Modal';
import { HeroInstitutional } from '../components/sections/HeroInstitutional';
import { LanguageProvider } from '../contexts/LanguageContext';
import * as fs from 'fs';
import * as path from 'path';

describe('ISM-NAV-MOBILE-CROSSBROWSER-001 — Auditoria de Navegação & Responsividade', () => {
  const renderWithLang = (ui: React.ReactElement) => {
    return render(<LanguageProvider>{ui}</LanguageProvider>);
  };

  describe('NAV-001: Header & Mobile Menu Interaction', () => {
    it('abre e fecha o menu mobile com transição e atributos de acessibilidade', async () => {
      const user = userEvent.setup();
      renderWithLang(<Header />);

      const menuBtn = screen.getByRole('button', { name: /abrir menu de navegação/i });
      expect(menuBtn).toBeDefined();
      expect(menuBtn.getAttribute('aria-expanded')).toBe('false');

      // Clica para abrir
      await user.click(menuBtn);
      expect(menuBtn.getAttribute('aria-expanded')).toBe('true');
      expect(menuBtn.getAttribute('aria-label')).toBe('Fechar menu de navegação');

      // Verifica overlay do menu com role="dialog" e aria-modal="true"
      const mobileDialog = screen.getByRole('dialog', { name: /menu de navegação/i });
      expect(mobileDialog).toBeDefined();
      expect(mobileDialog.getAttribute('aria-modal')).toBe('true');

      // Clica para fechar
      await user.click(menuBtn);
      expect(menuBtn.getAttribute('aria-expanded')).toBe('false');
    });

    it('itens com subitens no menu mobile são renderizados como botões expansíveis sem quebra de rota', async () => {
      const user = userEvent.setup();
      renderWithLang(<Header />);

      // Abre o menu mobile
      const menuBtn = screen.getByRole('button', { name: /abrir menu de navegação/i });
      await user.click(menuBtn);

      // O item "Quem Somos" deve ter um button semântico dentro do nav mobile
      const whoWeAreBtn = screen.getByRole('button', { name: /quem somos/i });
      expect(whoWeAreBtn).toBeDefined();
      expect(whoWeAreBtn.getAttribute('aria-expanded')).toBe('false');

      // Clica para expandir subitens
      await user.click(whoWeAreBtn);
      expect(whoWeAreBtn.getAttribute('aria-expanded')).toBe('true');

      // Verifica que subitens aparecem
      const missionLink = screen.getAllByRole('link', { name: /nossa missão/i });
      expect(missionLink.length).toBeGreaterThan(0);
    });

    it('item Notícias aponta corretamente para a âncora #blog e não para # isolado', () => {
      renderWithLang(<Header />);
      const blogLinks = screen.getAllByRole('link', { name: /notícias/i });
      expect(blogLinks.length).toBeGreaterThan(0);
      blogLinks.forEach(link => {
        expect(link.getAttribute('href')).toBe('#blog');
      });
    });

    it('fecha o menu mobile ao pressionar a tecla Escape', async () => {
      const user = userEvent.setup();
      renderWithLang(<Header />);

      const menuBtn = screen.getByRole('button', { name: /abrir menu de navegação/i });
      await user.click(menuBtn);
      expect(menuBtn.getAttribute('aria-expanded')).toBe('true');

      // Pressiona Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(menuBtn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('NAV-002: Modal & iOS-Safe Scroll Locking', () => {
    it('aplica position: fixed no body ao abrir e restaura ao fechar (iOS-safe)', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={() => {}} title="Teste Modal">
          <p>Conteúdo do modal</p>
        </Modal>
      );

      expect(document.body.style.position).toBe('');

      // Abre o modal
      rerender(
        <Modal isOpen={true} onClose={() => {}} title="Teste Modal">
          <p>Conteúdo do modal</p>
        </Modal>
      );

      expect(document.body.style.position).toBe('fixed');
      expect(document.body.style.width).toBe('100%');

      // Fecha o modal
      rerender(
        <Modal isOpen={false} onClose={() => {}} title="Teste Modal">
          <p>Conteúdo do modal</p>
        </Modal>
      );

      expect(document.body.style.position).toBe('');
    });

    it('fecha o modal ao pressionar Escape e possui foco/diálogo acessível', async () => {
      const onCloseMock = vi.fn();
      render(
        <Modal isOpen={true} onClose={onCloseMock} title="Termos de Uso">
          <p>Texto de termos</p>
        </Modal>
      );

      expect(screen.getByRole('dialog', { name: /termos de uso/i })).toBeDefined();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('NAV-003: Hero & Viewport Dinâmico (dvh/svh)', () => {
    it('renderiza o Hero com classes de viewport dinâmico min-h-[100svh] e min-h-dvh', () => {
      const { container } = render(
        <HeroInstitutional
          data={{
            title: 'Instituto Ser Melhor — Sapere Aude',
            introduction: 'Introdução teste',
            missionStatement: 'Missão',
            visionStatement: 'Visão',
            governanceIntro: 'Gov',
            transparencyIntro: 'Transp',
            logoImage: '/logo-ism.png',
            motto: 'Sapere Aude',
            mottoExplanation: 'Ouse Saber',
            networkIntro: 'Rede',
            logoExplanation: 'Logo',
          }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeDefined();
      expect(section?.className).toContain('min-h-[100svh]');
      expect(section?.className).toContain('min-h-dvh');
    });
  });

  describe('NAV-004: PWA Manifest & CSS Cross-Browser Specs', () => {
    it('manifest.json possui orientação configurada como "any" para permitir landscape/portrait', () => {
      const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifestContent.orientation).toBe('any');
    });

    it('index.css contém utilitários de safe-area e suporte a dvh/svh', () => {
      const cssPath = path.resolve(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      expect(cssContent).toContain('.safe-top');
      expect(cssContent).toContain('.safe-bottom');
      expect(cssContent).toContain('.min-h-dvh');
      expect(cssContent).toContain('.min-h-svh');
      expect(cssContent).toContain('prefers-reduced-motion');
    });
  });
});
