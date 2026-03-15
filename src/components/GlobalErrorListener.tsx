"use client";

import { useEffect, Component, ReactNode } from 'react';
import { useErrorDiagnostics } from '@/hooks/useErrorDiagnostics';

/**
 * Global Error Listener Component
 * Automatically catches ALL errors in the application and triggers diagnostics overlay:
 * - Runtime errors (window.onerror)
 * - Unhandled promise rejections
 * - Console errors
 * - React component errors (via error boundary)
 */

// Error Boundary to catch React component errors
class ErrorBoundary extends Component<
  { children: ReactNode; onError: (error: Error, errorInfo: any) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError(error, errorInfo);
    // Reset error state after a delay to allow recovery
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      // Return null to let the app continue rendering
      return this.props.children;
    }
    return this.props.children;
  }
}

function GlobalErrorListenerInner({ children }: { children: ReactNode }) {
  const { showError } = useErrorDiagnostics();

  useEffect(() => {
    // 1. Catch runtime JavaScript errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault(); // Prevent default browser error UI
      
      const error = event.error || new Error(event.message);
      showError(error, {
        userContext: {
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
        componentStack: event.filename ? `at ${event.filename}:${event.lineno}:${event.colno}` : undefined,
      });
    };

    // 2. Catch unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault(); // Prevent default browser error UI
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      showError(error, {
        userContext: {
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      });
    };

    // 3. Intercept console.error to catch all console errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Call original console.error first
      originalConsoleError.apply(console, args);
      
      // Try to extract error from arguments
      const errorArg = args.find(arg => arg instanceof Error);
      if (errorArg) {
        showError(errorArg, {
          userContext: {
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
        });
      } else {
        // Create error from console message
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        const error = new Error(message);
        error.name = 'ConsoleError';
        
        showError(error, {
          userContext: {
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
        });
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, [showError]);

  return <>{children}</>;
}

export function GlobalErrorListener({ children }: { children: ReactNode }) {
  const { showError } = useErrorDiagnostics();

  const handleReactError = (error: Error, errorInfo: any) => {
    showError(error, {
      componentStack: errorInfo.componentStack,
      userContext: {
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      },
    });
  };

  return (
    <ErrorBoundary onError={handleReactError}>
      <GlobalErrorListenerInner>
        {children}
      </GlobalErrorListenerInner>
    </ErrorBoundary>
  );
}
