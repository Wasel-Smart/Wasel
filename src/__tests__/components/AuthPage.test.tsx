import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthPage } from '../../components/AuthPage';
import { renderWithProviders } from '../test-utils';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
    signInWithFacebook: vi.fn().mockResolvedValue({ error: null }),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthPage Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render AuthPage with signup tab by default', () => {
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      );
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render with login tab when initialTab is login', () => {
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} initialTab="login" />
      );
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should display Wasel branding', () => {
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      );
      expect(screen.getByText(/welcome to wassel/i)).toBeInTheDocument();
      expect(screen.getByText(/واصل/)).toBeInTheDocument();
    });

    it('should render back button', () => {
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      );
      expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
    });
  });

  describe('Signup Form Validation', () => {
    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      );

      const inputs = screen.getAllByRole('textbox');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');

      // Fill form
      await user.type(inputs[0], 'Ahmed');
      await user.type(inputs[1], 'Hassan');
      await user.type(inputs[2], 'test@example.com');
      await user.type(inputs[3], '+971501234567');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password456');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      );

      const inputs = screen.getAllByRole('textbox');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');

      await user.type(inputs[0], 'Ahmed');
      await user.type(inputs[1], 'Hassan');
      await user.type(inputs[2], 'test@example.com');
      await user.type(inputs[3], '+971501234567');
      await user.type(passwordInputs[0], '123');
      await user.type(passwordInputs[1], '123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between signup and login tabs', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      );

      // Check signup is visible
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();

      // Click login tab
      const loginTab = screen.getByRole('button', { name: /log in/i });
      await user.click(loginTab);

      // Check login form is visible
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });
    });
  });

  describe('OAuth Login Buttons', () => {
    it('should render Google and Facebook login buttons', () => {
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      );

      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
    });
  });

  describe('Back Button Functionality', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      );

      const backButton = screen.getByRole('button', { name: /back to home/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Bilingual Support', () => {
    it('should display Arabic text', () => {
      renderWithProviders(
        <AuthPage onSuccess={mockOnSuccess} onBack={mockOnBack} />
      );

      // Check for Arabic text
      expect(screen.getByText(/واصل/)).toBeInTheDocument();
    });
  });
});
