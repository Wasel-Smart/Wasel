/**
 * Production Readiness Validator
 */

import { systemMonitor } from './systemMonitor';
import { checkIntegrationStatus } from '../services/integrations';
import { dbOptimizer } from './dbOptimizer';

interface ValidationResult {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

class ProductionValidator {
  async validateSystem(): Promise<{
    ready: boolean;
    score: number;
    results: ValidationResult[];
    blockers: string[];
  }> {
    const results: ValidationResult[] = [];
    
    // Environment validation
    results.push(...await this.validateEnvironment());
    
    // Database validation
    results.push(...await this.validateDatabase());
    
    // Security validation
    results.push(...await this.validateSecurity());
    
    // Integration validation
    results.push(...await this.validateIntegrations());
    
    // Performance validation
    results.push(...await this.validatePerformance());
    
    const passed = results.filter(r => r.status === 'pass').length;
    const score = Math.round((passed / results.length) * 100);
    const blockers = results.filter(r => r.status === 'fail' && r.critical).map(r => r.message);
    
    return {
      ready: blockers.length === 0 && score >= 85,
      score,
      results,
      blockers
    };
  }

  private async validateEnvironment(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Check required environment variables
    const requiredEnvVars = [
      'VITE_SUPABASE_PROJECT_ID',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_GOOGLE_MAPS_API_KEY',
      'VITE_STRIPE_PUBLISHABLE_KEY'
    ];
    
    for (const envVar of requiredEnvVars) {
      const value = import.meta.env[envVar];
      results.push({
        category: 'Environment',
        status: value ? 'pass' : 'fail',
        message: `${envVar} ${value ? 'configured' : 'missing'}`,
        critical: true
      });
    }
    
    return results;
  }

  private async validateDatabase(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    try {
      const isHealthy = await dbOptimizer.healthCheck();
      results.push({
        category: 'Database',
        status: isHealthy ? 'pass' : 'fail',
        message: `Database connection ${isHealthy ? 'healthy' : 'failed'}`,
        critical: true
      });
    } catch (error) {
      results.push({
        category: 'Database',
        status: 'fail',
        message: 'Database validation failed',
        critical: true
      });
    }
    
    return results;
  }

  private async validateSecurity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Check for hardcoded credentials
    const hasHardcodedCreds = !import.meta.env.VITE_SUPABASE_PROJECT_ID || 
                             import.meta.env.VITE_SUPABASE_PROJECT_ID.includes('localhost');
    
    results.push({
      category: 'Security',
      status: hasHardcodedCreds ? 'fail' : 'pass',
      message: hasHardcodedCreds ? 'Hardcoded credentials detected' : 'No hardcoded credentials',
      critical: true
    });
    
    // Check HTTPS
    const isHTTPS = window.location.protocol === 'https:';
    results.push({
      category: 'Security',
      status: isHTTPS ? 'pass' : 'warning',
      message: `Using ${window.location.protocol}`,
      critical: false
    });
    
    return results;
  }

  private async validateIntegrations(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const integrations = checkIntegrationStatus();
    
    for (const [name, enabled] of Object.entries(integrations)) {
      const critical = ['stripe', 'googleMaps'].includes(name);
      results.push({
        category: 'Integrations',
        status: enabled ? 'pass' : critical ? 'fail' : 'warning',
        message: `${name} ${enabled ? 'enabled' : 'disabled'}`,
        critical
      });
    }
    
    return results;
  }

  private async validatePerformance(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    try {
      const health = await systemMonitor.performHealthCheck();
      
      results.push({
        category: 'Performance',
        status: health.performance.responseTime < 2000 ? 'pass' : 'warning',
        message: `Response time: ${health.performance.responseTime}ms`,
        critical: false
      });
      
      results.push({
        category: 'Performance',
        status: health.performance.errorRate < 0.05 ? 'pass' : 'warning',
        message: `Error rate: ${(health.performance.errorRate * 100).toFixed(1)}%`,
        critical: false
      });
      
    } catch (error) {
      results.push({
        category: 'Performance',
        status: 'warning',
        message: 'Performance validation failed',
        critical: false
      });
    }
    
    return results;
  }
}

export const productionValidator = new ProductionValidator();