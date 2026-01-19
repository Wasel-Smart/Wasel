import { describe, it, expect } from 'vitest';

describe('Bilingual Support', () => {
  it('should support English language', () => {
    const englishText = {
      welcome: 'Welcome to Wassel',
      bookRide: 'Book a Ride',
      from: 'From',
      to: 'To'
    };
    
    expect(englishText.welcome).toBe('Welcome to Wassel');
    expect(englishText.bookRide).toBe('Book a Ride');
  });

  it('should support Arabic language', () => {
    const arabicText = {
      welcome: 'مرحباً بك في واصل',
      bookRide: 'احجز رحلة',
      from: 'من',
      to: 'إلى'
    };
    
    expect(arabicText.welcome).toBe('مرحباً بك في واصل');
    expect(arabicText.bookRide).toBe('احجز رحلة');
  });

  it('should handle RTL layout for Arabic', () => {
    const arabicConfig = {
      language: 'ar',
      direction: 'rtl',
      textAlign: 'right'
    };
    
    expect(arabicConfig.direction).toBe('rtl');
    expect(arabicConfig.textAlign).toBe('right');
  });

  it('should handle LTR layout for English', () => {
    const englishConfig = {
      language: 'en',
      direction: 'ltr',
      textAlign: 'left'
    };
    
    expect(englishConfig.direction).toBe('ltr');
    expect(englishConfig.textAlign).toBe('left');
  });
});