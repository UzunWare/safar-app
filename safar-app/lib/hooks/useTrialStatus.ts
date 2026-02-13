/**
 * useTrialStatus Hook
 *
 * Derives trial status info (days remaining, end date, urgency)
 * from the subscription store.
 *
 * Story 6.2: Free Trial Period - Task 4
 */

import { useMemo } from 'react';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';

interface TrialStatus {
  isInTrial: boolean;
  daysRemaining: number;
  endDate: Date | null;
  isUrgent: boolean;
}

export function useTrialStatus(): TrialStatus {
  const isTrialActive = useSubscriptionStore((s) => s.isTrialActive);
  const expirationDate = useSubscriptionStore((s) => s.expirationDate);

  return useMemo(() => {
    if (!isTrialActive) {
      return { isInTrial: false, daysRemaining: 0, endDate: null, isUrgent: false };
    }

    const endDate = expirationDate ? new Date(expirationDate) : null;
    const daysRemaining = endDate
      ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      isInTrial: true,
      daysRemaining,
      endDate,
      isUrgent: daysRemaining <= 2,
    };
  }, [isTrialActive, expirationDate]);
}
