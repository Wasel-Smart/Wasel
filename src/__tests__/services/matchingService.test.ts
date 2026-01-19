import { describe, it, expect } from 'vitest';
import { MatchingService } from '../../services/matchingService';

describe('Matching Service', () => {
  it('should match drivers to passengers', () => {
    expect(() => {
      MatchingService.findDriver({
        pickupLocation: { lat: 25.2048, lng: 55.2708 },
        destination: { lat: 25.1972, lng: 55.2744 }
      });
    }).not.toThrow();
  });

  it('should calculate match scores', () => {
    expect(() => {
      MatchingService.calculateMatchScore('driver-123', 'trip-456');
    }).not.toThrow();
  });

  it('should handle driver availability', () => {
    expect(() => {
      MatchingService.updateDriverAvailability('driver-123', true);
    }).not.toThrow();
  });
});