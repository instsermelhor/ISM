import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProgramsSection } from './ProgramsSection';
import { InstitutionalService } from '../../services/data';

describe('ProgramsSection — Educação Transformadora de Qualidade', () => {
  let programsData: any[];

  beforeEach(async () => {
    programsData = await InstitutionalService.getPrograms();
  });

  it('renders the official title "Educação Transformadora de Qualidade"', () => {
    render(<ProgramsSection programs={programsData} />);
    expect(screen.getByText('Educação Transformadora de Qualidade')).toBeInTheDocument();
  });

  it('does not display description text initially in compact collapsed state', () => {
    render(<ProgramsSection programs={programsData} />);
    expect(
      screen.queryByText(/O Instituto Ser Melhor acredita que a educação é o instrumento mais poderoso/i)
    ).not.toBeInTheDocument();
  });

  it('has aria-expanded="false" and aria-controls on the "Saiba Mais" button initially', () => {
    render(<ProgramsSection programs={programsData} />);
    const saibaMaisButtons = screen.getAllByRole('button', { name: /Saiba Mais/i });
    expect(saibaMaisButtons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(saibaMaisButtons[0]).toHaveAttribute('aria-controls', 'program-content-1');
  });

  it('expands full text, pillars, and commitment when clicking "Saiba Mais"', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={programsData} />);

    const buttons = screen.getAllByRole('button', { name: /Saiba Mais/i });
    await user.click(buttons[0]);

    // Button text changes to "Mostrar Menos"
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');

    // Long description text is revealed
    expect(
      screen.getByText(/Nossa atuação considera cada pessoa em sua integralidade/i)
    ).toBeInTheDocument();

    // Pilares section is revealed
    expect(screen.getByText('Educação centrada na pessoa e no desenvolvimento integral.')).toBeInTheDocument();
    expect(screen.getByText('Avaliação contínua do impacto social das ações.')).toBeInTheDocument();

    // Compromisso section is revealed
    expect(screen.getByText(/Promover uma educação que transforma vidas/i)).toBeInTheDocument();
  });
});

describe('ProgramsSection — Proteção, Preservação e Restauração dos Biomas', () => {
  let programsData: any[];

  beforeEach(async () => {
    programsData = await InstitutionalService.getPrograms();
  });

  it('renders the corrected title "Proteção, Preservação e Restauração dos Biomas"', () => {
    render(<ProgramsSection programs={programsData} />);
    expect(screen.getByText('Proteção, Preservação e Restauração dos Biomas')).toBeInTheDocument();
  });

  it('button "Ver Relatório" was replaced with "Saiba Mais"', () => {
    render(<ProgramsSection programs={programsData} />);
    expect(screen.queryByText('Ver Relatório')).not.toBeInTheDocument();
    const biomesBtn = screen.getByRole('button', { name: /Saiba mais sobre Proteção, Preservação e Restauração dos Biomas/i });
    expect(biomesBtn).toBeInTheDocument();
  });

  it('expands full text, pilares, linhas de atuação, and compromisso on "Saiba Mais" click', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={programsData} />);

    // Find "Saiba Mais" button for Proteção de Biomas (program id 2)
    const biomesButton = screen.getByRole('button', { name: /Saiba mais sobre Proteção, Preservação e Restauração dos Biomas/i });
    expect(biomesButton).toHaveAttribute('aria-controls', 'program-content-2');

    await user.click(biomesButton);

    expect(biomesButton).toHaveAttribute('aria-expanded', 'true');

    // Long description
    expect(
      screen.getByText(/Por meio do programa Proteção, Preservação e Restauração dos Biomas/i)
    ).toBeInTheDocument();

    // Nossos Pilares
    expect(
      screen.getByText('Conservação da biodiversidade e dos ecossistemas brasileiros.')
    ).toBeInTheDocument();

    // Linhas de atuação
    expect(
      screen.getByText('Recuperação de áreas degradadas e reflorestamento com espécies nativas.')
    ).toBeInTheDocument();

    // Nosso compromisso
    expect(
      screen.getByText(/Nosso compromisso é contribuir para a preservação dos biomas brasileiros/i)
    ).toBeInTheDocument();
  });

  it('collapses back smoothly when clicking "Mostrar Menos"', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={programsData} />);

    const biomesButton = screen.getByRole('button', { name: /Saiba mais sobre Proteção, Preservação e Restauração dos Biomas/i });
    await user.click(biomesButton);
    expect(biomesButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(biomesButton);
    expect(biomesButton).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('ProgramsSection — Saúde & Bem-Estar Comunitário', () => {
  let programsData: any[];

  beforeEach(async () => {
    programsData = await InstitutionalService.getPrograms();
  });

  it('renders title "Saúde & Bem-Estar Comunitário"', () => {
    render(<ProgramsSection programs={programsData} />);
    expect(screen.getByText('Saúde & Bem-Estar Comunitário')).toBeInTheDocument();
  });

  it('button "Conhecer Programa" was replaced with "Saiba Mais"', () => {
    render(<ProgramsSection programs={programsData} />);
    expect(screen.queryByText('Conhecer Programa')).not.toBeInTheDocument();
    const healthBtn = screen.getByRole('button', { name: /Saiba mais sobre Saúde & Bem-Estar Comunitário/i });
    expect(healthBtn).toBeInTheDocument();
  });

  it('expands full text, pilares, linhas de atuação, and compromisso on "Saiba Mais" click', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={programsData} />);

    // Find "Saiba Mais" button for Saúde & Bem-Estar Comunitário (program id 3)
    const healthButton = screen.getByRole('button', { name: /Saiba mais sobre Saúde & Bem-Estar Comunitário/i });
    expect(healthButton).toHaveAttribute('aria-controls', 'program-content-3');

    await user.click(healthButton);
    expect(healthButton).toHaveAttribute('aria-expanded', 'true');

    // Long description
    expect(
      screen.getByText(/Nossa atuação compreende que saúde vai muito além da ausência de doenças/i)
    ).toBeInTheDocument();

    // Nossos Pilares
    expect(
      screen.getByText('Promoção da saúde integral e da qualidade de vida.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Atuação integrada com o Sistema Único de Saúde (SUS) e demais redes de proteção social.')
    ).toBeInTheDocument();

    // Linhas de Atuação
    expect(
      screen.getByText('Promoção da saúde física, mental e emocional.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Desenvolvimento de projetos de promoção da saúde em escolas, empresas e comunidades.')
    ).toBeInTheDocument();

    // Nosso compromisso
    expect(
      screen.getByText(/Nosso compromisso é construir comunidades mais saudáveis, solidárias e resilientes/i)
    ).toBeInTheDocument();
  });

  it('collapses back when clicking "Mostrar Menos"', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={programsData} />);

    const healthButton = screen.getByRole('button', { name: /Saiba mais sobre Saúde & Bem-Estar Comunitário/i });
    await user.click(healthButton);
    expect(healthButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(healthButton);
    expect(healthButton).toHaveAttribute('aria-expanded', 'false');
  });
});
