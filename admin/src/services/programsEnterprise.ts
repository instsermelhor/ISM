/**
 * programsEnterprise.ts  — Compatibility Stub (R009)
 * ─────────────────────────────────────────────────────
 * Re-exports the service used by ServicesPage.tsx.
 * Official backend: ./programsService (ProgramsService).
 *
 * ServicesPage imports:
 *   ProgramsEnterpriseService,
 *   type SocialProgram, type SocialProject, type ProgramKpi, type ProgramLifecycleStage
 */

import {
  ProgramsService,
  type ProgramDataAdmin,
} from './programsService';

// Re-export types from the official service for convenience
export type {
  ProgramDataAdmin,
  ProgramPublicationStatus,
  ProgramGalleryImage,
} from './programsService';

// ── Types required by ServicesPage ────────────────────────────────────────

export type ProgramLifecycleStage =
  | 'PLANEJAMENTO'
  | 'APROVACAO'
  | 'CAPTACAO'
  | 'EXECUCAO'
  | 'MONITORAMENTO'
  | 'PRESTACAO_CONTAS'
  | 'CONCLUIDO'
  | 'ARQUIVADO';

/** Enterprise view of a social program — maps to ProgramDataAdmin */
export interface SocialProgram {
  id?: string;
  title: string;
  description?: string;
  stage?: ProgramLifecycleStage;
  category?: string;
  thematicArea?: string;
  targetAudience?: string;
  impactMetric?: string;
  impactValue?: string;
  imageUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  tags?: string[];
  updatedAt?: unknown;
  createdAt?: unknown;
}

/** Legacy alias kept for builds that reference EnterpriseProgram */
export type EnterpriseProgram = SocialProgram;

export interface SocialProject {
  id?: string;
  programId?: string;
  title: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  responsiblePerson?: string;
  budget?: number;
  order?: number;
}

export interface ProgramKpi {
  id?: string;
  programId?: string;
  label: string;
  value: string;
  unit?: string;
  period?: string;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  order?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function programDataToSocialProgram(p: ProgramDataAdmin): SocialProgram {
  return {
    id:            p.id,
    title:         p.title,
    description:   p.description,
    category:      p.category,
    thematicArea:  p.thematicArea,
    targetAudience: p.targetAudience,
    impactMetric:  p.impactMetric,
    impactValue:   p.impactValue,
    imageUrl:      p.imageUrl,
    isFeatured:    p.isFeatured,
    order:         p.order,
    tags:          p.tags,
    updatedAt:     p.updatedAt,
  };
}

function socialProgramToProgramData(prog: SocialProgram): ProgramDataAdmin {
  return {
    id:            prog.id,
    title:         prog.title || '',
    slug:          prog.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `prog-${Date.now()}`,
    description:   prog.description || '',
    order:         prog.order ?? 0,
    status:        prog.isActive ? 'PUBLISHED' : 'DRAFT',
    isPublished:   prog.isActive ?? false,
    category:      prog.category as ProgramDataAdmin['category'],
    thematicArea:  prog.thematicArea,
    targetAudience: prog.targetAudience,
    impactMetric:  prog.impactMetric,
    impactValue:   prog.impactValue,
    imageUrl:      prog.imageUrl,
    isFeatured:    prog.isFeatured,
    tags:          prog.tags,
  };
}

// ── Service ───────────────────────────────────────────────────────────────

export const ProgramsEnterpriseService = {
  /** Returns all programs from the official `programs` Firestore collection */
  async getPrograms(): Promise<SocialProgram[]> {
    try {
      const items = await ProgramsService.getAll();
      return items.map(programDataToSocialProgram);
    } catch {
      return [];
    }
  },

  /** Seeds defaults via the official ProgramsService */
  async seedDefaults(): Promise<void> {
    try {
      await ProgramsService.seedDefaults?.();
    } catch (e) {
      console.warn('[ProgramsEnterpriseService] seedDefaults error:', e);
    }
  },

  /** Returns social projects — no dedicated service yet, returns empty */
  async getProjects(): Promise<SocialProject[]> {
    return [];
  },

  /** Returns KPIs — no dedicated service yet, returns empty */
  async getKpis(): Promise<ProgramKpi[]> {
    return [];
  },

  /** Saves a program via the official ProgramsService */
  async saveProgram(prog: SocialProgram): Promise<void> {
    try {
      const data = socialProgramToProgramData(prog);
      await ProgramsService.save(data, 'admin');
    } catch (e) {
      console.error('[ProgramsEnterpriseService] saveProgram error:', e);
      throw e;
    }
  },
};
