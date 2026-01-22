#!/usr/bin/env node

/**
 * Wasel Application Connectivity Checker
 * Tests all critical connections and services
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const results = {
  timestamp: new Date().toISOString(),
  checks: {},
  summary: { passed: 0, failed: 0, warnings: 0 }
};

// Helper function to log results
function logResult(name, status, message, details = null) {
  results.checks[name] = { status, message, details };
  const icon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⚠';
  console.log(`${icon} ${name}: ${message}`);
  if (details) console.log(`  └─ ${details}`);
  
  if (status === 'pass') results.summary.passed++;
  else if (status === 'fail') results.summary.failed++;
  else results.summary.warnings++;
}

async function checkConnectivity() {
  console.log('\n🔍 WASEL CONNECTIVITY CHECK\n');
  console.log('=' .repeat(60));

  // 1. Check Environment Variables
  console.log('\n1️⃣  ENVIRONMENT VARIABLES');
  console.log('-'.repeat(60));

  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      const masked = value.length > 20 ? value.substring(0, 20) + '...' : value;
      logResult(envVar, 'pass', `Configured`, masked);
    } else {
      logResult(envVar, 'fail', `Missing`);
    }
  }

  // 2. Check Supabase Connection
  console.log('\n2️⃣  SUPABASE CONNECTION');
  console.log('-'.repeat(60));

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('COUNT(*)')
        .limit(1);

      if (!error) {
        logResult('Supabase Database', 'pass', 'Connected successfully', `${supabaseUrl}`);
      } else {
        logResult('Supabase Database', 'fail', `Connection error: ${error.message}`);
      }
    } catch (error) {
      logResult('Supabase Database', 'fail', `Error: ${error.message}`);
    }
  } else {
    logResult('Supabase Database', 'fail', 'Missing credentials');
  }

  // 3. Check Google Maps API
  console.log('\n3️⃣  GOOGLE MAPS API');
  console.log('-'.repeat(60));

  const mapsKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (mapsKey && mapsKey !== 'placeholder_key') {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Dubai&key=${mapsKey}`
      );
      if (response.ok) {
        logResult('Google Maps API', 'pass', 'API key is valid', 'Geocoding service accessible');
      } else {
        logResult('Google Maps API', 'fail', `HTTP ${response.status}`, 'API key may be invalid');
      }
    } catch (error) {
      logResult('Google Maps API', 'fail', `Network error: ${error.message}`);
    }
  } else {
    logResult('Google Maps API', 'fail', 'API key not configured');
  }

  // 4. Check Stripe Configuration
  console.log('\n4️⃣  STRIPE CONFIGURATION');
  console.log('-'.repeat(60));

  const stripeKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (stripeKey && stripeKey.startsWith('pk_')) {
    logResult('Stripe Publishable Key', 'pass', 'Valid format detected', stripeKey.substring(0, 30) + '...');
  } else if (stripeKey) {
    logResult('Stripe Publishable Key', 'fail', 'Invalid format (should start with pk_)');
  } else {
    logResult('Stripe Publishable Key', 'fail', 'Not configured');
  }

  // 5. Check Firebase Configuration
  console.log('\n5️⃣  FIREBASE CONFIGURATION');
  console.log('-'.repeat(60));

  const firebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_MESSAGING_SENDER_ID'
  ];

  let firebaseConfigured = true;
  for (const varName of firebaseVars) {
    const value = process.env[varName];
    if (value && value !== 'placeholder_key' && value !== 'placeholder_project' && value !== 'placeholder_sender') {
      logResult(varName, 'pass', 'Configured');
    } else {
      logResult(varName, 'warning', 'Not configured (push notifications disabled)');
      firebaseConfigured = false;
    }
  }

  // 6. Check Internet Connectivity
  console.log('\n6️⃣  INTERNET CONNECTIVITY');
  console.log('-'.repeat(60));

  try {
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      timeout: 5000 
    });
    logResult('Internet Access', 'pass', 'Connection available');
  } catch (error) {
    logResult('Internet Access', 'fail', `Network unreachable: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');
  console.log(`✓ Passed: ${results.summary.passed}`);
  console.log(`✗ Failed: ${results.summary.failed}`);
  console.log(`⚠ Warnings: ${results.summary.warnings}`);

  if (results.summary.failed === 0) {
    console.log('\n✅ All critical systems are connected!\n');
  } else {
    console.log('\n⚠️  Some systems need attention. Check failures above.\n');
  }

  // Save results to file
  const fs = await import('fs');
  fs.writeFileSync('connectivity-report.json', JSON.stringify(results, null, 2));
  console.log('📄 Full report saved to: connectivity-report.json\n');

  return results;
}

// Run the check
checkConnectivity().catch(error => {
  console.error('❌ Connectivity check failed:', error);
  process.exit(1);
});
