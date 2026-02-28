#!/usr/bin/env tsx
/**
 * Test script for error diagnostics system
 * Run with: npx tsx scripts/test-error-diagnostics.ts
 */

import { diagnoseError, formatDiagnostics, type ErrorContext } from '../src/lib/error-diagnostics';

console.log('🧪 Testing Error Diagnostics System\n');

// Test 1: Database error
console.log('Test 1: Simulating Database Error');
try {
  throw new Error('Database constraint violation: FOREIGN_KEY constraint failed on user_id');
} catch (error) {
  const context: ErrorContext = {
    error: error as Error,
    timestamp: new Date(),
    request: {
      method: 'POST',
      url: '/api/workshops/123/participants',
      headers: {},
      body: { userId: 'test' },
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
    },
  };

  const diagnostics = diagnoseError(context);
  console.log(formatDiagnostics(diagnostics));
}

// Test 2: Type error
console.log('\nTest 2: Simulating Type/Null Safety Error');
try {
  const obj: any = null;
  obj.property.nested; // Will throw
} catch (error) {
  const context: ErrorContext = {
    error: error as Error,
    timestamp: new Date(),
    request: {
      method: 'GET',
      url: '/api/workshops/123',
      headers: {},
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
    },
  };

  const diagnostics = diagnoseError(context);
  console.log(formatDiagnostics(diagnostics));
}

// Test 3: Authentication error
console.log('\nTest 3: Simulating Authentication Error');
try {
  throw new Error('Unauthorized: User session not found or expired');
} catch (error) {
  const context: ErrorContext = {
    error: error as Error,
    timestamp: new Date(),
    request: {
      method: 'POST',
      url: '/api/workshops/123/participants',
      headers: {
        authorization: 'Bearer invalid_token',
      },
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
    },
  };

  const diagnostics = diagnoseError(context);
  console.log(formatDiagnostics(diagnostics));
}

console.log('\n✅ Error diagnostics tests completed!\n');
