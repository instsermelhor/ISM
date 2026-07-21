import { describe, it, expect } from 'vitest';
import { InstitutionalService } from './data';

describe('InstitutionalService Unit & Integration Tests', () => {
  it('deve carregar os dados institucionais padrão sem exceção', async () => {
    const pageResponse = await InstitutionalService.getPage();
    expect(pageResponse).toBeDefined();
    expect(pageResponse.data).toBeDefined();
    expect(pageResponse.data.attributes.title).toBe('Instituto Ser Melhor');
    expect(pageResponse.data.attributes.missionStatement).toContain('Promover a completa emancipação humana');
  });

  it('deve listar os blocos de valores/pilares da instituição', async () => {
    const valueBlocks = await InstitutionalService.getValueBlocks();
    expect(valueBlocks).toBeDefined();
    expect(valueBlocks.data.length).toBeGreaterThan(0);
    expect(valueBlocks.data[0].attributes.name).toBe('Excelência Inflexível');
  });

  it('deve carregar a lista de programas públicos publicados', async () => {
    const programs = await InstitutionalService.getPrograms();
    expect(programs).toBeDefined();
    expect(Array.isArray(programs)).toBe(true);
    expect(programs.length).toBeGreaterThan(0);
    expect(programs[0].isPublished).toBe(true);
  });

  it('deve simular a submissão de uma candidatura de parceria com sucesso', async () => {
    const response = await InstitutionalService.submitPartnerApplication({
      companyName: 'Empresa Teste LTDA',
      contactName: 'João da Silva',
      email: 'joao@empresa.com',
      type: 'Empresarial',
      areaOfInterest: 'Educação',
      status: 'Novo',
      submissionDate: new Date().toISOString()
    });

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.id).toBeDefined();
  });
});
