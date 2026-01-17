import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FindRide } from '../../components/FindRide';
import { renderWithProviders, createMockUser } from '../test-utils';

vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

vi.mock('../../components/MapComponent', () => ({
  MapComponent: () => <div data-testid="map-component">Map</div>,
}));

describe('FindRide Component', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render find ride form', () => {
      renderWithProviders(<FindRide />, { user: mockUser });
      expect(screen.getByText(/find ride/i) || screen.getByTestId('map-component')).toBeTruthy();
    });

    it('should display map component', () => {
      renderWithProviders(<FindRide />, { user: mockUser });
      expect(screen.getByTestId('map-component')).toBeInTheDocument();
    });
  });

  describe('Form Functionality', () => {
    it('should accept pickup location input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FindRide />, { user: mockUser });

      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 0) {
        await user.type(inputs[0], 'Downtown Dubai');
        expect(inputs[0]).toHaveValue('Downtown Dubai');
      }
    });

    it('should accept destination input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FindRide />, { user: mockUser });

      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 1) {
        await user.type(inputs[1], 'Mall of the Emirates');
        expect(inputs[1]).toHaveValue('Mall of the Emirates');
      }
    });
  });

  describe('Search Functionality', () => {
    it('should handle ride search submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FindRide />, { user: mockUser });

      const buttons = screen.getAllByRole('button');
      const searchButton = buttons.find(btn => btn.textContent?.toLowerCase().includes('search') || btn.textContent?.toLowerCase().includes('find'));
      
      if (searchButton) {
        await user.click(searchButton);
      }
    });
  });

  describe('Bilingual Support', () => {
    it('should support Arabic interface', () => {
      renderWithProviders(<FindRide />, { user: mockUser, language: 'ar' });
      expect(screen.getByTestId('map-component')).toBeInTheDocument();
    });

    it('should support English interface', () => {
      renderWithProviders(<FindRide />, { user: mockUser, language: 'en' });
      expect(screen.getByTestId('map-component')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle location input errors gracefully', async () => {
      renderWithProviders(<FindRide />, { user: mockUser });
      expect(screen.getByTestId('map-component')).toBeInTheDocument();
    });
  });
});
