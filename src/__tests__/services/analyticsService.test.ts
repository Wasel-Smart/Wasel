import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '../../services/analyticsService';

describe('Analytics Service', () => {
  it('should track events', () => {
    expect(() => {
      AnalyticsService.track('test_event', { property: 'value' });
    }).not.toThrow();
  });

  it('should identify users', () => {
    expect(() => {
      AnalyticsService.identify('user-123', { name: 'Test User' });
    }).not.toThrow();
  });

  it('should handle page views', () => {
    expect(() => {
      AnalyticsService.page('Dashboard');
    }).not.toThrow();
  });
});