import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';

export function useCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      // Stub
      return [];
    }
  });
}

export function useMyCertificates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-certificates', user?.id],
    queryFn: async () => {
      // Stub
      return [];
    },
    enabled: !!user
  });
}

export function useCertificate(id: string | undefined) {
  return useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => {
      // Stub
      return null;
    },
    enabled: !!id
  });
}

export function useVerifyCertificate(certId: string | undefined) {
  return useQuery({
    queryKey: ['verify-certificate', certId],
    queryFn: async () => {
      // Stub
      return { verified: true };
    },
    enabled: !!certId
  });
}

export function useCertificateStats() {
  return useQuery({
    queryKey: ['certificate-stats'],
    queryFn: async () => {
      // Stub
      return {
        total: 100,
        active: 95,
        revoked: 5
      };
    }
  });
}
