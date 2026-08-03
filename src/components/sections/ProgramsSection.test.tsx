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

  it('displays the first paragraph description initially in collapsed state', () => {
    render(<ProgramsSection programs={programsData} />);
    expect(
      screen.getByText(/O Instituto Ser Melhor acredita que a educação é o instrumento mais poderoso/i)
    ).toBeInTheDocument();
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
    const biomesBtn = screen.getByRole('button', { name: /Saiba Mais/i, current: undefined });
    expect(biomesBtn).toBeInTheDocument();
  });

  it('expands full text, pilares, linhas de atuação, and compromisso on "Saiba Mais" click', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={programsData} />);

    // Find "Saiba Mais" button for Proteção de Biomas (program id 2)
    const biomesButton = screen.getAllByRole('button', { name: /Saiba Mais/i })[1];
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
    expect(
      screen.getByText('Promoção da cultura da sustentabilidade e da responsabilidade climática.')
    ).toBeInTheDocument();

    // Linhas de atuação
    expect(screen.getByText('Linhas de atuação')).toBeInTheDocument();
    expect(
      screen.getByText('O Instituto Ser Melhor desenvolve e apoia projetos voltados para:')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Recuperação de áreas degradadas e reflorestamento com espécies nativas.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Desenvolvimento de programas de voluntariado socioambiental.')
    ).toBeInTheDocument();

    // Nosso compromisso
    expect(
      screen.getByText(/Nosso compromisso é contribuir para a preservação dos biomas brasileiros/i)
    ).toBeInTheDocument();
  });

  it('collapses back smoothly when clicking "Mostrar Menos"', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={programsData} />);

    const biomesButton = screen.getAllByRole('button', { name: /Saiba Mais/i })[1];
    await user.click(biomesButton);
    expect(biomesButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(biomesButton);
    expect(biomesButton).toHaveAttribute('aria-expanded', 'false');
  });
});
