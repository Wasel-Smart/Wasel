/**
 * Performance Monitoring Service
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  // Start timing an operation
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  // End timing and record metric
  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn('Timer not found', 'performance', 'endTimer', { name });
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    this.recordMetric(name, duration, tags);
    
    // Log slow operations
    if (duration > 2000) {
      logger.warn(`Slow operation detected: ${name}`, 'performance', 'slowOperation', {
        duration,
        tags
      });
    }

    return duration;
  }

  // Record a custom metric
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      timestamp: new Date().toISOString(),
      tags
    });

    // Keep only recent metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Get performance summary
  getSummary(): {
    averageResponseTime: number;
    slowOperations: number;
    totalOperations: number;
    memoryUsage?: number;
  } {
    const responseTimes = this.metrics
      .filter(m => m.name.includes('response') || m.name.includes('duration'))
      .map(m => m.value);

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    const slowOperations = responseTimes.filter(time => time > 2000).length;

    let memoryUsage: number | undefined;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }

    return {
      averageResponseTime: Math.round(averageResponseTime),
      slowOperations,
      totalOperations: responseTimes.length,
      memoryUsage
    };
  }

  // Monitor API call performance
  async monitorApiCall<T>(
    name: string,
    apiCall: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await apiCall();
      this.endTimer(name, { ...tags, status: 'success' });
      return result;
    } catch (error) {
      this.endTimer(name, { ...tags, status: 'error' });
      throw error;
    }
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
    this.timers.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();