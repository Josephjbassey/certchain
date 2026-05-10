import { create } from 'zustand';

export interface Certificate {
  certificateId: string;
  tokenId: string;
  serialNumber: number;
  recipientName: string;
  recipientAccountId: string;
  courseName: string;
  institutionName: string;
  issueDate: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  fileHash: string;
  ipfsCid: string;
  metadata: unknown;
}

interface CertificateState {
  certificates: Certificate[];
  isLoading: boolean;
  error: string | null;
  filterStatus: string | null;
  searchQuery: string;
  setCertificates: (certificates: Certificate[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilterStatus: (status: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useCertificateStore = create<CertificateState>((set) => ({
  certificates: [],
  isLoading: false,
  error: null,
  filterStatus: null,
  searchQuery: '',
  setCertificates: (certificates) => set({ certificates }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

export const selectFilteredCertificates = (state: CertificateState) => {
  return state.certificates.filter((cert) => {
    const matchesStatus = !state.filterStatus || cert.status === state.filterStatus;
    const matchesSearch = !state.searchQuery ||
      cert.recipientName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      cert.certificateId.toLowerCase().includes(state.searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });
};
