import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type StaffRole = 'instructor' | 'issuer';

export interface StaffMember {
  userId: string;
  email: string | null;
  role: StaffRole | null;
  disabled: boolean;
  institutionId: string;
}

const listStaffFn = async (params: { institutionId: string; search?: string }) => {
  const { institutionId, search } = params;
  const { data, error } = await supabase.functions.invoke('institution-staff', {
    body: { action: 'list', institutionId, search },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to list staff');
  return data as { success: true; institutionId: string; count: number; staff: StaffMember[] };
};

const addStaffFn = async (payload: { institutionId: string; userId?: string; email?: string; role?: StaffRole }) => {
  const { data, error } = await supabase.functions.invoke('institution-staff', {
    body: { action: 'add', ...payload },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to add staff');
  return data as { success: true; institutionId: string; userId: string };
};

const removeStaffFn = async (payload: { institutionId: string; userId: string }) => {
  const { data, error } = await supabase.functions.invoke('institution-staff', {
    body: { action: 'remove', ...payload },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to remove staff');
  return data as { success: true; institutionId: string; userId: string };
};

export const useInstitutionStaff = (institutionId: string | null, search?: string) => {
  return useQuery({
    queryKey: ['institution-staff', institutionId, search],
    queryFn: () => listStaffFn({ institutionId: institutionId as string, search }),
    enabled: !!institutionId,
  });
};

export const useAddInstitutionStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addStaffFn,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['institution-staff', res.institutionId] });
    },
  });
};

export const useRemoveInstitutionStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeStaffFn,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['institution-staff', res.institutionId] });
    },
  });
};
