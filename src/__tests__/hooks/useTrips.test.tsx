import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTrips } from '../../hooks/useTrips';

describe('useTrips Hook', () => {
  it('should initialize with empty trips', () => {
    const { result } = renderHook(() => useTrips());
    expect(result.current.trips).toEqual([]);
  });

  it('should provide trip management functions', () => {
    const { result } = renderHook(() => useTrips());
    expect(typeof result.current.createTrip).toBe('function');
    expect(typeof result.current.updateTrip).toBe('function');
    expect(typeof result.current.cancelTrip).toBe('function');
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useTrips());
    expect(typeof result.current.loading).toBe('boolean');
  });
});