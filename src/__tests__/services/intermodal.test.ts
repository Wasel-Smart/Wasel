import { describe, it, expect } from 'vitest';
import { IntermodalService } from '../../services/intermodalService';

describe('Intermodal Service', () => {
  it('should plan multimodal routes', () => {
    expect(() => {
      IntermodalService.planRoute({
        from: { lat: 25.2048, lng: 55.2708 },
        to: { lat: 25.1972, lng: 55.2744 }
      });
    }).not.toThrow();
  });

  it('should get transport options', () => {
    expect(() => {
      IntermodalService.getTransportOptions();
    }).not.toThrow();
  });

  it('should calculate combined fares', () => {
    expect(() => {
      IntermodalService.calculateFare(['taxi', 'metro']);
    }).not.toThrow();
  });
});