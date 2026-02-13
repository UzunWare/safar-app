/**
 * Data Export API
 * Story 7.7 - GDPR data export request
 */

import { supabase } from './supabase';

export interface ExportResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface ExportRequestStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  requested_at: string;
  completed_at: string | null;
}

export async function requestDataExport(): Promise<ExportResult> {
  try {
    // Edge Function extracts user from the JWT Bearer token automatically
    const { data, error } = await supabase.functions.invoke('request-data-export');

    if (error) {
      return { success: false, error: error.message };
    }

    // Pass through duplicate detection message from Edge Function
    if (data?.message) {
      return { success: true, message: data.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to request data export. Please try again.' };
  }
}

export async function getExportRequestStatus(
  userId: string
): Promise<ExportRequestStatus | null> {
  try {
    const { data, error } = await supabase
      .from('export_requests')
      .select('id, status, requested_at, completed_at')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ExportRequestStatus;
  } catch {
    return null;
  }
}
