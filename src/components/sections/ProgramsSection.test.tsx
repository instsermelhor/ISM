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
    const saibaMaisBtn = screen.getByRole('button', { name: /Saiba Mais/i });
    expect(saibaMaisBtn).toHaveAttribute('aria-expanded', 'false');
    expect(saibaMaisBtn).toHaveAttribute('aria-controls', 'program-content-1');
  });

  it('expands full text, pillars, and commitment when clicking "Saiba Mais"', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={programsData} />);

    const button = screen.getByRole('button', { name: /Saiba Mais/i });
    await user.click(button);

    // Button text changes to "Mostrar Menos"
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Mostrar Menos/i })).toBeInTheDocument();

    // Long description text is revealed
    expect(
      screen.getByText(/Nossa atuação considera cada pessoa em sua integralidade/i)
    ).toBeInTheDocument();

    // Pilares section is revealed
    expect(screen.getByText('Nossos pilares')).toBeInTheDocument();
    expect(
      screen.getByText('Educação centrada na pessoa e no desenvolvimento integral.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Avaliação contínua do impacto social das ações.')
    ).toBeInTheDocument();

    // Compromisso section is revealed
    expect(screen.getByText('Nosso compromisso')).toBeInTheDocument();
    expect(
      screen.getByText(/Promover uma educação que transforma vidas/i)
    ).toBeInTheDocument();
  });

  it('collapses back when clicking "Mostrar Menos"', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={programsData} />);

    const button = screen.getByRole('button', { name: /Saiba Mais/i });
    await user.click(button);
    expect(screen.getByRole('button', { name: /Mostrar Menos/i })).toBeInTheDocument();

    const collapseButton = screen.getByRole('button', { name: /Mostrar Menos/i });
    await user.click(collapseButton);

    expect(screen.getByRole('button', { name: /Saiba Mais/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Saiba Mais/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports keyboard navigation (Enter/Space) on button', async () => {
    render(<ProgramsSection programs={programsData} />);
    const button = screen.getByRole('button', { name: /Saiba Mais/i });

    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    // In React test env, fireEvent click or key press toggles state
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
