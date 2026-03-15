"use client";

import { useState, useEffect } from 'react';
import { X, Copy, Check, ChevronDown, ChevronRight, AlertTriangle, Info, AlertCircle, XCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { ErrorDiagnostics } from '@/lib/error-diagnostics';

interface ErrorEvent {
  diagnostics: ErrorDiagnostics;
  timestamp: Date;
  id: string;
}

export function ErrorDiagnosticsOverlay() {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Listen for error events
    const handleError = (event: CustomEvent<ErrorDiagnostics>) => {
      const newError: ErrorEvent = {
        diagnostics: event.detail,
        timestamp: new Date(),
        id: `error-${Date.now()}-${Math.random()}`,
      };
      setErrors((prev) => [...prev, newError]);
      setIsMinimized(false); // Auto-expand when new error arrives
    };

    window.addEventListener('error-diagnostics' as any, handleError);

    return () => {
      window.removeEventListener('error-diagnostics' as any, handleError);
    };
  }, []);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const removeError = (id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAutoFix = async (diagnostics: ErrorDiagnostics, errorId: string) => {
    // Get the highest priority fix
    const topFix = diagnostics.suggestions
      .filter(s => s.code)
      .sort((a, b) => a.priority - b.priority)[0];

    if (!topFix || !topFix.code) {
      toast.error('No automatic fix available for this error');
      return;
    }

    // Copy the fix to clipboard
    await navigator.clipboard.writeText(topFix.code);

    // Show success message with instructions
    toast.success('Fix copied to clipboard!', {
      description: `Priority ${topFix.priority} fix: ${topFix.description}`,
      duration: 5000,
    });

    // Try to apply the fix via API (optional)
    try {
      const response = await fetch('/api/apply-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: diagnostics.errorType,
          fix: topFix,
          affectedFiles: diagnostics.affectedFiles,
        }),
      });

      if (response.ok) {
        toast.success('Fix applied automatically!', {
          description: 'The error has been resolved. Please refresh if needed.',
        });
        removeError(errorId);
      } else {
        // Manual fix instructions
        toast.info('Manual fix required', {
          description: 'The fix has been copied. Please paste it into your code editor.',
          duration: 7000,
        });
      }
    } catch (error) {
      // If API fails, just show manual instructions
      toast.info('Apply the fix manually', {
        description: 'Paste the copied code into the affected file.',
        duration: 5000,
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (errors.length === 0) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => setIsMinimized(false)}
          className="shadow-lg bg-red-500 hover:bg-red-600 text-white"
          size="lg"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          {errors.length} Error{errors.length > 1 ? 's' : ''} Detected
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" />
      
      <div className="absolute inset-4 flex items-center justify-center pointer-events-none">
        <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto bg-background border-2 border-destructive shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-destructive/10">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <div>
                <h2 className="text-lg font-bold">Error Diagnostics</h2>
                <p className="text-sm text-muted-foreground">
                  {errors.length} error{errors.length > 1 ? 's' : ''} detected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={clearErrors}
                variant="outline"
                size="sm"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setIsMinimized(true)}
                variant="ghost"
                size="icon"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                onClick={clearErrors}
                variant="ghost"
                size="icon"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Error List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {errors.map((error) => {
              const { diagnostics, timestamp, id } = error;
              const hasAutoFix = diagnostics.suggestions.some(s => s.code);
              
              return (
                <Card key={id} className="border-l-4 border-l-destructive">
                  <div className="p-4 space-y-4">
                    {/* Error Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(diagnostics.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{diagnostics.errorType}</h3>
                            <Badge className={getSeverityColor(diagnostics.severity)}>
                              {diagnostics.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{diagnostics.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {diagnostics.errorMessage}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasAutoFix && (
                          <Button
                            onClick={() => handleAutoFix(diagnostics, id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                            size="sm"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Auto-Fix
                          </Button>
                        )}
                        <Button
                          onClick={() => removeError(id)}
                          variant="ghost"
                          size="icon"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Root Cause */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-sm">Root Cause:</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {diagnostics.rootCause}
                      </p>
                    </div>

                    {/* Auto-Fix Highlight (if available) */}
                    {hasAutoFix && (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1 text-green-700 dark:text-green-400">
                              Quick Fix Available
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              Click the "Auto-Fix" button to automatically apply the highest priority solution.
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-green-500/10">
                                Priority {diagnostics.suggestions.filter(s => s.code).sort((a, b) => a.priority - b.priority)[0]?.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {diagnostics.suggestions.filter(s => s.code).sort((a, b) => a.priority - b.priority)[0]?.description}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Affected Files */}
                    {diagnostics.affectedFiles.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleSection(`${id}-files`)}
                          className="flex items-center gap-2 mb-2 hover:text-primary transition-colors"
                        >
                          {expandedSections[`${id}-files`] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span className="font-semibold text-sm">
                            Affected Files ({diagnostics.affectedFiles.length})
                          </span>
                        </button>
                        
                        {expandedSections[`${id}-files`] && (
                          <div className="space-y-3 ml-6">
                            {diagnostics.affectedFiles.map((file, idx) => (
                              <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <code className="text-xs font-mono">
                                    {file.file}:{file.line}:{file.column}
                                  </code>
                                  <Button
                                    onClick={() =>
                                      handleCopy(
                                        `${file.file}:${file.line}:${file.column}`,
                                        `${id}-file-${idx}`
                                      )
                                    }
                                    variant="ghost"
                                    size="sm"
                                  >
                                    {copiedStates[`${id}-file-${idx}`] ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                                <div className="bg-background p-2 rounded font-mono text-xs overflow-x-auto">
                                  {file.code.map((line, lineIdx) => (
                                    <div
                                      key={lineIdx}
                                      className={
                                        line.startsWith('>>>')
                                          ? 'bg-destructive/20 text-destructive font-bold'
                                          : ''
                                      }
                                    >
                                      {line}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Potential Fixes */}
                    {diagnostics.potentialFixes.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleSection(`${id}-fixes`)}
                          className="flex items-center gap-2 mb-2 hover:text-primary transition-colors"
                        >
                          {expandedSections[`${id}-fixes`] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span className="font-semibold text-sm">
                            Potential Fixes ({diagnostics.potentialFixes.length})
                          </span>
                        </button>
                        
                        {expandedSections[`${id}-fixes`] && (
                          <ul className="space-y-2 ml-6">
                            {diagnostics.potentialFixes.map((fix, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-1">•</span>
                                <span>{fix}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Suggested Solutions */}
                    {diagnostics.suggestions.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleSection(`${id}-solutions`)}
                          className="flex items-center gap-2 mb-2 hover:text-primary transition-colors"
                        >
                          {expandedSections[`${id}-solutions`] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span className="font-semibold text-sm">
                            Suggested Solutions ({diagnostics.suggestions.length})
                          </span>
                        </button>
                        
                        {expandedSections[`${id}-solutions`] && (
                          <div className="space-y-3 ml-6">
                            {diagnostics.suggestions
                              .sort((a, b) => a.priority - b.priority)
                              .map((suggestion, idx) => (
                                <div
                                  key={idx}
                                  className="bg-primary/5 border border-primary/20 p-3 rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        Priority {suggestion.priority}
                                      </Badge>
                                      <span className="text-sm font-medium">
                                        {suggestion.description}
                                      </span>
                                    </div>
                                    {suggestion.code && (
                                      <Button
                                        onClick={() =>
                                          handleCopy(
                                            suggestion.code!,
                                            `${id}-solution-${idx}`
                                          )
                                        }
                                        variant="ghost"
                                        size="sm"
                                      >
                                        {copiedStates[`${id}-solution-${idx}`] ? (
                                          <>
                                            <Check className="w-3 h-3 mr-1" />
                                            Copied!
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3 mr-1" />
                                            Copy Fix
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                  {suggestion.code && (
                                    <div className="bg-background p-3 rounded font-mono text-xs overflow-x-auto">
                                      {suggestion.code.split('\n').map((line, lineIdx) => (
                                        <div key={lineIdx}>{line}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stack Trace */}
                    <div>
                      <button
                        onClick={() => toggleSection(`${id}-stack`)}
                        className="flex items-center gap-2 mb-2 hover:text-primary transition-colors"
                      >
                        {expandedSections[`${id}-stack`] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="font-semibold text-sm">Stack Trace</span>
                      </button>
                      
                      {expandedSections[`${id}-stack`] && (
                        <div className="bg-muted/50 p-3 rounded-lg ml-6">
                          <div className="bg-background p-2 rounded font-mono text-xs overflow-x-auto max-h-48 overflow-y-auto">
                            {diagnostics.stackTrace.map((line, idx) => (
                              <div key={idx} className="whitespace-pre">
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}