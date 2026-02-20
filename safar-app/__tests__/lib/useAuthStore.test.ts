/**
 * Auth Store Tests
 *
 * Tests onboarding status caching in Zustand store
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { supabase } from '@/lib/api/supabase';
import { storeAuthToken, removeAuthToken } from '@/lib/api/secure-storage';

// Mock supabase
jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
  },
}));

jest.mock('@/lib/api/secure-storage', () => ({
  storeAuthToken: jest.fn(() => Promise.resolve()),
  removeAuthToken: jest.fn(() => Promise.resolve()),
}));

describe('useAuthStore - onboarding caching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      session: null,
      user: null,
      onboardingCompleted: null,
      isLoading: false,
      isInitialized: false,
      error: null,
    });
  });

  describe('setSession with onboarding status', () => {
    it('fetches and caches onboarding_completed from user profile', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { onboarding_completed: true },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.setSession(mockSession as any);
      });

      await waitFor(() => {
        expect(result.current.onboardingCompleted).toBe(true);
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.user).toEqual(mockSession.user);
      });

      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockSelect).toHaveBeenCalledWith('onboarding_completed');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(mockSingle).toHaveBeenCalled();
      expect(storeAuthToken).toHaveBeenCalledWith('token');
    });

    it('defaults to false when profile does not exist', async () => {
      const mockSession = {
        user: { id: 'new-user', email: 'new@example.com' },
        access_token: 'token',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockRejectedValue(new Error('Profile not found'));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.setSession(mockSession as any);
      });

      await waitFor(() => {
        expect(result.current.onboardingCompleted).toBe(false);
        expect(result.current.session).toEqual(mockSession);
      });
    });

    it('clears onboarding status when session is null', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First set a session with onboarding completed
      act(() => {
        useAuthStore.setState({
          session: { user: { id: 'user-123' } } as any,
          user: { id: 'user-123' } as any,
          onboardingCompleted: true,
        });
      });

      expect(result.current.onboardingCompleted).toBe(true);

      // Then clear session
      await act(async () => {
        await result.current.setSession(null);
      });

      await waitFor(() => {
        expect(result.current.onboardingCompleted).toBeNull();
        expect(result.current.session).toBeNull();
        expect(result.current.user).toBeNull();
      });

      expect(removeAuthToken).toHaveBeenCalled();
    });

    it('updates onboarding status when profile changes', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn();

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const { result } = renderHook(() => useAuthStore());

      // First call - onboarding not completed
      mockSingle.mockResolvedValueOnce({
        data: { onboarding_completed: false },
        error: null,
      });

      await act(async () => {
        await result.current.setSession(mockSession as any);
      });

      await waitFor(() => {
        expect(result.current.onboardingCompleted).toBe(false);
      });

      // Second call - onboarding completed
      mockSingle.mockResolvedValueOnce({
        data: { onboarding_completed: true },
        error: null,
      });

      await act(async () => {
        await result.current.setSession(mockSession as any);
      });

      await waitFor(() => {
        expect(result.current.onboardingCompleted).toBe(true);
      });
    });
  });

  describe('signIn error handling', () => {
    it('maps network failures to user-friendly error message', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      );

      const { result } = renderHook(() => useAuthStore());

      let response: { success: boolean; error?: string } | undefined;
      await act(async () => {
        response = await result.current.signIn('test@example.com', 'password123');
      });

      expect(response).toEqual({
        success: false,
        error: 'Unable to connect. Please check your internet connection.',
      });
      expect(result.current.error).toBe(
        'Unable to connect. Please check your internet connection.'
      );
    });
  });

  describe('signUp duplicate detection', () => {
    it('maps confirmation email delivery failures to a user-friendly message', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Error sending confirmation email',
        },
      });

      const { result } = renderHook(() => useAuthStore());

      let response: { success: boolean; error?: string } | undefined;
      await act(async () => {
        response = await result.current.signUp('new@example.com', 'password123');
      });

      expect(response).toEqual({
        success: false,
        error: 'We could not send the confirmation email. Please try again shortly.',
      });
      expect(result.current.error).toBe(
        'We could not send the confirmation email. Please try again shortly.'
      );
    });

    it('detects existing confirmed account via empty identities array', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'fake-id', identities: [] },
          session: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      let response: { success: boolean; error?: string } | undefined;
      await act(async () => {
        response = await result.current.signUp('existing@example.com', 'password123');
      });

      expect(response).toEqual({
        success: false,
        error: 'An account with this email already exists',
      });
      expect(result.current.error).toBe('An account with this email already exists');
    });

    it('shows check email message for genuine new signup', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'new-id', identities: [{ id: 'identity-1' }] },
          session: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      let response: { success: boolean; error?: string } | undefined;
      await act(async () => {
        response = await result.current.signUp('new@example.com', 'password123');
      });

      expect(response).toEqual({
        success: false,
        error: 'Please check your email to confirm your account',
      });
      expect(result.current.error).toBeNull(); // error only in return value, not store (prevents flash)
    });
  });

  describe('signOut', () => {
    it('removes secure token during sign out', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuthStore());
      useAuthStore.setState({
        session: { access_token: 'token', user: { id: 'user-123' } } as any,
        user: { id: 'user-123' } as any,
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(removeAuthToken).toHaveBeenCalled();
      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });
});
