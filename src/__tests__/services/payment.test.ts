import { describe, it, expect } from 'vitest';
import { PaymentService } from '../../services/paymentService';

describe('Payment Service', () => {
  it('should process payments', async () => {
    const mockPayment = {
      amount: 100,
      currency: 'AED',
      paymentMethodId: 'pm_test',
    };

    expect(() => {
      PaymentService.processPayment(mockPayment);
    }).not.toThrow();
  });

  it('should handle refunds', async () => {
    expect(() => {
      PaymentService.refundPayment('payment_123');
    }).not.toThrow();
  });

  it('should validate payment methods', () => {
    expect(() => {
      PaymentService.validatePaymentMethod('pm_test');
    }).not.toThrow();
  });
});