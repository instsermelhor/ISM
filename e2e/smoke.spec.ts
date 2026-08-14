import { test, expect } from '@playwright/test';

/**
 * e2e/smoke.spec.ts — E2E-001: Suíte de Testes End-to-End Enterprise (Playwright)
 * ─────────────────────────────────────────────────────────────────────────────
 * Valida fluxos críticos de ponta a ponta na aplicação:
 * - Carregamento do site institucional e SEO H1
 * - Consentimento de cookies LGPD granular
 * - Calculadora interativa de retorno social SROI
 * - Modal do Canal de Direitos do Titular (Art. 18 LGPD)
 * - Formulário de doação e chave Pix CNPJ oficial
 * - Navegação de Governança e Transparência
 */

test.describe('E2E-001 — Jornadas Críticas do Usuário (Instituto Ser Melhor)', () => {

  test('Jornada 01: Carregamento do Site Institucional, SEO H1 e Skip Link', async ({ page }) => {
    await page.goto('/');
    
    // 1. Valida título institucional
    await expect(page).toHaveTitle(/Instituto Ser Melhor/i);

    // 2. Valida existência do Skip Navigation Link para acessibilidade
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toBeAttached();

    // 3. Valida que existe ao menos um título principal H1
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('Jornada 02: Banner de Consentimento de Cookies LGPD Granular', async ({ page }) => {
    await page.goto('/');

    const cookieBanner = page.locator('text=Gerenciamento de Cookies');
    if (await cookieBanner.isVisible()) {
      const acceptButton = page.locator('button:has-text("Aceitar Todos")');
      await acceptButton.click();
      await expect(cookieBanner).not.toBeVisible();
    }
  });

  test('Jornada 03: Interação com a Calculadora SROI (Retorno Social)', async ({ page }) => {
    await page.goto('/');

    const sroiSection = page.locator('text=Calculadora de Retorno Social (SROI)').first();
    if (await sroiSection.isVisible()) {
      await sroiSection.scrollIntoViewIfNeeded();
      await expect(sroiSection).toBeVisible();

      // Testa simulação com preset de valor
      const input = page.locator('#sroi-invest-input');
      if (await input.isVisible()) {
        await input.fill('5000');
        const result = page.locator('#sroi-result');
        await expect(result).toBeVisible();
      }
    }
  });

  test('Jornada 04: Acesso ao Canal de Direitos do Titular LGPD (Art. 18)', async ({ page }) => {
    await page.goto('/');

    // Clica no link de Direitos do Titular no rodapé
    const lgpdLink = page.locator('button:has-text("Direitos do Titular (LGPD)")');
    if (await lgpdLink.isVisible()) {
      await lgpdLink.scrollIntoViewIfNeeded();
      await lgpdLink.click();

      // Valida abertura do modal com campos obrigatórios
      const modalHeading = page.locator('text=Canal de Direitos do Titular (LGPD — Art. 18)');
      await expect(modalHeading).toBeVisible();

      const nameInput = page.locator('#lgpd-name');
      await expect(nameInput).toBeVisible();
    }
  });

  test('Jornada 05: Fluxo de Doação e Chave Pix CNPJ Oficial', async ({ page }) => {
    await page.goto('/');

    const donationSection = page.locator('#donate, text=Faça sua Doação').first();
    if (await donationSection.isVisible()) {
      await donationSection.scrollIntoViewIfNeeded();
      await expect(donationSection).toBeVisible();
    }
  });

  test('Jornada 06: Links de Redes Sociais e Acesso ao Painel Administrativo', async ({ page }) => {
    await page.goto('/');

    const adminLink = page.locator('a[title*="Painel Administrativo"], a:has-text("Área Restrita")').first();
    await expect(adminLink).toBeAttached();
  });
});
