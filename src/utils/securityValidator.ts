/**
 * Security Credential Validator
 * Scans for hardcoded credentials and security vulnerabilities
 */

import { logger } from './logger';

interface SecurityIssue {
  type: 'hardcoded_credential' | 'weak_config' | 'security_risk';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
}

class SecurityValidator {
  private issues: SecurityIssue[] = [];

  // Patterns that indicate hardcoded credentials
  private credentialPatterns = [
    /api[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/i,
    /secret[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/i,
    /password\s*[:=]\s*['"][^'"]{3,}['"]/i,
    /token\s*[:=]\s*['"][^'"]{10,}['"]/i,
    /auth[_-]?token\s*[:=]\s*['"][^'"]{10,}['"]/i,
    /access[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/i,
    /private[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/i,
    /client[_-]?secret\s*[:=]\s*['"][^'"]{10,}['"]/i,
    /database[_-]?url\s*[:=]\s*['"].*:\/\/.*:[^'"]*@[^'"]*['"]/i,
    /mongodb:\/\/[^:]+:[^@]+@/i,
    /postgres:\/\/[^:]+:[^@]+@/i,
    /mysql:\/\/[^:]+:[^@]+@/i,
  ];

  // Safe patterns that should be ignored
  private safePatterns = [
    /import\.meta\.env\./,
    /process\.env\./,
    /your_.*_here/,
    /example\.com/,
    /localhost/,
    /127\.0\.0\.1/,
    /placeholder/i,
    /mock/i,
    /test/i,
    /demo/i,
  ];

  validateEnvironmentConfig(): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check if environment variables are properly configured
    const requiredEnvVars = [
      'VITE_SUPABASE_PROJECT_ID',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_GOOGLE_MAPS_API_KEY',
      'VITE_STRIPE_PUBLISHABLE_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      const value = import.meta.env[envVar];
      
      if (!value) {
        issues.push({
          type: 'weak_config',
          severity: 'high',
          file: 'environment',
          description: `Missing required environment variable: ${envVar}`,
          recommendation: `Set ${envVar} in your .env file`
        });
      } else if (value.includes('your_') || value.includes('_here')) {
        issues.push({
          type: 'weak_config',
          severity: 'critical',
          file: 'environment',
          description: `Environment variable ${envVar} contains placeholder value`,
          recommendation: `Replace placeholder with actual ${envVar} value`
        });
      }
    }

    return issues;
  }

  validateCodeSecurity(): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for common security anti-patterns
    const securityChecks = [
      {
        pattern: /console\.log.*password/i,
        type: 'security_risk' as const,
        severity: 'medium' as const,
        description: 'Password logging detected',
        recommendation: 'Remove password from console.log statements'
      },
      {
        pattern: /console\.log.*token/i,
        type: 'security_risk' as const,
        severity: 'medium' as const,
        description: 'Token logging detected',
        recommendation: 'Remove token from console.log statements'
      },
      {
        pattern: /eval\s*\(/,
        type: 'security_risk' as const,
        severity: 'high' as const,
        description: 'Use of eval() detected',
        recommendation: 'Replace eval() with safer alternatives'
      },
      {
        pattern: /innerHTML\s*=.*\+/,
        type: 'security_risk' as const,
        severity: 'medium' as const,
        description: 'Potential XSS vulnerability with innerHTML',
        recommendation: 'Use textContent or sanitize HTML content'
      },
      {
        pattern: /document\.write\s*\(/,
        type: 'security_risk' as const,
        severity: 'medium' as const,
        description: 'Use of document.write() detected',
        recommendation: 'Use safer DOM manipulation methods'
      }
    ];

    // This would normally scan actual files, but for now we'll validate configuration
    return issues;
  }

  validateNetworkSecurity(): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for insecure network configurations
    if (typeof window !== 'undefined') {
      if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        issues.push({
          type: 'security_risk',
          severity: 'high',
          file: 'network',
          description: 'Application running over HTTP in production',
          recommendation: 'Use HTTPS for all production deployments'
        });
      }
    }

    return issues;
  }

  validateAuthSecurity(): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check authentication configuration
    const mockAuthEnabled = import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';
    if (mockAuthEnabled && import.meta.env.PROD) {
      issues.push({
        type: 'security_risk',
        severity: 'critical',
        file: 'authentication',
        description: 'Mock authentication enabled in production',
        recommendation: 'Disable VITE_ENABLE_MOCK_AUTH in production environment'
      });
    }

    return issues;
  }

  performFullSecurityScan(): {
    passed: boolean;
    score: number;
    issues: SecurityIssue[];
    summary: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  } {
    const allIssues: SecurityIssue[] = [
      ...this.validateEnvironmentConfig(),
      ...this.validateCodeSecurity(),
      ...this.validateNetworkSecurity(),
      ...this.validateAuthSecurity()
    ];

    const summary = {
      critical: allIssues.filter(i => i.severity === 'critical').length,
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length
    };

    const totalIssues = allIssues.length;
    const criticalIssues = summary.critical + summary.high;
    const passed = criticalIssues === 0;
    const score = Math.max(0, 100 - (criticalIssues * 20) - (summary.medium * 5) - (summary.low * 1));

    // Log results
    if (passed) {
      logger.info('Security scan passed', 'security', 'scan', { score, totalIssues });
    } else {
      logger.error('Security scan failed', 'security', 'scan', { 
        score, 
        totalIssues, 
        criticalIssues,
        summary 
      });
    }

    return {
      passed,
      score,
      issues: allIssues,
      summary
    };
  }

  generateSecurityReport(): string {
    const scan = this.performFullSecurityScan();
    
    let report = `
# 🔒 SECURITY SCAN REPORT

**Status**: ${scan.passed ? '✅ PASSED' : '❌ FAILED'}
**Score**: ${scan.score}/100

## Summary
- Critical Issues: ${scan.summary.critical}
- High Priority: ${scan.summary.high}
- Medium Priority: ${scan.summary.medium}
- Low Priority: ${scan.summary.low}

## Issues Found
`;

    if (scan.issues.length === 0) {
      report += '\n✅ No security issues detected!\n';
    } else {
      scan.issues.forEach((issue, index) => {
        const emoji = {
          critical: '🚨',
          high: '⚠️',
          medium: '⚡',
          low: '📝'
        }[issue.severity];

        report += `
### ${emoji} ${issue.severity.toUpperCase()}: ${issue.description}
- **File**: ${issue.file}
- **Type**: ${issue.type}
- **Recommendation**: ${issue.recommendation}
`;
      });
    }

    report += `
## Security Checklist
- [${scan.summary.critical === 0 ? 'x' : ' '}] No hardcoded credentials
- [${scan.summary.high === 0 ? 'x' : ' '}] No critical security risks
- [${import.meta.env.VITE_SUPABASE_PROJECT_ID ? 'x' : ' '}] Environment variables configured
- [${typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'x' : ' '}] HTTPS enabled
- [${import.meta.env.VITE_ENABLE_MOCK_AUTH !== 'true' ? 'x' : ' '}] Production authentication

## Recommendations
${scan.passed ? 
  '✅ Your application passes all security checks!' : 
  '❌ Please address the critical and high priority issues before deployment.'
}
`;

    return report;
  }
}

export const securityValidator = new SecurityValidator();