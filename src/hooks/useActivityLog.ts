import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface ActivityLogEntry {
  action: string;
  resourceType: 'certificate' | 'institution' | 'user' | 'did' | 'webhook' | 'apikey' | 'invitation' | 'system';
  resourceId?: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Production-ready activity logging hook
 * Logs user actions to application_logs table for audit trail and analytics
 * 
 * @example
 * const { logActivity } = useActivityLog();
 * 
 * // Log certificate issuance
 * await logActivity({
 *   action: 'certificate_issued',
 *   resourceType: 'certificate',
 *   resourceId: certificateId,
 *   metadata: { recipientEmail, courseName }
 * });
 */
export const useActivityLog = () => {
  const { user } = useAuth();

  const logActivity = async ({
    action,
    resourceType,
    resourceId,
    metadata,
    severity = 'info'
  }: ActivityLogEntry): Promise<void> => {
    try {
      if (!user) {
        console.warn('Cannot log activity: No authenticated user');
        return;
      }

      // Get user's institution_id if available
      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user.id)
        .single();

      // Insert log entry
      const { error } = await supabase
        .from('application_logs')
        .insert({
          user_id: user.id,
          institution_id: profile?.institution_id || null,
          action,
          resource_type: resourceType,
          resource_id: resourceId || null,
          metadata: metadata || null,
          severity,
          ip_address: null, // Can be populated via edge function if needed
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - logging failures shouldn't break app functionality
      }
    } catch (error) {
      console.error('Activity logging error:', error);
      // Silent fail - logging is non-critical
    }
  };

  /**
   * Batch log multiple activities at once (useful for bulk operations)
   */
  const logBatchActivity = async (entries: ActivityLogEntry[]): Promise<void> => {
    try {
      if (!user) {
        console.warn('Cannot log batch activity: No authenticated user');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user.id)
        .single();

      const logEntries = entries.map(entry => ({
        user_id: user.id,
        institution_id: profile?.institution_id || null,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId || null,
        metadata: entry.metadata || null,
        severity: entry.severity || 'info',
        ip_address: null,
        user_agent: navigator.userAgent,
      }));

      const { error } = await supabase
        .from('application_logs')
        .insert(logEntries);

      if (error) {
        console.error('Failed to log batch activity:', error);
      }
    } catch (error) {
      console.error('Batch activity logging error:', error);
    }
  };

  /**
   * Log an error with automatic severity classification
   */
  const logError = async (
    action: string,
    error: Error | unknown,
    metadata?: Record<string, any>
  ): Promise<void> => {
    const errorMetadata = {
      ...metadata,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : String(error)
    };

    await logActivity({
      action,
      resourceType: 'system',
      severity: 'error',
      metadata: errorMetadata
    });
  };

  /**
   * Log a critical security event
   */
  const logSecurityEvent = async (
    action: string,
    resourceType: ActivityLogEntry['resourceType'],
    metadata?: Record<string, any>
  ): Promise<void> => {
    await logActivity({
      action,
      resourceType,
      severity: 'critical',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        securityEvent: true
      }
    });
  };

  return {
    logActivity,
    logBatchActivity,
    logError,
    logSecurityEvent,
  };
};

// Common activity actions for consistency
export const ActivityActions = {
  // Certificate operations
  CERTIFICATE_ISSUED: 'certificate_issued',
  CERTIFICATE_VIEWED: 'certificate_viewed',
  CERTIFICATE_VERIFIED: 'certificate_verified',
  CERTIFICATE_REVOKED: 'certificate_revoked',
  CERTIFICATE_CLAIMED: 'certificate_claimed',
  CERTIFICATE_BATCH_ISSUED: 'certificate_batch_issued',

  // Institution operations
  INSTITUTION_CREATED: 'institution_created',
  INSTITUTION_UPDATED: 'institution_updated',
  INSTITUTION_DELETED: 'institution_deleted',

  // User operations
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTERED: 'user_registered',
  USER_PROFILE_UPDATED: 'user_profile_updated',
  USER_PASSWORD_CHANGED: 'user_password_changed',

  // DID operations
  DID_CREATED: 'did_created',
  DID_UPDATED: 'did_updated',
  DID_VERIFIED: 'did_verified',

  // Webhook operations
  WEBHOOK_CREATED: 'webhook_created',
  WEBHOOK_UPDATED: 'webhook_updated',
  WEBHOOK_DELETED: 'webhook_deleted',
  WEBHOOK_TRIGGERED: 'webhook_triggered',
  WEBHOOK_FAILED: 'webhook_failed',

  // API key operations
  APIKEY_CREATED: 'apikey_created',
  APIKEY_USED: 'apikey_used',
  APIKEY_REVOKED: 'apikey_revoked',

  // Invitation operations
  INVITATION_SENT: 'invitation_sent',
  INVITATION_ACCEPTED: 'invitation_accepted',
  INVITATION_EXPIRED: 'invitation_expired',

  // Security events
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  FAILED_LOGIN_ATTEMPT: 'failed_login_attempt',
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled',
} as const;
