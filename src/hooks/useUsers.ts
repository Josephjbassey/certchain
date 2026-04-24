import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'institution_admin' | 'instructor' | 'candidate';

export interface AdminUser {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  role: UserRole | null;
  institution_id: string | null;
  disabled: boolean;
}

const listUsersFn = async (params: { page?: number; perPage?: number; search?: string }) => {
  const { page = 1, perPage = 25, search } = params;
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'list', page, perPage, search },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to list users');
  return data as { success: true; users: AdminUser[]; page: number; perPage: number; count: number };
};

const createUserFn = async (payload: { email: string; role: UserRole; institutionId?: string }) => {
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'create', ...payload },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to create user');
  return data as { success: true; userId: string; email: string; role: UserRole; institutionId?: string | null };
};

const updateUserFn = async (payload: { userId: string; role?: UserRole; disabled?: boolean; institutionId?: string }) => {
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'update', ...payload },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to update user');
  return data as { success: true; userId: string; updated: Record<string, unknown> };
};

const deleteUserFn = async (payload: { userId: string }) => {
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action: 'delete', ...payload },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to delete user');
  return data as { success: true; userId: string };
};

export const useUsers = (params: { page?: number; perPage?: number; search?: string } = {}) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => listUsersFn(params),
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUserFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUserFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUserFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};
