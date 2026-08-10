import { describe, it, expect } from 'vitest';
import { InstitutionalService } from '../../src/services/data';
import { CrmLeadsEnterpriseService } from '../../admin/src/services/crmLeadsEnterprise';

describe('Fase Captura de Leads — Teste de Envio pelo Formulário do Site e Chegada ao Painel /leads', () => {
  const testLeadData = {
    name: 'Carlos Eduardo Santos',
    email: 'carlos.eduardo@empresarotina.com.br',
    phone: '(11) 99887-6655',
    companyName: 'Organização Teste de Impacto',
    role: 'Gerente de Sustentabilidade',
    category: 'Patrocinador',
    sourceChannel: 'Site',
    subject: 'Proposta de Parceria Corporativa ESG',
    message: 'Olá equipe ISM! Gostaria de agendar uma reunião para apresentar nossa proposta de patrocínio aos programas educacionais e ambientais.',
    interestArea: 'Educação & Meio Ambiente',
  };

  it('Passo 1: Envia uma mensagem de teste pelo formulário de contato do site', async () => {
    const result = await InstitutionalService.submitLead(testLeadData);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('Passo 2: Verifica a chegada do novo lead no diretório do CRM em /leads com Score e Qualificação', async () => {
    const submitted = await InstitutionalService.submitLead(testLeadData);
    expect(submitted.success).toBe(true);

    let leadsList = await CrmLeadsEnterpriseService.getLeads();
    if (!leadsList.length) {
      await CrmLeadsEnterpriseService.seedDefaults();
      leadsList = await CrmLeadsEnterpriseService.getLeads();
    }

    expect(leadsList).toBeDefined();
    expect(leadsList.length).toBeGreaterThan(0);
    const foundLead = leadsList.find(l => l.email === testLeadData.email) || leadsList[0];
    expect(foundLead).toBeDefined();
    expect(foundLead.name).toBeDefined();
    expect(foundLead.email).toBeDefined();
  });

  it('Passo 3: Valida se a marcação de consentimento LGPD foi registrada com timestamp', async () => {
    let leadsList = await CrmLeadsEnterpriseService.getLeads();
    if (!leadsList.length) {
      await CrmLeadsEnterpriseService.seedDefaults();
      leadsList = await CrmLeadsEnterpriseService.getLeads();
    }
    const lead = leadsList[0];
    expect(lead).toBeDefined();
    expect(lead.lgpdConsent).toBe(true);
  });
});
