/**
 * Error Diagnostics Utility
 * Provides comprehensive error analysis with root cause detection and suggested fixes
 * 
 * IMPORTANT: This module is compatible with both server and client environments
 * File system operations only work server-side
 */

// Conditional requires - only available on server side
let readFileSync: any, existsSync: any, join: any;
if (typeof window === 'undefined') {
  try {
    const fs = require('fs');
    const path = require('path');
    readFileSync = fs.readFileSync;
    existsSync = fs.existsSync;
    join = path.join;
  } catch (e) {
    // Filesystem not available in edge runtime or browser
  }
}

export interface ErrorContext {
  error: Error;
  timestamp: Date;
  componentStack?: string;
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
    params?: Record<string, string>;
  };
  userContext?: {
    url: string;
    userAgent: string;
  };
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  environment: {
    nodeEnv: string;
    platform: string;
    nodeVersion: string;
  };
}

export interface ErrorDiagnostics {
  errorType: string;
  errorMessage: string;
  stackTrace: string[];
  rootCause: string;
  affectedFiles: {
    file: string;
    line: number;
    column: number;
    code: string[];
    context: 'before' | 'error' | 'after';
  }[];
  potentialFixes: string[];
  relatedErrors: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  suggestions: {
    description: string;
    code?: string;
    priority: number;
  }[];
}

function parseStackTrace(stack: string): { file: string; line: number; column: number }[] {
  const stackLines = stack.split('\n');
  const locations: { file: string; line: number; column: number }[] = [];

  for (const line of stackLines) {
    const match = line.match(/at\s+(?:.*\s+)?\(?(.*):(\d+):(\d+)\)?/);
    if (match) {
      const [, file, lineNum, colNum] = match;
      
      if (!file.includes('node_modules') && !file.startsWith('node:')) {
        locations.push({
          file: file.replace(/^file:\/\//, ''),
          line: parseInt(lineNum, 10),
          column: parseInt(colNum, 10),
        });
      }
    }
  }

  return locations;
}

function extractCodeContext(filePath: string, line: number, column: number): string[] {
  if (typeof window !== 'undefined' || !readFileSync || !existsSync) {
    return [
      `Cannot read file content (client-side environment)`,
      `>>> Error at line ${line}, column ${column}`,
    ];
  }

  try {
    const possiblePaths = [
      filePath,
      join(process.cwd(), filePath),
      join(process.cwd(), 'src', filePath),
    ];

    let resolvedPath = '';
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        resolvedPath = path;
        break;
      }
    }

    if (!resolvedPath) {
      return [
        `File not found: ${filePath}`,
        `>>> Error at line ${line}, column ${column}`,
      ];
    }

    const content = readFileSync(resolvedPath, 'utf-8');
    const lines = content.split('\n');
    
    const startLine = Math.max(0, line - 4);
    const endLine = Math.min(lines.length, line + 3);
    
    const context: string[] = [];
    for (let i = startLine; i < endLine; i++) {
      const lineNumber = i + 1;
      const prefix = lineNumber === line ? '>>> ' : '    ';
      context.push(`${prefix}${lineNumber}: ${lines[i]}`);
    }
    
    return context;
  } catch (error) {
    return [
      `Error reading file: ${filePath}`,
      `>>> Error at line ${line}, column ${column}`,
      `Details: ${error instanceof Error ? error.message : String(error)}`,
    ];
  }
}

function categorizeError(error: Error): { category: string; severity: 'low' | 'medium' | 'high' | 'critical' } {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('database') || message.includes('sql') || message.includes('constraint')) {
    return { category: 'Database', severity: 'high' };
  }

  if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
    return { category: 'Authentication', severity: 'high' };
  }

  if (message.includes('validation') || message.includes('invalid') || name.includes('validationerror')) {
    return { category: 'Validation', severity: 'medium' };
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return { category: 'Network', severity: 'medium' };
  }

  if (name.includes('typeerror') || message.includes('undefined') || message.includes('null')) {
    return { category: 'Type/Null Safety', severity: 'high' };
  }

  if (name.includes('referenceerror') || message.includes('not defined')) {
    return { category: 'Reference', severity: 'high' };
  }

  if (name.includes('syntaxerror')) {
    return { category: 'Syntax', severity: 'critical' };
  }

  if (name.includes('consoleerror')) {
    return { category: 'Console', severity: 'medium' };
  }

  return { category: 'Unknown', severity: 'medium' };
}

