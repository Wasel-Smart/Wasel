import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { FindRide } from '../../components/FindRide';

describe('FindRide Component', () => {
  it('should render ride booking form', () => {
    renderWithProviders(<FindRide />);
    expect(screen.getByText(/from|pickup/i) || screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should have destination input', () => {
    renderWithProviders(<FindRide />);
    expect(screen.getByText(/to|destination/i) || screen.getAllByRole('textbox')[1]).toBeInTheDocument();
  });

  it('should support bilingual interface', () => {
    renderWithProviders(<FindRide />, { language: 'ar' });
    expect(document.documentElement.dir).toBe('rtl');
  });
});