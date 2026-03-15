/**
 * UCON Ministries Error Code System
 * 
 * Error codes are 5 characters: 1 letter prefix + 4 digits
 * The letter indicates the error category:
 * 
 * A - Authentication errors (login, session, tokens)
 * B - Booking/Reservation errors (transit, events, workshops)
 * C - Configuration errors (settings, availability)
 * D - Database errors (queries, connections)
 * F - Fetch/Network errors (API calls, external services)
 * I - Input validation errors (form validation, missing fields)
 * N - Notification errors (email, SMS, push)
 * P - Permission/Authorization errors (RBAC, clearance)
 * R - Resource errors (not found, conflicts)
 * S - System errors (internal server errors)
 * T - Time-related errors (scheduling, availability windows)
 * U - User errors (profile, account)
 * V - Verification errors (codes, tokens, captcha)
 * W - Workshop errors (live sessions, recordings)
 */

export const ERROR_CODES = {
  // Authentication Errors (A0xxx)
  A0001: { code: 'A0001', message: 'Unauthorized - Please log in', category: 'authentication' },
  A0002: { code: 'A0002', message: 'Session expired - Please log in again', category: 'authentication' },
  A0003: { code: 'A0003', message: 'Invalid credentials', category: 'authentication' },
  A0004: { code: 'A0004', message: 'Account locked - Too many failed attempts', category: 'authentication' },
  A0005: { code: 'A0005', message: 'Email not verified', category: 'authentication' },
  A0006: { code: 'A0006', message: 'Token invalid or expired', category: 'authentication' },
  A0007: { code: 'A0007', message: 'Two-factor authentication required', category: 'authentication' },
  A0008: { code: 'A0008', message: 'Password reset required', category: 'authentication' },
  
  // Booking/Reservation Errors (B0xxx)
  B0001: { code: 'B0001', message: 'Booking not found', category: 'booking' },
  B0002: { code: 'B0002', message: 'Booking already exists', category: 'booking' },
  B0003: { code: 'B0003', message: 'Booking capacity reached', category: 'booking' },
  B0004: { code: 'B0004', message: 'Cannot modify completed booking', category: 'booking' },
  B0005: { code: 'B0005', message: 'Cannot cancel booking - Too late', category: 'booking' },
  B0006: { code: 'B0006', message: 'Booking conflict - Time slot unavailable', category: 'booking' },
  B0007: { code: 'B0007', message: 'Booking requires approval', category: 'booking' },
  B0008: { code: 'B0008', message: 'Booking status cannot be changed', category: 'booking' },
  
  // Configuration Errors (C0xxx)
  C0001: { code: 'C0001', message: 'Service not configured', category: 'configuration' },
  C0002: { code: 'C0002', message: 'Invalid configuration', category: 'configuration' },
  C0003: { code: 'C0003', message: 'Feature disabled', category: 'configuration' },
  C0004: { code: 'C0004', message: 'Environment variable missing', category: 'configuration' },
  
  // Database Errors (D0xxx)
  D0001: { code: 'D0001', message: 'Database connection failed', category: 'database' },
  D0002: { code: 'D0002', message: 'Query execution failed', category: 'database' },
  D0003: { code: 'D0003', message: 'Duplicate entry', category: 'database' },
  D0004: { code: 'D0004', message: 'Foreign key constraint violation', category: 'database' },
  D0005: { code: 'D0005', message: 'Transaction failed', category: 'database' },
  D0006: { code: 'D0006', message: 'Data integrity error', category: 'database' },
  
  // Fetch/Network Errors (F0xxx)
  F0001: { code: 'F0001', message: 'Network request failed', category: 'fetch' },
  F0002: { code: 'F0002', message: 'Request timeout', category: 'fetch' },
  F0003: { code: 'F0003', message: 'External service unavailable', category: 'fetch' },
  F0004: { code: 'F0004', message: 'API rate limit exceeded', category: 'fetch' },
  F0005: { code: 'F0005', message: 'Invalid API response', category: 'fetch' },
  F0006: { code: 'F0006', message: 'CORS error', category: 'fetch' },
  
  // Input Validation Errors (I0xxx)
  I0001: { code: 'I0001', message: 'Missing required fields', category: 'input' },
  I0002: { code: 'I0002', message: 'Invalid email format', category: 'input' },
  I0003: { code: 'I0003', message: 'Invalid phone number format', category: 'input' },
  I0004: { code: 'I0004', message: 'Invalid date format', category: 'input' },
  I0005: { code: 'I0005', message: 'Value out of range', category: 'input' },
  I0006: { code: 'I0006', message: 'Text too long', category: 'input' },
  I0007: { code: 'I0007', message: 'Invalid file type', category: 'input' },
  I0008: { code: 'I0008', message: 'File too large', category: 'input' },
  I0009: { code: 'I0009', message: 'Invalid ID format', category: 'input' },
  I0010: { code: 'I0010', message: 'Terms not accepted', category: 'input' },
  
  // Notification Errors (N0xxx)
  N0001: { code: 'N0001', message: 'Email delivery failed', category: 'notification' },
  N0002: { code: 'N0002', message: 'SMS delivery failed', category: 'notification' },
  N0003: { code: 'N0003', message: 'Push notification failed', category: 'notification' },
  N0004: { code: 'N0004', message: 'Invalid notification recipient', category: 'notification' },
  N0005: { code: 'N0005', message: 'Notification template not found', category: 'notification' },
  
  // Permission/Authorization Errors (P0xxx)
  P0001: { code: 'P0001', message: 'Insufficient permissions', category: 'permission' },
  P0002: { code: 'P0002', message: 'Role not assigned', category: 'permission' },
  P0003: { code: 'P0003', message: 'Clearance level too low', category: 'permission' },
  P0004: { code: 'P0004', message: 'Action not allowed for this role', category: 'permission' },
  P0005: { code: 'P0005', message: 'Resource access denied', category: 'permission' },
  P0006: { code: 'P0006', message: 'Admin approval required', category: 'permission' },
  P0007: { code: 'P0007', message: 'Duty clearance required', category: 'permission' },
  
  // Resource Errors (R0xxx)
  R0001: { code: 'R0001', message: 'Resource not found', category: 'resource' },
  R0002: { code: 'R0002', message: 'Resource already exists', category: 'resource' },
  R0003: { code: 'R0003', message: 'Resource locked', category: 'resource' },
  R0004: { code: 'R0004', message: 'Resource deleted', category: 'resource' },
  R0005: { code: 'R0005', message: 'Resource limit exceeded', category: 'resource' },
  
  // System Errors (S0xxx)
  S0001: { code: 'S0001', message: 'Internal server error', category: 'system' },
  S0002: { code: 'S0002', message: 'Service temporarily unavailable', category: 'system' },
  S0003: { code: 'S0003', message: 'Maintenance mode active', category: 'system' },
  S0004: { code: 'S0004', message: 'System overloaded', category: 'system' },
  S0005: { code: 'S0005', message: 'Unexpected error occurred', category: 'system' },
  
  // Time-related Errors (T0xxx)
  T0001: { code: 'T0001', message: 'Request must be 24 hours in advance', category: 'time' },
  T0002: { code: 'T0002', message: 'Outside open hours', category: 'time' },
  T0003: { code: 'T0003', message: 'Service closed on this day', category: 'time' },
  T0004: { code: 'T0004', message: 'Time slot expired', category: 'time' },
  T0005: { code: 'T0005', message: 'Scheduling conflict', category: 'time' },
  T0006: { code: 'T0006', message: 'Event has already started', category: 'time' },
  T0007: { code: 'T0007', message: 'Event has ended', category: 'time' },
  T0008: { code: 'T0008', message: 'Registration period closed', category: 'time' },
  
  // User Errors (U0xxx)
  U0001: { code: 'U0001', message: 'User not found', category: 'user' },
  U0002: { code: 'U0002', message: 'User already exists', category: 'user' },
  U0003: { code: 'U0003', message: 'Profile incomplete', category: 'user' },
  U0004: { code: 'U0004', message: 'Account suspended', category: 'user' },
  U0005: { code: 'U0005', message: 'Account not verified', category: 'user' },
  U0006: { code: 'U0006', message: 'Convict profile required', category: 'user' },
  
  // Verification Errors (V0xxx)
  V0001: { code: 'V0001', message: 'Invalid override code', category: 'verification' },
  V0002: { code: 'V0002', message: 'Override code expired', category: 'verification' },
  V0003: { code: 'V0003', message: 'Override code already used', category: 'verification' },
  V0004: { code: 'V0004', message: 'Verification code expired', category: 'verification' },
  V0005: { code: 'V0005', message: 'Invalid verification token', category: 'verification' },
  V0006: { code: 'V0006', message: 'Captcha verification failed', category: 'verification' },
  
  // Workshop Errors (W0xxx)
  W0001: { code: 'W0001', message: 'Workshop not found', category: 'workshop' },
  W0002: { code: 'W0002', message: 'Workshop full', category: 'workshop' },
  W0003: { code: 'W0003', message: 'Workshop not started', category: 'workshop' },
  W0004: { code: 'W0004', message: 'Workshop has ended', category: 'workshop' },
  W0005: { code: 'W0005', message: 'Already registered for workshop', category: 'workshop' },
  W0006: { code: 'W0006', message: 'Not registered for workshop', category: 'workshop' },
  W0007: { code: 'W0007', message: 'Recording not available', category: 'workshop' },
  W0008: { code: 'W0008', message: 'Live session connection failed', category: 'workshop' },
  
  // Location/Address Errors (L0xxx)
  L0001: { code: 'L0001', message: 'Missing street number', category: 'location' },
  L0002: { code: 'L0002', message: 'Missing street name', category: 'location' },
  L0003: { code: 'L0003', message: 'Missing city', category: 'location' },
  L0004: { code: 'L0004', message: 'Missing state', category: 'location' },
  L0005: { code: 'L0005', message: 'Missing ZIP code', category: 'location' },
  L0006: { code: 'L0006', message: 'Invalid ZIP code format', category: 'location' },
  L0007: { code: 'L0007', message: 'Address not found', category: 'location' },
  L0008: { code: 'L0008', message: 'Multiple address matches found', category: 'location' },
  L0009: { code: 'L0009', message: 'Address verification failed', category: 'location' },
  L0010: { code: 'L0010', message: 'Invalid state abbreviation', category: 'location' },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export interface UconError {
  code: ErrorCode;
  message: string;
  category: string;
  details?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Create a standardized error response
 */
export function createError(
  code: ErrorCode, 
  details?: string, 
  requestId?: string
): UconError {
  const errorDef = ERROR_CODES[code];
  return {
    code,
    message: errorDef.message,
    category: errorDef.category,
    details,
    timestamp: new Date().toISOString(),
    requestId,
  };
}

/**
 * Get error by code string (e.g., "A0001")
 */
export function getErrorByCode(code: string): typeof ERROR_CODES[ErrorCode] | undefined {
  return ERROR_CODES[code as ErrorCode];
}

/**
 * Get all errors by category
 */
export function getErrorsByCategory(category: string): typeof ERROR_CODES[ErrorCode][] {
  return Object.values(ERROR_CODES).filter(error => error.category === category);
}

/**
 * Format error for logging
 */
export function formatErrorForLog(error: UconError): string {
  return `[${error.code}] ${error.message}${error.details ? ` - ${error.details}` : ''} (${error.timestamp})${error.requestId ? ` [Request: ${error.requestId}]` : ''}`;
}

/**
 * Map legacy error codes to new system
 */
export const LEGACY_ERROR_MAP: Record<string, ErrorCode> = {
  'REQUIRES_24H_ADVANCE': 'T0001',
  'INVALID_OVERRIDE_CODE': 'V0001',
  'EXPIRED_OVERRIDE_CODE': 'V0002',
  'OUTSIDE_OPEN_HOURS': 'T0002',
  'SERVICE_CLOSED_DAY': 'T0003',
};

/**
 * Convert legacy error code to new format
 */
export function convertLegacyError(legacyCode: string): ErrorCode | undefined {
  return LEGACY_ERROR_MAP[legacyCode];
}
