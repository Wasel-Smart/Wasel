import { describe, it, expect } from 'vitest';
import { HeroService } from '../../services/heroService';

describe('Hero Service', () => {
  it('should get hero content', () => {
    expect(() => {
      HeroService.getHeroContent();
    }).not.toThrow();
  });

  it('should handle hero animations', () => {
    expect(() => {
      HeroService.initializeAnimations();
    }).not.toThrow();
  });

  it('should manage hero state', () => {
    expect(() => {
      HeroService.updateHeroState({ visible: true });
    }).not.toThrow();
  });
});