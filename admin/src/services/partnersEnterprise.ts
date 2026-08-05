/**
 * partnersEnterprise.ts  — Compatibility Stub (R009)
 * ─────────────────────────────────────────────────────
 * Re-exports the service used by PartnersPage.tsx.
 * Official backend: ./publishedPartnersService (PublishedPartnersService).
 *
 * PartnersPage imports:
 *   PartnersEnterpriseService,
 *   type InstitutionalPartner, type PartnerAgreement, type CrmDeal, type DealStage
 */

import {
  PublishedPartnersService,
  type PublishedPartnerData,
} from './publishedPartnersService';

// Re-export base types from the official service so pages can use them
export type {
  PublishedPartnerData,
  PartnerCategory,
  PartnerStatus,
  PartnerTier,
  PartnerType,
  validatePartnerUrl,
} from './publishedPartnersService';

// ── Types required by PartnersPage ───────────────────────────────────────

/** Maps to PublishedPartnerData — alias used by PartnersPage */
export type InstitutionalPartner = PublishedPartnerData;

export type DealStage =
  | 'PROSPECAO'
  | 'QUALIFICACAO'
  | 'PROPOSTA'
  | 'ANALISE_JURIDICA'
  | 'FORMALIZACAO'
  | 'EM_EXECUCAO'
  | 'RENOVACAO'
  | 'ENCERRADO';

export interface PartnerAgreement {
  id?: string;
  partnerId?: string;
  partnerName?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  value?: number;
  description?: string;
  status?: string;
  documentUrl?: string;
  updatedAt?: unknown;
}

export interface CrmDeal {
  id?: string;
  partnerId?: string;
  partnerName?: string;
  stage: DealStage;
  value?: number;
  description?: string;
  responsiblePerson?: string;
  expectedCloseDate?: string;
  notes?: string;
  updatedAt?: unknown;
}

// ── Service ───────────────────────────────────────────────────────────────

export const PartnersEnterpriseService = {
  /** Lists all institutional partners — delegates to PublishedPartnersService.getAll() */
  async getPartners(): Promise<InstitutionalPartner[]> {
    return PublishedPartnersService.getAll();
  },

  /** Seeds default partners — delegates to PublishedPartnersService.seedDefaults() */
  async seedDefaults(): Promise<void> {
    return PublishedPartnersService.seedDefaults();
  },

  /** Returns partner agreements — no dedicated service yet, returns empty */
  async getAgreements(): Promise<PartnerAgreement[]> {
    return [];
  },

  /** Returns CRM deals — no dedicated service yet, returns empty */
  async getDeals(): Promise<CrmDeal[]> {
    return [];
  },

  /** Saves a partner — delegates to PublishedPartnersService.create/update */
  async savePartner(part: InstitutionalPartner): Promise<void> {
    const { id, ...data } = part;
    if (id) {
      await PublishedPartnersService.update(id, data, 'admin');
    } else {
      await PublishedPartnersService.create(data, 'admin');
    }
  },
};
