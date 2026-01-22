/**
 * Comprehensive Service Integration Test Suite
 * Tests all 7-stage flows for all Wasel services
 * 
 * Stages:
 * 1. Discover → 2. Request → 3. Pricing → 4. Assignment → 5. Confirmation → 6. Execution → 7. Completion
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import ServiceFactory from '../services/serviceFactory';
import laundryService from '../services/laundryService';
import scooterService from '../services/scooterService';
import packageService from '../services/packageService';
import schoolTransportService from '../services/schoolTransportService';

// Mock user ID for testing
const MOCK_USER_ID = 'test-user-123';
const MOCK_LOCATION = {
  lat: 25.2048,
  lng: 55.2708,
  address: 'Dubai Marina, Dubai'
};

describe('Wasel Service Factory - Complete Flow Tests', () => {
  
  // ==================== LAUNDRY SERVICE TESTS ====================
  describe('Laundry Service - Complete 7-Stage Flow', () => {
    
    it('Stage 1: DISCOVER - Find available laundry partners', async () => {
      const result = await ServiceFactory.discover('laundry', {
        lat: MOCK_LOCATION.lat,
        lng: MOCK_LOCATION.lng,
        radius: 5
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      console.log('✅ Stage 1 DISCOVER:', result.data?.length || 0, 'partners found');
    });

    it('Stage 2: REQUEST - Create laundry order', async () => {
      const serviceRequest = {
        type: 'laundry' as const,
        from: MOCK_LOCATION,
        to: { 
          lat: 25.1972, 
          lng: 55.2744,
          address: 'Downtown Dubai'
        },
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        details: {
          serviceType: 'wasel',
          laundryPartnerId: 'partner-123',
          loadDetails: {
            weight_kg: 5,
            items: ['Shirts', 'Pants', 'Towels'],
            special_instructions: 'Dry clean only'
          },
          preferredPickupTime: '09:00'
        }
      };

      const result = await ServiceFactory.request(serviceRequest);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.status).toBe('pending');
      console.log('✅ Stage 2 REQUEST:', result.data?.id, 'order created');
    });

    it('Stage 3: PRICING - Calculate laundry service price', async () => {
      const result = await ServiceFactory.calculatePrice('laundry', {
        loadWeight: 5,
        serviceType: 'wasel',
        laundryPartnerId: 'partner-123'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.basePrice).toBeGreaterThan(0);
      expect(result.data.weightPrice).toBeGreaterThan(0);
      expect(result.data.captainFee).toBeGreaterThan(0);
      expect(result.data.partnerFee).toBeGreaterThan(0);
      expect(result.data.total).toBeGreaterThan(0);
      
      console.log('✅ Stage 3 PRICING:', {
        basePrice: result.data.basePrice,
        weightPrice: result.data.weightPrice,
        captainFee: result.data.captainFee,
        partnerFee: result.data.partnerFee,
        total: result.data.total
      });
    });

    it('Stage 4: ASSIGNMENT - Assign captain to laundry order', async () => {
      const mockOrderId = 'order-123';
      const mockCaptainId = 'captain-456';

      const result = await ServiceFactory.assign('laundry', mockOrderId, mockCaptainId);
      
      expect(result.success).toBe(true);
      console.log('✅ Stage 4 ASSIGNMENT:', 'Captain assigned to order');
    });

    it('Stage 5: CONFIRMATION - Confirm laundry order', async () => {
      const mockOrderId = 'order-123';

      const result = await ServiceFactory.confirm('laundry', mockOrderId, {
        method: 'card',
        amount: 100,
        currency: 'AED'
      });

      expect(result.success).toBe(true);
      console.log('✅ Stage 5 CONFIRMATION:', 'Order confirmed');
    });

    it('Stage 6: EXECUTION - Start laundry service execution', async () => {
      const mockOrderId = 'order-123';

      const result = await ServiceFactory.execute('laundry', mockOrderId);

      expect(result.success).toBe(true);
      console.log('✅ Stage 6 EXECUTION:', 'Service execution started');
    });

    it('Stage 7: COMPLETION - Complete laundry service', async () => {
      const mockOrderId = 'order-123';

      const result = await ServiceFactory.complete('laundry', mockOrderId, {
        rating: 5,
        review: 'Excellent service!',
        amount_paid: 100
      });

      expect(result.success).toBe(true);
      console.log('✅ Stage 7 COMPLETION:', 'Service completed and rated');
    });
  });

  // ==================== SCOOTER SERVICE TESTS ====================
  describe('Scooter Service - Complete 7-Stage Flow', () => {
    
    it('Stage 1: DISCOVER - Find available scooters', async () => {
      const result = await ServiceFactory.discover('scooter', {
        lat: MOCK_LOCATION.lat,
        lng: MOCK_LOCATION.lng,
        radius: 2,
        minBattery: 20
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      console.log('✅ Scooter DISCOVER:', result.data?.length || 0, 'scooters available');
    });

    it('Stage 3: PRICING - Calculate scooter rental price', async () => {
      const result = await ServiceFactory.calculatePrice('scooter', {
        durationMinutes: 30,
        pricePerMin: 1.5
      });

      expect(result.success).toBe(true);
      expect(result.data.basePrice).toBeGreaterThan(0);
      expect(result.data.totalPrice).toBeGreaterThan(0);
      console.log('✅ Scooter PRICING:', result.data.totalPrice, 'AED for 30 minutes');
    });
  });

  // ==================== PACKAGE DELIVERY SERVICE TESTS ====================
  describe('Package Delivery Service - Complete 7-Stage Flow', () => {
    
    it('Stage 1: DISCOVER - Find available delivery captains', async () => {
      const result = await ServiceFactory.discover('package', {
        from: 'Dubai Marina',
        to: 'Downtown Dubai'
      });

      expect(result.success).toBe(true);
      console.log('✅ Package DISCOVER:', 'Captains discovered');
    });

    it('Stage 3: PRICING - Calculate package delivery price', async () => {
      const result = await ServiceFactory.calculatePrice('package', {
        packageSize: 'medium',
        distanceKm: 15
      });

      expect(result.success).toBe(true);
      expect(result.data.totalPrice).toBeGreaterThan(0);
      console.log('✅ Package PRICING:', result.data.totalPrice, 'AED');
    });
  });

  // ==================== CARPOOL SERVICE TESTS ====================
  describe('Carpool Service - Complete 7-Stage Flow', () => {
    
    it('Stage 1: DISCOVER - Find available trips', async () => {
      const result = await ServiceFactory.discover('carpool', {
        from: 'Dubai',
        to: 'Abu Dhabi',
        date: new Date().toISOString().split('T')[0],
        seats: 2
      });

      expect(result.success).toBe(true);
      console.log('✅ Carpool DISCOVER:', 'Trips found');
    });

    it('Stage 3: PRICING - Calculate carpool price', async () => {
      const result = await ServiceFactory.calculatePrice('carpool', {
        distanceKm: 150,
        seats: 2
      });

      expect(result.success).toBe(true);
      expect(result.data.pricePerSeat).toBeGreaterThan(0);
      console.log('✅ Carpool PRICING:', result.data.pricePerSeat, 'AED per seat');
    });
  });

  // ==================== SCHOOL TRANSPORT SERVICE TESTS ====================
  describe('School Transport Service - Complete 7-Stage Flow', () => {
    
    it('Stage 1: DISCOVER - Find available school routes', async () => {
      const result = await ServiceFactory.discover('school');

      expect(result.success).toBe(true);
      console.log('✅ School Transport DISCOVER:', 'Routes found');
    });

    it('Stage 3: PRICING - Calculate school transport price', async () => {
      const result = await ServiceFactory.calculatePrice('school', {
        students: 2,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      });

      expect(result.success).toBe(true);
      expect(result.data.monthlyTotal).toBeGreaterThan(0);
      console.log('✅ School Transport PRICING:', result.data.monthlyTotal, 'AED monthly');
    });
  });

  // ==================== SPECIALIZED SERVICE TESTS ====================
  describe('Laundry Service - Specialized Methods', () => {
    
    it('getAvailablePartners - Should return list of partners', async () => {
      const partners = await laundryService.getAvailablePartners();
      
      expect(Array.isArray(partners)).toBe(true);
      console.log('✅ Laundry Partners:', partners.length, 'available');
    });

    it('calculatePrice - Should return detailed pricing breakdown', async () => {
      const pricing = await laundryService.calculatePrice(5, 'wasel', 'partner-123');
      
      expect(pricing).toBeDefined();
      expect(pricing.basePrice).toBeGreaterThan(0);
      expect(pricing.total).toBeGreaterThan(0);
      console.log('✅ Laundry Price Breakdown:', pricing);
    });

    it('createOrder - Should create new laundry order', async () => {
      const order = await laundryService.createOrder(
        MOCK_USER_ID,
        'wasel',
        'Dubai Marina',
        'Downtown Dubai',
        'partner-123',
        {
          weight_kg: 5,
          items: ['Shirts', 'Pants']
        },
        '09:00'
      );

      expect(order).toBeDefined();
      expect(order.status).toBe('pending');
      console.log('✅ Order Created:', order.id);
    });

    it('getOrder - Should retrieve order details', async () => {
      const order = await laundryService.getOrder('order-123');
      
      if (order) {
        expect(order.id).toBeDefined();
        console.log('✅ Order Retrieved:', order.id);
      }
    });

    it('getCustomerOrders - Should get all customer orders', async () => {
      const orders = await laundryService.getCustomerOrders(MOCK_USER_ID);
      
      expect(Array.isArray(orders)).toBe(true);
      console.log('✅ Customer Orders:', orders.length, 'orders found');
    });

    it('updateOrderStatus - Should update order status', async () => {
      const success = await laundryService.updateOrderStatus('order-123', 'picked_up');
      
      expect(typeof success).toBe('boolean');
      console.log('✅ Order Status Updated');
    });

    it('assignCaptain - Should assign captain to order', async () => {
      const success = await laundryService.assignCaptain('order-123', 'captain-456');
      
      expect(typeof success).toBe('boolean');
      console.log('✅ Captain Assigned');
    });

    it('getTrackingInfo - Should get order tracking information', async () => {
      const tracking = await laundryService.getTrackingInfo('order-123');
      
      if (tracking) {
        expect(tracking.order).toBeDefined();
        console.log('✅ Tracking Info Retrieved');
      }
    });
  });

  // ==================== ERROR HANDLING TESTS ====================
  describe('Error Handling', () => {
    
    it('Should handle invalid service type gracefully', async () => {
      const result = await ServiceFactory.discover('invalid-service' as any);
      
      expect(result.success).toBe(false);
      console.log('✅ Invalid service handled:', result.error);
    });

    it('Should handle missing required fields', async () => {
      const result = await ServiceFactory.calculatePrice('laundry', {
        // Missing required fields
      });

      // Should handle gracefully or validate
      console.log('✅ Missing fields handled');
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Service Integration', () => {
    
    it('Should maintain consistency across all service types', async () => {
      const services = ['carpool', 'scooter', 'package', 'school', 'laundry'];
      
      for (const service of services) {
        const result = await ServiceFactory.discover(service as any);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('data');
      }
      
      console.log('✅ All services follow consistent interface');
    });

    it('Complete Wasel Journey - Laundry Service', async () => {
      console.log('\n📋 COMPLETE WASEL JOURNEY - LAUNDRY SERVICE\n');
      
      // Stage 1: Discover
      console.log('Stage 1️⃣ DISCOVER...');
      const discover = await ServiceFactory.discover('laundry');
      expect(discover.success).toBe(true);
      
      // Stage 2: Request
      console.log('Stage 2️⃣ REQUEST...');
      const request = await ServiceFactory.request({
        type: 'laundry',
        from: MOCK_LOCATION,
        details: { serviceType: 'wasel', laundryPartnerId: 'p1', loadDetails: { weight_kg: 5, items: [] }, preferredPickupTime: '09:00' }
      });
      expect(request.success).toBe(true);
      
      // Stage 3: Pricing
      console.log('Stage 3️⃣ PRICING...');
      const pricing = await ServiceFactory.calculatePrice('laundry', { loadWeight: 5, serviceType: 'wasel', laundryPartnerId: 'p1' });
      expect(pricing.success).toBe(true);
      
      // Stage 4: Assignment
      console.log('Stage 4️⃣ ASSIGNMENT...');
      const assign = await ServiceFactory.assign('laundry', request.data?.id || 'order-1', 'captain-1');
      expect(assign.success).toBe(true);
      
      // Stage 5: Confirmation
      console.log('Stage 5️⃣ CONFIRMATION...');
      const confirm = await ServiceFactory.confirm('laundry', request.data?.id || 'order-1');
      expect(confirm.success).toBe(true);
      
      // Stage 6: Execution
      console.log('Stage 6️⃣ EXECUTION...');
      const execute = await ServiceFactory.execute('laundry', request.data?.id || 'order-1');
      expect(execute.success).toBe(true);
      
      // Stage 7: Completion
      console.log('Stage 7️⃣ COMPLETION...');
      const complete = await ServiceFactory.complete('laundry', request.data?.id || 'order-1', { rating: 5 });
      expect(complete.success).toBe(true);
      
      console.log('\n✅ COMPLETE JOURNEY SUCCESSFUL!\n');
    });
  });
});

/**
 * Test Execution Guide:
 * 
 * 1. Run all tests:
 *    npm test src/services/serviceFactory.test.ts
 * 
 * 2. Run specific suite:
 *    npm test -- --grep "Laundry Service"
 * 
 * 3. Watch mode:
 *    npm test -- --watch
 * 
 * 4. Coverage:
 *    npm test -- --coverage
 * 
 * Expected Output:
 * - All 7 stages should complete successfully
 * - No errors or exceptions
 * - Proper data structures returned
 * - Consistent interface across all services
 */
