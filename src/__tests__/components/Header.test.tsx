import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithProviders, createMockUser } from '../test-utils';
import { Header } from '../../components/Header';

describe('Header Component', () => {
  it('should render header with logo', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText(/wassel/i) || screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should show user menu when authenticated', () => {
    const mockUser = createMockUser();
    renderWithProviders(<Header />, { user: mockUser });
    expect(screen.getByText(mockUser.email) || screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show sign in button when not authenticated', () => {
    renderWithProviders(<Header />, { user: null });
    expect(screen.getByText(/sign in|login/i) || screen.getByRole('button')).toBeInTheDocument();
  });
});