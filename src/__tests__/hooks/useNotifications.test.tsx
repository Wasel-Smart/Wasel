import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotifications } from '../../hooks/useNotifications';

describe('useNotifications Hook', () => {
  it('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toEqual([]);
  });

  it('should provide notification functions', () => {
    const { result } = renderHook(() => useNotifications());
    expect(typeof result.current.addNotification).toBe('function');
    expect(typeof result.current.removeNotification).toBe('function');
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useNotifications());
    expect(typeof result.current.loading).toBe('boolean');
  });
});