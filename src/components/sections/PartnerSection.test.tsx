import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PartnerSection } from './PartnerSection';

describe('PartnerSection — Integração Dinâmica e Acessibilidade (WCAG 2.2 AA — E043)', () => {
  const mockServicesPage = {
    partnerBadge: 'Aliança Estratégica',
    partnerTitle: 'Parceria de Alto Impacto',
    partnerSubtitle: 'Unindo forças com empresas e institutos no Brasil e no mundo.',
    partnerBenefits: [
      { id: 'b1', order: 1, title: 'ESG Mensurável', description: 'Métricas auditadas de impacto social.', icon: '📊' },
      { id: 'b2', order: 2, title: 'Inovação Aberta', description: 'Cooperação com centros de pesquisa.', icon: '💡' },
    ],
    trustBadges: ['ODS 17', 'Certificado ESG', 'ISO 26000'],
  };

  const mockPartners = [
    {
      id: 'p1',
      order: 1,
      name: 'Nações Unidas (ONU)',
      category: 'ORGANISMOS_INTERNACIONAIS',
      country: 'Suíça',
      logoUrl: 'https://example.com/logo-onu.png',
      logoAlt: 'Emblema Oficial das Nações Unidas',
      websiteUrl: 'https://un.org',
      isPublished: true,
      status: 'PUBLISHED' as const,
      tier: 'TIER_1' as const,
      isFeatured: true,
    },
    {
      id: 'p2',
      order: 2,
      name: 'Parceiro em Rascunho',
      category: 'EMPRESAS',
      isPublished: false,
      status: 'DRAFT' as const,
      tier: 'TIER_2' as const,
    },
    {
      id: 'p3',
      order: 3,
      name: 'Parceiro Arquivado',
      category: 'FINANCIADORES',
      isPublished: false,
      status: 'ARCHIVED' as const,
      tier: 'TIER_3' as const,
    },
    {
      id: 'p4',
      order: 4,
      name: 'Parceiro com Link Inseguro',
      category: 'EMPRESAS',
      websiteUrl: 'http://insecure-site.com',
      isPublished: true,
      status: 'PUBLISHED' as const,
      tier: 'TIER_3' as const,
    },
  ];

  it('renderiza o título e subtítulo dinâmicos configurados no Admin CMS', () => {
    render(<PartnerSection servicesPage={mockServicesPage} partners={mockPartners} />);
    expect(screen.getByText('Aliança Estratégica')).toBeInTheDocument();
    expect(screen.getByText('Parceria de Alto Impacto')).toBeInTheDocument();
    expect(screen.getByText(/Unindo forças com empresas e institutos/i)).toBeInTheDocument();
  });

  it('exibe apenas os parceiros PUBLICADOS e esconde RASCUNHO/ARQUIVADO', () => {
    render(<PartnerSection servicesPage={mockServicesPage} partners={mockPartners} />);

    // Deve exibir ONU (Publicado)
    expect(screen.getByText('Nações Unidas (ONU)')).toBeInTheDocument();

    // NÃO deve exibir parceiros em Rascunho ou Arquivado
    expect(screen.queryByText('Parceiro em Rascunho')).not.toBeInTheDocument();
    expect(screen.queryByText('Parceiro Arquivado')).not.toBeInTheDocument();
  });

  it('renderiza os cards de benefícios dinâmicos com ícones e descrições', () => {
    render(<PartnerSection servicesPage={mockServicesPage} partners={mockPartners} />);
    expect(screen.getByText('ESG Mensurável')).toBeInTheDocument();
    expect(screen.getByText('Métricas auditadas de impacto social.')).toBeInTheDocument();
    expect(screen.getByText('Inovação Aberta')).toBeInTheDocument();
  });

  it('exibe os selos de confiança (Trust Badges)', () => {
    render(<PartnerSection servicesPage={mockServicesPage} partners={mockPartners} />);
    expect(screen.getByText('ODS 17')).toBeInTheDocument();
    expect(screen.getByText('Certificado ESG')).toBeInTheDocument();
    expect(screen.getByText('ISO 26000')).toBeInTheDocument();
  });

  it('possui atributos WCAG 2.2 AA adequados nos links dos parceiros e respeita logoAlt', () => {
    render(<PartnerSection servicesPage={mockServicesPage} partners={mockPartners} />);
    const link = screen.getByRole('link', { name: /Parceiro: Nações Unidas \(ONU\)/i });
    expect(link).toHaveAttribute('href', 'https://un.org');
    expect(link).toHaveAttribute('target', '_blank');

    // Verifica se a logo possui o logoAlt customizado e lazy loading
    const logoImg = screen.getByAltText('Emblema Oficial das Nações Unidas');
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('loading', 'lazy');
  });

  it('exibe o badge de parceiro em destaque (isFeatured)', () => {
    render(<PartnerSection servicesPage={mockServicesPage} partners={mockPartners} />);
    expect(screen.getByText('Destaque')).toBeInTheDocument();
  });

  it('impede navegação se a URL não for segura (não começa com https://)', () => {
    render(<PartnerSection servicesPage={mockServicesPage} partners={mockPartners} />);
    const insecureLink = screen.getByRole('link', { name: /Parceiro: Parceiro com Link Inseguro/i });
    expect(insecureLink).toHaveAttribute('href', '#');
  });
});
