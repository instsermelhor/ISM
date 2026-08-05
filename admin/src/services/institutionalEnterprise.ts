/**
 * institutionalEnterprise.ts  — Compatibility Stub (R009)
 * ─────────────────────────────────────────────────────────
 * Re-exports the service used by AboutTeamPage.tsx.
 * Official backend: ./institutional (InstitutionalFirestoreService).
 *
 * AboutTeamPage imports:
 *   InstitutionalEnterpriseService,
 *   type ImpactIndicator, type TransparencyDocument, type OrgCertification
 */

// Re-export everything from the official institutional service
export {
  InstitutionalFirestoreService,
  type InstitutionalPageData,
  type TransparencyDoc,
  type ValueBlockData,
} from './institutional';

// ── Types required by AboutTeamPage ──────────────────────────────────────

export interface ImpactIndicator {
  id?: string;
  label: string;
  value: string;
  unit?: string;
  description?: string;
  iconEmoji?: string;
  order?: number;
}

export interface TransparencyDocument {
  id?: string;
  title: string;
  documentType?: string;
  fileUrl?: string;
  publicationDate?: string;
  description?: string;
}

export interface OrgCertification {
  id?: string;
  name: string;
  issuingBody?: string;
  year?: number;
  description?: string;
  badgeUrl?: string;
}

// ── Service ───────────────────────────────────────────────────────────────
// Data for these three methods is fetched separately by other means,
// so we return empty arrays as per the spec.

export const InstitutionalEnterpriseService = {
  async getIndicators(): Promise<ImpactIndicator[]> {
    return [];
  },

  async getTransparencyDocs(): Promise<TransparencyDocument[]> {
    return [];
  },

  async getCertifications(): Promise<OrgCertification[]> {
    return [];
  },
};
