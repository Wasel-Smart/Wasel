/**
 * System Health Monitor - Production Ready
 */

import { supabase } from '../utils/supabase/client';
import { dbOptimizer } from './dbOptimizer';
import { checkIntegrationStatus } from '../services/integrations';

interface HealthMetrics {
  database: boolean;
  authentication: boolean;
  integrations: { [key: string]: boolean };
  performance: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
  };
  timestamp: string;
}

class SystemMonitor {
  private metrics: HealthMetrics[] = [];
  private alertThresholds = {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    memoryUsage: 0.8 // 80%
  };

  async performHealthCheck(): Promise<HealthMetrics> {
    const startTime = Date.now();
    
    const [dbHealth, authHealth, integrationHealth] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkAuthHealth(),
      this.checkIntegrationHealth()
    ]);

    const responseTime = Date.now() - startTime;
    
    const metrics: HealthMetrics = {
      database: dbHealth.status === 'fulfilled' && dbHealth.value,
      authentication: authHealth.status === 'fulfilled' && authHealth.value,
      integrations: integrationHealth.status === 'fulfilled' ? integrationHealth.value : {},
      performance: {
        responseTime,
        memoryUsage: this.getMemoryUsage(),
        errorRate: this.calculateErrorRate()
      },
      timestamp: new Date().toISOString()
    };

    this.metrics.push(metrics);
    this.checkAlerts(metrics);
    
    return metrics;
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    return await dbOptimizer.healthCheck();
  }

  private async checkAuthHealth(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.getSession();
      return !error;
    } catch {
      return false;
    }
  }

  private async checkIntegrationHealth(): Promise<{ [key: string]: boolean }> {
    return checkIntegrationStatus();
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0;
  }

  private calculateErrorRate(): number {
    const recentMetrics = this.metrics.slice(-10);
    if (recentMetrics.length === 0) return 0;
    
    const errors = recentMetrics.filter(m => 
      !m.database || !m.authentication || m.performance.responseTime > this.alertThresholds.responseTime
    ).length;
    
    return errors / recentMetrics.length;
  }

  private checkAlerts(metrics: HealthMetrics): void {
    const alerts: string[] = [];
    
    if (!metrics.database) alerts.push('Database connection failed');
    if (!metrics.authentication) alerts.push('Authentication service down');
    if (metrics.performance.responseTime > this.alertThresholds.responseTime) {
      alerts.push(`High response time: ${metrics.performance.responseTime}ms`);
    }
    if (metrics.performance.errorRate > this.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${(metrics.performance.errorRate * 100).toFixed(1)}%`);
    }
    
    if (alerts.length > 0) {
      console.warn('SYSTEM ALERTS:', alerts);
      this.sendAlerts(alerts);
    }
  }

  private async sendAlerts(alerts: string[]): Promise<void> {
    // In production, send to monitoring service
    console.error('System alerts triggered:', alerts);
  }

  getHealthSummary(): {
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    issues: string[];
  } {
    const recent = this.metrics.slice(-5);
    if (recent.length === 0) return { status: 'critical', uptime: 0, issues: ['No metrics available'] };
    
    const healthyCount = recent.filter(m => m.database && m.authentication).length;
    const uptime = healthyCount / recent.length;
    
    const issues: string[] = [];
    const latest = recent[recent.length - 1];
    
    if (!latest.database) issues.push('Database issues');
    if (!latest.authentication) issues.push('Auth issues');
    if (latest.performance.responseTime > this.alertThresholds.responseTime) issues.push('Performance issues');
    
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (uptime < 0.8) status = 'critical';
    else if (uptime < 0.95 || issues.length > 0) status = 'degraded';
    
    return { status, uptime, issues };
  }
}

export const systemMonitor = new SystemMonitor();