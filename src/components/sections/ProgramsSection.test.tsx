import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ProgramsSection } from './ProgramsSection';
import { ProgramData } from '../../types';

const MOCK_PROGRAMS: ProgramData[] = [
  {
    id: 'prog-1',
    order: 1,
    title: 'Educação Transformadora de Qualidade',
    slug: 'educacao-transformadora',
    description: 'O Instituto Ser Melhor acredita que a educação é o instrumento mais poderoso...',
    longDescription: 'Nossa atuação considera cada pessoa em sua integralidade, valorizando suas potencialidades...',
    pillarsTitle: 'Nossos pilares',
    pillars: [
      'Educação centrada na pessoa e no desenvolvimento integral.',
      'Avaliação contínua do impacto social das ações.',
    ],
    commitmentTitle: 'Nosso compromisso',
    commitment: 'Promover uma educação que transforma vidas.',
    iconEmoji: '📚',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    imageAlt: 'Crianças estudando em sala de aula',
    isPublished: true,
    targetAudience: 'Crianças e adolescentes em situação de vulnerabilidade',
    tags: ['Educação', 'Jovens'],
    ctaLabel: 'Saiba Mais',
    ctaUrl: '#',
    impactMetric: 'Jovens Capacitados',
    impactValue: '50.000+',
  },
  {
    id: 'prog-2',
    order: 2,
    title: 'Proteção, Preservação e Restauração dos Biomas',
    slug: 'protecao-biomas',
    description: 'Por meio do programa Proteção, Preservação e Restauração dos Biomas...',
    longDescription: 'Desenvolvemos iniciativas que unem educação ambiental e reflorestamento...',
    pillarsTitle: 'Nossos pilares',
    pillars: ['Conservação da biodiversidade e dos ecossistemas brasileiros.'],
    actionLinesTitle: 'Linhas de atuação',
    actionLines: ['Recuperação de áreas degradadas e reflorestamento com espécies nativas.'],
    commitmentTitle: 'Nosso compromisso',
    commitment: 'Nosso compromisso é contribuir para a preservação dos biomas brasileiros.',
    iconEmoji: '🌿',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    imageAlt: 'Floresta preservada',
    isPublished: true,
    targetAudience: 'Comunidades locais',
    auraProjectUrl: 'https://aura.institutosermelhor.org',
    websiteUrl: 'https://biomas.institutosermelhor.org',
  },
];

describe('ProgramsSection — Dinâmico & E044', () => {
  it('renders programs titles dynamically', () => {
    render(<ProgramsSection programs={MOCK_PROGRAMS} />);
    expect(screen.getByText('Educação Transformadora de Qualidade')).toBeInTheDocument();
    expect(screen.getByText('Proteção, Preservação e Restauração dos Biomas')).toBeInTheDocument();
  });

  it('does not display long description text initially in compact collapsed state', () => {
    render(<ProgramsSection programs={MOCK_PROGRAMS} />);
    expect(
      screen.queryByText(/Nossa atuação considera cada pessoa em sua integralidade/i)
    ).not.toBeInTheDocument();
  });

  it('has aria-expanded="false" and aria-controls on the "Saiba Mais" button initially', () => {
    render(<ProgramsSection programs={MOCK_PROGRAMS} />);
    const saibaMaisButtons = screen.getAllByRole('button', { name: /Saiba Mais/i });
    expect(saibaMaisButtons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(saibaMaisButtons[0]).toHaveAttribute('aria-controls', 'program-content-prog-1');
  });

  it('expands full text, pillars, and commitment when clicking "Saiba Mais"', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={MOCK_PROGRAMS} />);

    const buttons = screen.getAllByRole('button', { name: /Saiba Mais/i });
    await user.click(buttons[0]);

    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText(/Nossa atuação considera cada pessoa em sua integralidade/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Educação centrada na pessoa e no desenvolvimento integral.')).toBeInTheDocument();
    expect(screen.getByText(/Promover uma educação que transforma vidas/i)).toBeInTheDocument();
  });

  it('renders "Conhecer o AURA" button when auraProjectUrl is present', () => {
    render(<ProgramsSection programs={MOCK_PROGRAMS} />);
    const auraBtn = screen.getByRole('link', { name: /Conhecer o (Projeto )?AURA/i });
    expect(auraBtn).toBeInTheDocument();
    expect(auraBtn).toHaveAttribute('href', 'https://aura.institutosermelhor.org');
  });

  it('renders loading skeleton when isLoading is true', () => {
    render(<ProgramsSection programs={[]} isLoading={true} />);
    expect(screen.getByLabelText(/Projetos em Campo - carregando/i)).toBeInTheDocument();
  });

  it('renders external links inside expanded state', async () => {
    const user = userEvent.setup();
    render(<ProgramsSection programs={MOCK_PROGRAMS} />);

    const buttons = screen.getAllByRole('button', { name: /Saiba Mais/i });
    await user.click(buttons[1]);

    const siteLink = screen.getByRole('link', { name: /Site Oficial/i });
    expect(siteLink).toBeInTheDocument();
    expect(siteLink).toHaveAttribute('href', 'https://biomas.institutosermelhor.org');
  });
});
