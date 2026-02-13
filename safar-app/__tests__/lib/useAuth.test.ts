import { renderHook } from '@testing-library/react-native';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/useAuthStore';

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: true,
      error: null,
      onboardingCompleted: null,
      signInWithSocial: jest.fn(),
    } as any);
  });

  it('returns isAuthenticated=false when there is no session', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('returns isAuthenticated=true when a session exists', () => {
    useAuthStore.setState({
      session: { access_token: 'token', user: { id: 'user-123' } } as any,
      user: { id: 'user-123' } as any,
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe('user-123');
  });

  it('exposes signInWithSocial from the auth store', () => {
    const signInWithSocial = jest.fn();
    useAuthStore.setState({ signInWithSocial } as any);

    const { result } = renderHook(() => useAuth());
    expect(result.current.signInWithSocial).toBe(signInWithSocial);
  });
});
