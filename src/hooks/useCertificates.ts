import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';

export interface Certificate {
  certificate_id: string;
  token_id?: string;
  serial_number?: string;
  issuer_did: string;
  recipient_account_id?: string;
  recipient_email?: string;
  issued_at: string;
  revoked_at?: string | null;
  metadata?: Record<string, unknown>;
}

export function useCertificates() {
  return useQuery<Certificate[]>({
    queryKey: ['certificates'],
    queryFn: async () => {
      // Stub
      return [];
    }
  });
}

export function useMyCertificates() {
  const { user } = useAuth();

  return useQuery<Certificate[]>({
    queryKey: ['my-certificates', user?.id],
    queryFn: async () => {
      // Stub
      return [];
    },
    enabled: !!user
  });
}

export function useCertificate(id: string | undefined) {
  return useQuery<Certificate | null>({
    queryKey: ['certificate', id],
    queryFn: async () => {
      // Stub
      return null;
    },
    enabled: !!id
  });
}

export function useVerifyCertificate(certId: string | undefined) {
  return useQuery<{ verified: boolean } | null>({
    queryKey: ['verify-certificate', certId],
    queryFn: async () => {
      // Stub fail-closed
      return { verified: false };
    },
    enabled: !!certId
  });
}

export function useCertificateStats() {
  return useQuery<{ total: number; active: number; revoked: number } | null>({
    queryKey: ['certificate-stats'],
    queryFn: async () => {
      // Stub safe default
      return {
        total: 0,
        active: 0,
        revoked: 0
      };
    }
  });
}
