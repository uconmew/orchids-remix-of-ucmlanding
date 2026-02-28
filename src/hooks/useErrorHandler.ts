"use client";

import { useCallback } from 'react';
import { toast } from 'sonner';
import { getErrorByCode, ErrorCode, ERROR_CODES } from '@/lib/errorCodes';

interface ErrorResponse {
  error?: string;
  code?: string;
  message?: string;
  details?: string;
  timestamp?: string;
}

/**
 * Hook for handling UCON error codes consistently across the application
 */
export function useErrorHandler() {
  /**
   * Handle an error response from the API
   * Shows a toast with the error code and message
   */
  const handleApiError = useCallback((response: ErrorResponse) => {
    const code = response.code as ErrorCode | undefined;
    const errorDef = code ? getErrorByCode(code) : undefined;
    
    const displayMessage = response.error || errorDef?.message || 'An unexpected error occurred';
    const errorCode = code || 'S0005';
    
    toast.error(`[${errorCode}] ${displayMessage}`, {
      description: response.details,
      duration: 5000,
    });
    
    // Log for debugging
    console.error(`[UCON Error ${errorCode}]`, {
      message: displayMessage,
      details: response.details,
      timestamp: response.timestamp || new Date().toISOString(),
    });
    
    return { code: errorCode, message: displayMessage };
  }, []);

  /**
   * Handle a fetch error with automatic error code detection
   */
  const handleFetchError = useCallback(async (response: Response) => {
    try {
      const data = await response.json();
      return handleApiError(data);
    } catch {
      // If we can't parse the response, use a generic error
      const genericError = {
        code: response.status === 401 ? 'A0001' : 
              response.status === 403 ? 'P0001' :
              response.status === 404 ? 'R0001' :
              response.status === 500 ? 'S0001' : 'F0001',
        error: response.statusText || 'Request failed',
      };
      return handleApiError(genericError);
    }
  }, [handleApiError]);

  /**
   * Show a specific error by code
   */
  const showError = useCallback((code: ErrorCode, customMessage?: string) => {
    const errorDef = ERROR_CODES[code];
    const message = customMessage || errorDef.message;
    
    toast.error(`[${code}] ${message}`, {
      duration: 5000,
    });
    
    console.error(`[UCON Error ${code}]`, message);
  }, []);

  /**
   * Show a success message
   */
  const showSuccess = useCallback((message: string) => {
    toast.success(message, { duration: 3000 });
  }, []);

  return {
    handleApiError,
    handleFetchError,
    showError,
    showSuccess,
  };
}

/**
 * Format error code for display to user
 */
export function formatErrorForUser(code: string, error?: string): string {
  const errorDef = getErrorByCode(code);
  if (errorDef) {
    return `Error ${code}: ${error || errorDef.message}`;
  }
  return error || 'An unexpected error occurred';
}

/**
 * Check if an error requires special handling (like override code input)
 */
export function requiresOverride(code: string): boolean {
  return ['T0001', 'T0002', 'T0003'].includes(code);
}

/**
 * Get help text for an error code
 */
export function getErrorHelpText(code: string): string | null {
  const helpTexts: Record<string, string> = {
    'A0001': 'Please log in to continue',
    'A0002': 'Your session has expired. Please log in again.',
    'T0001': 'Contact staff for an override code to book within 24 hours',
    'T0002': 'Contact staff for an override code to book outside open hours',
    'T0003': 'Transit service is closed today. Contact staff for assistance.',
    'V0001': 'The code you entered is invalid. Please check and try again.',
    'V0002': 'This code has expired. Please request a new one from staff.',
    'P0001': 'You do not have permission for this action. Contact an administrator.',
  };
  
  return helpTexts[code] || null;
}
