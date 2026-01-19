import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { AuthPage } from '../../components/AuthPage';

describe('AuthPage Component', () => {
  it('should render without crashing', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display sign in form by default', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByText(/sign in|login/i)).toBeInTheDocument();
  });

  it('should support bilingual content', () => {
    renderWithProviders(<AuthPage />, { language: 'ar' });
    expect(document.documentElement.dir).toBe('rtl');
  });
});