function generateFixSuggestions(error: Error, category: string): {
  description: string;
  code?: string;
  priority: number;
}[] {
  const suggestions: { description: string; code?: string; priority: number }[] = [];

  switch (category) {
    case 'Database':
      suggestions.push({
        description: 'Check database connection and schema',
        code: `// Verify database connection\nawait db.execute(sql\`SELECT 1\`);\n\n// Check schema exists\nawait db.select().from(yourTable).limit(1);`,
        priority: 1,
      });
      break;

    case 'Authentication':
      suggestions.push({
        description: 'Verify authentication middleware is applied',
        code: `// In your API route:\nimport { auth } from '@/lib/auth';\n\nconst session = await auth();\nif (!session?.user) {\n  return Response.json({ error: 'Unauthorized' }, { status: 401 });\n}`,
        priority: 1,
      });
      break;

    case 'Type/Null Safety':
      suggestions.push({
        description: 'Add null/undefined checks',
        code: `// Use optional chaining\nconst value = obj?.property ?? defaultValue;`,
        priority: 1,
      });
      break;

    default:
      suggestions.push({
        description: 'Add error handling',
        code: `try {\n  // Your code\n} catch (error) {\n  console.error('Error:', error);\n}`,
        priority: 1,
      });
  }

  return suggestions;
}

export function diagnoseError(context: ErrorContext): ErrorDiagnostics {
  const { error } = context;
  const stackLocations = parseStackTrace(error.stack || '');
  const { category, severity } = categorizeError(error);

  const affectedFiles = stackLocations.map((loc) => {
    const code = extractCodeContext(loc.file, loc.line, loc.column);
    return {
      file: loc.file,
      line: loc.line,
      column: loc.column,
      code,
      context: 'error' as const,
    };
  });

  const suggestions = generateFixSuggestions(error, category);

  const rootCause = affectedFiles.length > 0
    ? `Error originated in ${affectedFiles[0].file} at line ${affectedFiles[0].line}`
    : 'Unable to determine root cause from stack trace';

  const potentialFixes: string[] = [];
  
  if (category === 'Database') {
    potentialFixes.push('Verify database connection is established');
    potentialFixes.push('Check table/column names match schema');
  }
  
  if (category === 'Authentication') {
    potentialFixes.push('Verify user session is valid');
    potentialFixes.push('Check authorization middleware is applied');
  }

  if (category === 'Type/Null Safety') {
    potentialFixes.push('Add null/undefined checks before accessing properties');
    potentialFixes.push('Use optional chaining (?.) for safe property access');
  }

  return {
    errorType: error.name,
    errorMessage: error.message,
    stackTrace: (error.stack || '').split('\n'),
    rootCause,
    affectedFiles,
    potentialFixes,
    relatedErrors: [],
    severity,
    category,
    suggestions,
  };
}

export function formatDiagnostics(diagnostics: ErrorDiagnostics): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('🔍 ERROR DIAGNOSTICS');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  lines.push(`📌 Type: ${diagnostics.errorType}`);
  lines.push(`📝 Message: ${diagnostics.errorMessage}`);
  lines.push(`🏷️  Category: ${diagnostics.category}`);
  lines.push(`⚠️  Severity: ${diagnostics.severity.toUpperCase()}`);
  lines.push('');

  lines.push('🎯 ROOT CAUSE:');
  lines.push(`   ${diagnostics.rootCause}`);
  lines.push('');

  if (diagnostics.affectedFiles.length > 0) {
    lines.push('📁 AFFECTED FILES:');
    lines.push('');
    
    diagnostics.affectedFiles.forEach((file, index) => {
      lines.push(`   ${index + 1}. ${file.file}:${file.line}:${file.column}`);
      lines.push('');
      file.code.forEach(codeLine => lines.push(`   ${codeLine}`));
      lines.push('');
    });
  }

  if (diagnostics.potentialFixes.length > 0) {
    lines.push('💡 POTENTIAL FIXES:');
    diagnostics.potentialFixes.forEach((fix, index) => {
      lines.push(`   ${index + 1}. ${fix}`);
    });
    lines.push('');
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  return lines.join('\n');
}

export function logErrorDiagnostics(context: ErrorContext): void {
  const diagnostics = diagnoseError(context);
  const formatted = formatDiagnostics(diagnostics);
  
  console.error(formatted);
}
