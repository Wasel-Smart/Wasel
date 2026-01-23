#!/usr/bin/env node

/**
 * White Screen Fix Verification Script
 * 
 * This script helps verify the localStorage fix is working correctly
 * Run this in your browser console after the app loads
 */

console.log('🔍 Wasel White Screen Fix Verification\n');
console.log('════════════════════════════════════════\n');

// Test 1: Check if app is mounted
console.log('TEST 1: App Mount Check');
const rootContent = document.querySelector('#root > *');
if (rootContent) {
  console.log('✅ PASS: App is mounted and rendering');
} else {
  console.log('❌ FAIL: App not mounted - still white screen');
}
console.log('');

// Test 2: Check localStorage availability
console.log('TEST 2: localStorage Availability');
let localStorageAvailable = false;
try {
  localStorage.setItem('wasel-test', 'test');
  localStorage.removeItem('wasel-test');
  localStorageAvailable = true;
  console.log('✅ localStorage is available');
} catch (e) {
  console.log('⚠️  localStorage is blocked:', e.message);
  console.log('   App should still work with default language');
}
console.log('');

// Test 3: Check React is rendering
console.log('TEST 3: React Rendering Check');
const reactElements = document.querySelectorAll('[data-testid], [class*="chakra"], [class*="jsx"], [class*="css"]');
if (reactElements.length > 0) {
  console.log(`✅ PASS: Found ${reactElements.length} React elements`);
} else {
  console.log('⚠️  WARNING: React elements not detected');
}
console.log('');

// Test 4: Check for JavaScript errors
console.log('TEST 4: JavaScript Error Check');
const errorCount = performance.getEntriesByType('navigation')[0]?.toJSON()?.type === 'reload' ? 'unknown' : 0;
console.log(`ℹ️  Check browser console for any red errors`);
console.log('   If you see errors, the fix may not be complete');
console.log('');

// Test 5: Check language context
console.log('TEST 5: Language Context Check');
const htmlLang = document.documentElement.lang;
const htmlDir = document.documentElement.dir;
console.log(`ℹ️  Current language: ${htmlLang || 'not set'}`);
console.log(`ℹ️  Text direction: ${htmlDir || 'not set'}`);
console.log('');

// Test 6: Try changing language (if app has language switcher)
console.log('TEST 6: Language Persistence Test');
if (localStorageAvailable) {
  try {
    const savedLang = localStorage.getItem('wassel-language');
    console.log(`ℹ️  Saved language preference: ${savedLang || 'none (using default)'}`);
  } catch (e) {
    console.log('⚠️  Could not read language preference');
  }
} else {
  console.log('⚠️  Skipped (localStorage not available)');
}
console.log('');

// Summary
console.log('════════════════════════════════════════');
console.log('📊 SUMMARY');
console.log('════════════════════════════════════════');
if (rootContent) {
  console.log('✅ App is working correctly!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Try switching language (if available)');
  console.log('2. Test in private/incognito mode');
  console.log('3. Test with localStorage disabled');
} else {
  console.log('❌ App is still showing white screen');
  console.log('');
  console.log('Debug steps:');
  console.log('1. Check browser console for red errors');
  console.log('2. Verify you\'ve restarted the dev server');
  console.log('3. Try hard refresh (Ctrl+Shift+R)');
  console.log('4. Clear all browser data for this site');
}
console.log('════════════════════════════════════════\n');
