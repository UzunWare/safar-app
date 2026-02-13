/**
 * useTrialStatus Hook Tests
 *
 * Story 6.2: Free Trial Period - Task 4
 */

import { renderHook, act } from '@testing-library/react-native';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';
import { useTrialStatus } from '@/lib/hooks/useTrialStatus';

describe('useTrialStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubscriptionStore.getState().reset();
  });

  it('should return isInTrial false when not in trial', () => {
    useSubscriptionStore.setState({
      isTrialActive: false,
      expirationDate: null,
    });

    const { result } = renderHook(() => useTrialStatus());

    expect(result.current.isInTrial).toBe(false);
    expect(result.current.daysRemaining).toBe(0);
    expect(result.current.endDate).toBeNull();
  });

  it('should return isInTrial true when trial is active', () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    useSubscriptionStore.setState({
      isTrialActive: true,
      expirationDate: futureDate,
    });

    const { result } = renderHook(() => useTrialStatus());

    expect(result.current.isInTrial).toBe(true);
    expect(result.current.daysRemaining).toBe(5);
    expect(result.current.endDate).toBeInstanceOf(Date);
  });

  it('should calculate days remaining correctly for 7 days', () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    useSubscriptionStore.setState({
      isTrialActive: true,
      expirationDate: futureDate,
    });

    const { result } = renderHook(() => useTrialStatus());

    expect(result.current.daysRemaining).toBe(7);
  });

  it('should return 1 day remaining for less than 24 hours', () => {
    const futureDate = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    useSubscriptionStore.setState({
      isTrialActive: true,
      expirationDate: futureDate,
    });

    const { result } = renderHook(() => useTrialStatus());

    expect(result.current.daysRemaining).toBe(1);
  });

  it('should return 0 days remaining when expired', () => {
    const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    useSubscriptionStore.setState({
      isTrialActive: true,
      expirationDate: pastDate,
    });

    const { result } = renderHook(() => useTrialStatus());

    expect(result.current.daysRemaining).toBe(0);
  });

  it('should return 0 days and null endDate when no expiration date', () => {
    useSubscriptionStore.setState({
      isTrialActive: true,
      expirationDate: null,
    });

    const { result } = renderHook(() => useTrialStatus());

    expect(result.current.daysRemaining).toBe(0);
    expect(result.current.endDate).toBeNull();
  });

  it('should detect urgency when 2 or fewer days remaining', () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    useSubscriptionStore.setState({
      isTrialActive: true,
      expirationDate: futureDate,
    });

    const { result } = renderHook(() => useTrialStatus());

    expect(result.current.isUrgent).toBe(true);
  });

  it('should not be urgent with more than 2 days remaining', () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    useSubscriptionStore.setState({
      isTrialActive: true,
      expirationDate: futureDate,
    });

    const { result } = renderHook(() => useTrialStatus());

    expect(result.current.isUrgent).toBe(false);
  });

  it('should update when store changes', () => {
    useSubscriptionStore.setState({
      isTrialActive: false,
      expirationDate: null,
    });

    const { result } = renderHook(() => useTrialStatus());
    expect(result.current.isInTrial).toBe(false);

    act(() => {
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      useSubscriptionStore.setState({
        isTrialActive: true,
        expirationDate: futureDate,
      });
    });

    expect(result.current.isInTrial).toBe(true);
    expect(result.current.daysRemaining).toBe(3);
  });
});
