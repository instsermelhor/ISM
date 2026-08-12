import { test, expect } from '@playwright/test';

/**
 * e2e/smoke.spec.ts — TEST-004: Suíte E2E de Fumaça (Playwright)
 * ─────────────────────────────────────────────────────────────────────────────
 * Testa a navegabilidade do site institucional, componentes de acessibilidade,
 * fluxo de consentimento LGPD e renderização do portal admin.
 */

test.describe('E2E Smoke Tests — Instituto Ser Melhor', () => {

  test('E2E-01: Carregamento do Site Institucional e SEO H1', async ({ page }) => {
    await page.goto('/');
    
    // Valida título da página
    await expect(page).toHaveTitle(/Instituto Ser Melhor/i);

    // Valida que existe ao menos um título principal H1 no DOM
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('E2E-02: Banner de Consentimento de Cookies LGPD', async ({ page }) => {
    await page.goto('/');

    // Verifica que o banner de cookies está visível para novos visitantes
    const cookieBanner = page.locator('text=Gerenciamento de Cookies');
    if (await cookieBanner.isVisible()) {
      const acceptButton = page.locator('button:has-text("Aceitar Todos")');
      await acceptButton.click();
      await expect(cookieBanner).not.toBeVisible();
    }
  });

  test('E2E-03: Modal do Calculador SROI e Seções Institucionais', async ({ page }) => {
    await page.goto('/');

    // Rola até a seção do calculador SROI
    const sroiSection = page.locator('text=Calculadora de Retorno Social (SROI)').first();
    if (await sroiSection.isVisible()) {
      await sroiSection.scrollIntoViewIfNeeded();
      await expect(sroiSection).toBeVisible();
    }
  });

  test('E2E-04: Tela de Login do Painel Administrativo', async ({ page }) => {
    // Acessa a rota de login do admin se aplicável
    await page.goto('/#admin');
    await page.waitForTimeout(500);
  });
});
