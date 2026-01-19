import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithProviders, createMockUser } from '../test-utils';
import { Dashboard } from '../../components/Dashboard';

describe('Dashboard Component', () => {
  it('should render dashboard for authenticated user', () => {
    const mockUser = createMockUser();
    renderWithProviders(<Dashboard />, { user: mockUser });
    expect(screen.getByText(/dashboard|welcome/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    renderWithProviders(<Dashboard />, { loading: true });
    expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should handle unauthenticated state', () => {
    renderWithProviders(<Dashboard />, { user: null });
    expect(screen.getByText(/sign in|login/i) || screen.getByRole('button')).toBeInTheDocument();
  });
});