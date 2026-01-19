/**
 * Configuration Validator
 */

import { logger } from './logger';

interface ConfigValidation {
  key: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url';
  minLength?: number;
  pattern?: RegExp;
}

const CONFIG_VALIDATIONS: ConfigValidation[] = [
  { key: 'VITE_SUPABASE_PROJECT_ID', required: true, type: 'string', minLength: 10 },
  { key: 'VITE_SUPABASE_ANON_KEY', required: true, type: 'string', minLength: 100 },
  { key: 'VITE_GOOGLE_MAPS_API_KEY', required: true, type: 'string', minLength: 20 },
  { key: 'VITE_STRIPE_PUBLISHABLE_KEY', required: true, type: 'string', pattern: /^pk_/ },
  { key: 'VITE_TWILIO_ACCOUNT_SID', required: false, type: 'string', pattern: /^AC/ },
  { key: 'VITE_SENDGRID_API_KEY', required: false, type: 'string', pattern: /^SG\./ },
  { key: 'VITE_FIREBASE_API_KEY', required: false, type: 'string', minLength: 20 },
  { key: 'VITE_FIREBASE_PROJECT_ID', required: false, type: 'string', minLength: 5 },
];

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export function validateConfiguration(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let validCount = 0;

  for (const validation of CONFIG_VALIDATIONS) {
    const value = import.meta.env[validation.key];
    
    if (!value) {
      if (validation.required) {
        errors.push(`Missing required environment variable: ${validation.key}`);
      } else {
        warnings.push(`Optional environment variable not set: ${validation.key}`);
      }
      continue;
    }

    // Type validation
    if (validation.type === 'string' && typeof value !== 'string') {
      errors.push(`${validation.key} must be a string`);
      continue;
    }

    // Length validation
    if (validation.minLength && value.length < validation.minLength) {
      errors.push(`${validation.key} is too short (minimum ${validation.minLength} characters)`);
      continue;
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(value)) {
      errors.push(`${validation.key} format is invalid`);
      continue;
    }

    validCount++;
  }

  const score = Math.round((validCount / CONFIG_VALIDATIONS.length) * 100);
  const valid = errors.length === 0;

  // Log results
  if (valid) {
    logger.info(`Configuration validation passed (${score}% complete)`, 'config', 'validate');
  } else {
    logger.error(`Configuration validation failed: ${errors.join(', ')}`, 'config', 'validate');
  }

  if (warnings.length > 0) {
    logger.warn(`Configuration warnings: ${warnings.join(', ')}`, 'config', 'validate');
  }

  return { valid, errors, warnings, score };
}