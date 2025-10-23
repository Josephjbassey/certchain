import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';

export interface CertificateMetadata {
  [key: string]: unknown;
}

export interface Certificate {
  id: string;
  certificate_id: string;
  token_id: string;
  serial_number: number;
  issuer_did: string;
  recipient_did: string | null;
  recipient_email: string | null;
  recipient_account_id: string | null;
  course_name: string;
  ipfs_cid: string;
  hedera_tx_id: string | null;
  metadata: CertificateMetadata;
  issued_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  last_synced_at: string | null;
}

export const useCertificates = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      // @ts-expect-error - Supabase types not generated
      const { data, error } = await supabase.from('certificate_cache').select('*').order('issued_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Certificate[];
    },
    enabled: !!user,
  });
};

export const useMyCertificates = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-certificates', user?.id],
    queryFn: async () => {
      // @ts-expect-error - Supabase types not generated
      const { data: profile } = await supabase.from('profiles').select('hedera_account_id').eq('id', user?.id).maybeSingle();

      const hederaAccountId = profile && typeof profile === 'object' && 'hedera_account_id' in profile ? (profile as { hedera_account_id: string }).hedera_account_id : null;

      if (!hederaAccountId) return [];

      // @ts-expect-error - Supabase types not generated
      const { data, error } = await supabase.from('certificate_cache').select('*').eq('recipient_account_id', hederaAccountId).order('issued_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Certificate[];
    },
    enabled: !!user,
  });
};

export const useCertificateStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['certificate-stats', user?.id],
    queryFn: async () => {
      // @ts-expect-error - Supabase types not generated
      const { data: allCerts, error } = await supabase.from('certificate_cache').select('revoked_at');

      if (error) throw error;

      const totalCertificates = allCerts?.length || 0;
      const activeCertificates = allCerts?.filter((c: { revoked_at: string | null }) => !c.revoked_at).length || 0;

      // @ts-expect-error - Supabase types not generated
      const { count: recipientCount } = await supabase.from('certificate_cache').select('recipient_account_id', { count: 'exact', head: true });

      return {
        totalCertificates,
        activeCertificates,
        recipients: recipientCount || 0,
        verifications: 0, // TODO: Implement verification tracking
      };
    },
    enabled: !!user,
  });
};
