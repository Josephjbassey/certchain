import { useAuth } from '@/lib/auth-context';

export type ActivityActions = 'login' | 'issue' | 'verify' | 'logout' | 'update_profile';

export const useActivityLog = () => {
  const { user } = useAuth();

  const logActivity = async (action: ActivityActions, details?: string) => {
    if (!user) return;
    console.log(`Activity Logged: ${action} - ${details}`);
    // Stub
  };

  const logError = async (action: ActivityActions, error: string) => {
    if (!user) return;
    console.error(`Error Logged: ${action} - ${error}`);
    // Stub
  };

  return { logActivity, logError };
};
