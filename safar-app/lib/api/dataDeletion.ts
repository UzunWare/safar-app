/**
 * Data Deletion API
 * Story 7.8 - GDPR data deletion request
 */

import { supabase } from './supabase';

export interface DeletionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface DeletionRequestStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  completed_at: string | null;
}

export async function requestDataDeletion(): Promise<DeletionResult> {
  try {
    // Edge Function extracts user from the JWT Bearer token automatically
    const { data, error } = await supabase.functions.invoke('request-data-deletion');

    if (error) {
      return { success: false, error: error.message };
    }

    // Pass through duplicate detection message from Edge Function
    if (data?.message) {
      return { success: true, message: data.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to request data deletion. Please try again.' };
  }
}

export async function getDeletionRequestStatus(
  userId: string
): Promise<DeletionRequestStatus | null> {
  try {
    const { data, error } = await supabase
      .from('deletion_requests')
      .select('id, status, requested_at, completed_at')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as DeletionRequestStatus;
  } catch {
    return null;
  }
}
