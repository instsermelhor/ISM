import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  getCountFromServer,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface PartnerApplication {
  id: string;
  type: string;
  companyName: string;
  contactName: string;
  contactTitle?: string;
  email: string;
  phone?: string;
  areaOfInterest: string;
  intendedContribution?: string;
  status: string;
  submissionDate: string;
  createdAt: Timestamp | null;
}

export interface DonationRecord {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  type: string;
  message?: string;
  createdAt: Timestamp | null;
}

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source: string;
  status: string;
  createdAt: Timestamp | null;
}

export interface DbCollectionStatus {
  name: string;
  label: string;
  count: number;
  lastSync: Date | null;
}

export interface DbStatus {
  connected: boolean;
  projectId: string;
  collections: DbCollectionStatus[];
  lastSync: Date | null;
}

// ── Partner Applications ────────────────────────────────────────────────────

export const FirestoreService = {
  /**
   * Lista todas as candidaturas de parceria (ordenadas por data DESC)
   */
  async getPartnerApplications(): Promise<PartnerApplication[]> {
    const q = query(
      collection(db, 'partner_applications'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<PartnerApplication, 'id'>),
    }));
  },

  /**
   * Listener em tempo real para candidaturas de parceria
   */
  subscribePartnerApplications(
    callback: (data: PartnerApplication[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'partner_applications'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    return onSnapshot(q, snap => {
      callback(
        snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<PartnerApplication, 'id'>),
        }))
      );
    });
  },

  /**
   * Lista todas as doações (ordenadas por data DESC)
   */
  async getDonations(): Promise<DonationRecord[]> {
    const q = query(
      collection(db, 'donations'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<DonationRecord, 'id'>),
    }));
  },

  /**
   * Listener em tempo real para doações
   */
  subscribeDonations(callback: (data: DonationRecord[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'donations'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    return onSnapshot(q, snap => {
      callback(
        snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<DonationRecord, 'id'>),
        }))
      );
    });
  },

  /**
   * Lista todos os leads (ordenados por data DESC)
   */
  async getLeads(): Promise<LeadRecord[]> {
    const q = query(
      collection(db, 'leads'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<LeadRecord, 'id'>),
    }));
  },

  /**
   * Retorna o status geral do banco de dados e contagem por coleção
   */
  async getDbStatus(): Promise<DbStatus> {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'ismbd-27e84';

    try {
      const [partnersSnap, donationsSnap, leadsSnap] = await Promise.all([
        getCountFromServer(collection(db, 'partner_applications')),
        getCountFromServer(collection(db, 'donations')),
        getCountFromServer(collection(db, 'leads')),
      ]);

      return {
        connected: true,
        projectId,
        lastSync: new Date(),
        collections: [
          {
            name: 'partner_applications',
            label: 'Candidaturas de Parceria',
            count: partnersSnap.data().count,
            lastSync: new Date(),
          },
          {
            name: 'donations',
            label: 'Doações',
            count: donationsSnap.data().count,
            lastSync: new Date(),
          },
          {
            name: 'leads',
            label: 'Leads de Contato',
            count: leadsSnap.data().count,
            lastSync: new Date(),
          },
        ],
      };
    } catch {
      return {
        connected: false,
        projectId,
        lastSync: null,
        collections: [
          { name: 'partner_applications', label: 'Candidaturas de Parceria', count: 0, lastSync: null },
          { name: 'donations', label: 'Doações', count: 0, lastSync: null },
          { name: 'leads', label: 'Leads de Contato', count: 0, lastSync: null },
        ],
      };
    }
  },

  /**
   * Adiciona um lead de contato manualmente
   */
  async addLead(data: Omit<LeadRecord, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, 'leads'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },
};
