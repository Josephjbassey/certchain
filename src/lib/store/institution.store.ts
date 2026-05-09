import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InstitutionProfile {
  accountId: string;
  name: string;
  domain: string;
  email: string;
  logoCID?: string;
  country?: string;
  website?: string;
}

interface InstitutionState {
  institution: InstitutionProfile | null;
  topicId: string | null;
  collectionId: string | null;
  setInstitution: (institution: InstitutionProfile) => void;
  setBlockchainResources: (topicId: string, collectionId: string) => void;
  clearInstitution: () => void;
}

export const useInstitutionStore = create<InstitutionState>()(
  persist(
    (set) => ({
      institution: null,
      topicId: null,
      collectionId: null,
      setInstitution: (institution) => set({ institution }),
      setBlockchainResources: (topicId, collectionId) => set({ topicId, collectionId }),
      clearInstitution: () => set({ institution: null, topicId: null, collectionId: null }),
    }),
    {
      name: 'certchain-institution-storage',
    }
  )
);
