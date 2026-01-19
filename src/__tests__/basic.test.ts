import { describe, it, expect } from 'vitest';

describe('Wassel Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle strings', () => {
    expect('hello').toBe('hello');
  });

  it('should handle booleans', () => {
    expect(true).toBe(true);
  });
});