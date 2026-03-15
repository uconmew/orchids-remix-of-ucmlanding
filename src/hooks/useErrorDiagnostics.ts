"use client";

import { useCallback } from 'react';
import { diagnoseError, type ErrorContext, type ErrorDiagnostics } from '@/lib/error-diagnostics';

/**
 * Hook to trigger visual error diagnostics overlay
 */
export function useErrorDiagnostics() {
  const showError = useCallback((error: Error, additionalContext?: Partial<ErrorContext>) => {
    const context: ErrorContext = {
      error,
      timestamp: new Date(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        platform: typeof window !== 'undefined' ? 'browser' : 'server',
        nodeVersion: typeof process !== 'undefined' ? process.version : 'unknown',
      },
      ...additionalContext,
    };

    const diagnostics = diagnoseError(context);

    // Dispatch custom event that the overlay will catch
    if (typeof window !== 'undefined') {
      const event = new CustomEvent<ErrorDiagnostics>('error-diagnostics', {
        detail: diagnostics,
      });
      window.dispatchEvent(event);
    }

    // Also log to console for debugging
    console.error('Error diagnostics triggered:', diagnostics);
  }, []);

  const wrapAsync = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorContext?: Partial<ErrorContext>
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        if (error instanceof Error) {
          showError(error, errorContext);
        }
        throw error;
      }
    }) as T;
  }, [showError]);

  const wrapSync = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    errorContext?: Partial<ErrorContext>
  ): T => {
    return ((...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (error) {
        if (error instanceof Error) {
          showError(error, errorContext);
        }
        throw error;
      }
    }) as T;
  }, [showError]);

  return {
    showError,
    wrapAsync,
    wrapSync,
  };
}
