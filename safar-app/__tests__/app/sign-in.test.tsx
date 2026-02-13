import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import SignInScreen from '@/app/auth/sign-in';

const mockSignIn = jest.fn(() => Promise.resolve({ success: true }));
const mockClearError = jest.fn();

let mockAuthState: {
  signIn: typeof mockSignIn;
  clearError: typeof mockClearError;
  isLoading: boolean;
  error: string | null;
};

jest.mock('@/lib/stores/useAuthStore', () => ({
  useAuthStore: (selector: (state: typeof mockAuthState) => unknown) => selector(mockAuthState),
}));

jest.mock('@/components/auth/SocialAuthButtons', () => ({
  SocialAuthDivider: () => null,
  SocialAuthButtons: () => null,
}));

jest.mock('@/components/ui/ScreenBackground', () => ({
  ScreenBackground: ({ children }: { children: React.ReactNode }) => children,
}));

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {
      signIn: mockSignIn,
      clearError: mockClearError,
      isLoading: false,
      error: null,
    };
  });

  it('renders the sign-in form fields and actions', () => {
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByPlaceholderText('Email address')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Forgot password?')).toBeTruthy();
    expect(getByText('Sign up')).toBeTruthy();
  });

  it('shows form validation errors for invalid input', async () => {
    const { getByText } = render(<SignInScreen />);

    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('clears stale errors and submits valid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);

    fireEvent.changeText(getByPlaceholderText('Email address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalledTimes(2); // once on mount, once on submit
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    expect(mockClearError.mock.invocationCallOrder[0]).toBeLessThan(
      mockSignIn.mock.invocationCallOrder[0]
    );
  });

  it('renders loading indicator when sign-in is in progress', () => {
    mockAuthState.isLoading = true;
    const { getByTestId } = render(<SignInScreen />);

    expect(getByTestId('sign-in-loading')).toBeTruthy();
  });

  it('renders auth error as an alert region', () => {
    mockAuthState.error = 'Invalid email or password';
    const { getByText, UNSAFE_getByProps } = render(<SignInScreen />);

    const errorText = getByText('Invalid email or password');
    expect(errorText).toBeTruthy();
    expect(UNSAFE_getByProps({ accessibilityRole: 'alert' })).toBeTruthy();
  });

  it('supports keyboard next/done behavior on inputs', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('Email address');
    const passwordInput = getByPlaceholderText('Password');

    expect(emailInput.props.returnKeyType).toBe('next');
    expect(typeof emailInput.props.onSubmitEditing).toBe('function');
    expect(passwordInput.props.returnKeyType).toBe('done');
    expect(typeof passwordInput.props.onSubmitEditing).toBe('function');
  });
});
