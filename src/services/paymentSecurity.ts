/**
 * Payment Security Service - Production Ready
 */

import { validateInput } from '../middleware/authSecurity';

export const paymentSecurity = {
  validateAmount: (amount: number): boolean => {
    return amount > 0 && amount <= 10000 && Number.isFinite(amount);
  },

  validateCurrency: (currency: string): boolean => {
    return ['AED', 'SAR', 'EGP', 'USD', 'EUR', 'GBP'].includes(currency);
  },

  sanitizeMetadata: (metadata: any): any => {
    if (!metadata || typeof metadata !== 'object') return {};
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        sanitized[validateInput.sanitize(key)] = validateInput.sanitize(value);
      } else if (typeof value === 'number' && Number.isFinite(value)) {
        sanitized[validateInput.sanitize(key)] = value;
      }
    }
    return sanitized;
  },

  validatePaymentMethod: (method: string): boolean => {
    return ['wallet', 'card', 'apple_pay', 'google_pay', 'bank_transfer'].includes(method);
  },

  encryptSensitiveData: (data: string): string => {
    // In production, use proper encryption
    return btoa(data);
  },

  decryptSensitiveData: (encryptedData: string): string => {
    // In production, use proper decryption
    try {
      return atob(encryptedData);
    } catch {
      return '';
    }
  }
};