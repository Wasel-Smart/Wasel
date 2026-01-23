#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Ensures all required variables are present and valid
 */

const fs = require('fs');
const path = require('path');

// Color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// COMPROMISED KEYS - These must NEVER be used
// Note: These are example patterns for detection, not actual credentials
const COMPROMISED_KEY_PATTERNS = [
  /^WlYJmK-[A-Za-z0-9_-]{30,}$/,
  /^7_fGWjK9c8[A-Za-z0-9_-]{20,}$/,
  /^AIzaSyBWqXeMJ-[A-Za-z0-9_-]{20,}$/,
  /^pk_test_51SZmpKEN[A-Za-z0-9_-]{20,}$/,
  /^sk_test_51SZmpKEN[A-Za-z0-9_-]{20,}$/,
  /^5005d351cb6bee[A-Za-z0-9]{10,}$/,
  /^LCnyYDzwgp4n[A-Za-z0-9_-]{10,}$/,
];

const REQUIRED_VARS = {
  frontend: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_GOOGLE_MAPS_API_KEY'],
  backend: ['SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET', 'SESSION_SECRET'],
};

const PATTERNS = {
  VITE_SUPABASE_URL: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
  VITE_SUPABASE_ANON_KEY: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  SUPABASE_SERVICE_ROLE_KEY: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  VITE_GOOGLE_MAPS_API_KEY: /^AIza[A-Za-z0-9_-]{35}$/,
  JWT_SECRET: /.{32,}/,
  SESSION_SECRET: /.{32,}/,
};

function log(msg, color = RESET) { console.log(`${color}${msg}${RESET}`); }

function validateEnvFile(filePath, requiredVars) {
  log(`\n📋 Validating ${path.basename(filePath)}...`, BLUE);

  if (!fs.existsSync(filePath)) {
    log(`⚠️  File not found: ${filePath}`, YELLOW);
    return false;
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) envVars[match[1]] = match[2].trim();
  });

  let isValid = true;
  const errors = [];
  const warnings = [];
  const criticalErrors = [];

  // Check for compromised key patterns
  Object.entries(envVars).forEach(([key, value]) => {
    if (COMPROMISED_KEY_PATTERNS.some(pattern => value && pattern.test(value))) {
      criticalErrors.push(`🚨 COMPROMISED PATTERN: ${key} - ROTATE NOW!`);
      isValid = false;
    }
  });

  // Check required variables
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (!value) {
      errors.push(`Missing: ${varName}`);
      isValid = false;
    } else if (value.includes('placeholder') || value.includes('your-')) {
      warnings.push(`Placeholder: ${varName}`);
    } else if (PATTERNS[varName] && !PATTERNS[varName].test(value)) {
      errors.push(`Invalid format: ${varName}`);
      isValid = false;
    }
  });

  // Check for backend secrets in frontend
  Object.keys(envVars).forEach(key => {
    if (key.startsWith('VITE_') && (key.includes('SECRET') || key.includes('SERVICE_ROLE'))) {
      criticalErrors.push(`🚨 Backend secret in frontend: ${key}`);
      isValid = false;
    }
  });

  if (criticalErrors.length > 0) {
    log('\n🚨 CRITICAL ERRORS:', RED);
    criticalErrors.forEach(err => log(`  ${err}`, RED));
  }
  if (errors.length > 0) {
    log('\n❌ ERRORS:', RED);
    errors.forEach(err => log(`  • ${err}`, RED));
  }
  if (warnings.length > 0) {
    log('\n⚠️  WARNINGS:', YELLOW);
    warnings.forEach(warn => log(`  • ${warn}`, YELLOW));
  }
  if (isValid && warnings.length === 0) {
    log('✅ All checks passed!', GREEN);
  }

  return isValid;
}

// Main
log('🔒 Wasel Environment Validator', GREEN);
log('==============================\n');

const rootDir = path.join(__dirname, '..');
const frontendValid = validateEnvFile(path.join(rootDir, '.env'), REQUIRED_VARS.frontend);
const backendValid = validateEnvFile(path.join(rootDir, 'src', 'backend', '.env'), REQUIRED_VARS.backend);

if (frontendValid && backendValid) {
  log('\n✅ All environment files are valid!', GREEN);
  process.exit(0);
} else {
  log('\n❌ Environment validation failed!', RED);
  log('🔧 Fix errors and run: npm run validate:env', YELLOW);
  process.exit(1);
}
