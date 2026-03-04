# 🔍 Visual Error Diagnostics Utility

A comprehensive, on-screen error diagnostics system that appears whenever errors are logged, offering detailed analysis, source pinpointing, and copy-paste fixes.

## 📋 Overview

This utility provides:
- **Visual overlay** that appears when errors occur
- **Deep error analysis** with root cause identification
- **Source code context** showing exact error location
- **Copy-paste fixes** with priority-ranked solutions
- **Stack trace inspection** with file/line navigation
- **Severity classification** (low, medium, high, critical)
- **Category tagging** (Database, Auth, Validation, etc.)

---

## 🚀 Quick Start

### 1. In React Components (Client-Side)

```tsx
"use client";

import { useErrorDiagnostics } from "@/hooks/useErrorDiagnostics";
import { useState } from "react";

export function MyComponent() {
  const { showError, wrapAsync } = useErrorDiagnostics();
  const [data, setData] = useState(null);

  // Method 1: Manual error catching
  const handleClick = async () => {
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      // Trigger visual diagnostics
      showError(error as Error, {
        user: { id: 'user_123', email: 'user@example.com' },
        request: {
          method: 'GET',
          url: '/api/data',
          headers: {},
        },
      });
    }
  };

  // Method 2: Automatic wrapping
  const fetchData = wrapAsync(
    async () => {
      const response = await fetch('/api/data');
      return await response.json();
    },
    {
      user: { id: 'user_123' },
    }
  );

  return (
    <div>
      <button onClick={handleClick}>Manual Error Handling</button>
      <button onClick={fetchData}>Auto-Wrapped Error Handling</button>
    </div>
  );
}
```

### 2. In API Routes (Server-Side)

```tsx
import { NextRequest, NextResponse } from "next/server";
import { logErrorDiagnostics, type ErrorContext } from "@/lib/error-diagnostics";
import { db } from "@/db";

export async function GET(request: NextRequest) {
  try {
    const data = await db.query.users.findMany();
    return NextResponse.json(data);
  } catch (error) {
    // Create detailed error context
    const errorContext: ErrorContext = {
      error: error instanceof Error ? error : new Error(String(error)),
      timestamp: new Date(),
      request: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        platform: 'server',
        nodeVersion: process.version,
      },
    };

    // Log to console with full diagnostics
    logErrorDiagnostics(errorContext);

    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Features

### Visual Overlay

The overlay automatically appears when errors are detected and includes:

1. **Error Header**
   - Error type (TypeError, ReferenceError, etc.)
   - Severity badge (Critical, High, Medium, Low)
   - Category tag (Database, Auth, Validation, etc.)
   - Timestamp

2. **Root Cause Analysis**
   - Identifies the exact file and line where error originated
   - Plain English explanation of what went wrong

3. **Affected Files**
   - Shows source code context (5 lines before/after error)
   - Highlights the exact error line
   - File path with line:column numbers
   - Copy button for file location

4. **Potential Fixes**
   - Common solutions for the error category
   - Specific to the type of error encountered

5. **Suggested Solutions**
   - Priority-ranked fixes (1 = highest priority)
   - Code snippets you can copy-paste
   - One-click copy to clipboard

6. **Stack Trace**
   - Full stack trace (collapsible)
   - Filtered to exclude node_modules

### Error Categories

The system automatically categorizes errors:

| Category | Examples | Severity |
|----------|----------|----------|
| **Database** | SQL errors, constraint violations | High |
| **Authentication** | Unauthorized, forbidden | High |
| **Validation** | Invalid input, schema errors | Medium |
| **Network** | Fetch failures, timeouts | Medium |
| **Type/Null Safety** | undefined/null access | High |
| **Reference** | Variable not defined | High |
| **Syntax** | Parse errors | Critical |

### Severity Levels

| Level | Icon | Color | When to Use |
|-------|------|-------|-------------|
| **Critical** | 🔴 | Red | App-breaking errors |
| **High** | 🟠 | Orange | Major functionality broken |
| **Medium** | 🟡 | Yellow | Feature degradation |
| **Low** | 🔵 | Blue | Minor issues |

---

## 💡 Advanced Usage

### Custom Error Context

```tsx
const { showError } = useErrorDiagnostics();

try {
  // Your code
} catch (error) {
  showError(error as Error, {
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    },
    request: {
      method: 'POST',
      url: '/api/workshops/join',
      headers: { 'Authorization': 'Bearer token' },
      body: { workshopId: 123 },
    },
  });
}
```

### Wrapping Functions

```tsx
const { wrapAsync, wrapSync } = useErrorDiagnostics();

// Wrap async functions
const saveData = wrapAsync(
  async (data) => {
    await db.insert(users).values(data);
  },
  { user: { id: currentUserId } }
);

// Wrap sync functions
const processData = wrapSync(
  (input) => {
    return JSON.parse(input);
  },
  { request: { method: 'PROCESS' } }
);
```

---

## 🎨 UI Features

### Interactive Elements

1. **Minimize** - Click minimize to collapse to a small button
2. **Clear** - Remove individual errors or clear all
3. **Copy Buttons** - Copy file locations or code fixes
4. **Expand/Collapse** - Toggle sections for detailed info
5. **Auto-expand** - Automatically shows when new error arrives

### Smart Suggestions

The system provides context-aware fixes:

**Database Errors:**
```typescript
// Check database connection
await db.execute(sql`SELECT 1`);

// Wrap in try-catch
try {
  const result = await db.query();
} catch (error) {
  console.error('Database error:', error);
}
```

**Auth Errors:**
```typescript
// Verify session
const session = await auth();
if (!session?.user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Type Safety Errors:**
```typescript
// Add null checks
const value = obj?.property ?? defaultValue;

// Type guards
if (!isValidUser(data)) {
  throw new Error('Invalid user data');
}
```

---

## 🔧 Configuration

### Enable/Disable

The overlay only shows in **development mode** by default:

```tsx
// In layout.tsx
{process.env.NODE_ENV === 'development' && <ErrorDiagnosticsOverlay />}
```

To enable in production (not recommended):

```tsx
<ErrorDiagnosticsOverlay />
```

### Custom Styling

The overlay uses Tailwind classes and can be customized in `src/components/ErrorDiagnosticsOverlay.tsx`:

```tsx
// Change overlay background
<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

// Change card styling
<Card className="w-full max-w-5xl border-2 border-destructive" />
```

---

## 📊 Example Output

When an error occurs, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 ERROR DIAGNOSTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Type: TypeError
📝 Message: Cannot read property 'map' of undefined
🏷️  Category: Type/Null Safety
⚠️  Severity: HIGH

🎯 ROOT CAUSE:
   Error originated in src/components/WorkshopList.tsx at line 45

📁 AFFECTED FILES:

   1. src/components/WorkshopList.tsx:45:12

       42 | export function WorkshopList() {
       43 |   const [workshops, setWorkshops] = useState();
       44 |   
   >>> 45 |   return workshops.map((workshop) => (
       46 |     <div key={workshop.id}>{workshop.title}</div>
       47 |   ));
       48 | }

💡 POTENTIAL FIXES:
   1. Add null/undefined checks before accessing properties
   2. Use optional chaining (?.) for safe property access
   3. Validate data structure before processing

🔧 SUGGESTED SOLUTIONS:

   1. Add null/undefined checks (Priority: 1)

      // Use optional chaining and nullish coalescing
      const value = obj?.property ?? defaultValue;
      
      // Or explicit check
      if (!obj || !obj.property) {
        throw new Error('Required property is missing');
      }

   2. Add TypeScript type guards (Priority: 2)

      function isValidUser(user: unknown): user is User {
        return typeof user === 'object' && user !== null && 'id' in user;
      }
      
      if (!isValidUser(data)) {
        throw new Error('Invalid user data');
      }
```

---

## 🐛 Debugging Workshop Join Issue

Your specific workshop join error would show:

**Visual Overlay:**
- **Type:** SQLiteError
- **Category:** Database
- **Severity:** HIGH
- **Message:** FOREIGN KEY constraint failed

**Root Cause:**
"Error originated in src/app/api/workshops/[id]/participants/route.ts at line 156"

**Suggested Fix (Priority 1):**
```typescript
// Allow guests to join Awaken without DB insert
if (isGuest && isAwakenWorkshop) {
  return NextResponse.json(
    { 
      success: true, 
      isGuest: true,
      message: "Joined as guest - attendance not tracked" 
    },
    { status: 200 }
  );
}
```

---

## 🎓 Best Practices

1. **Always provide context** when calling `showError()`
2. **Use wrapAsync/wrapSync** for automatic error handling
3. **Keep overlay in development only** for production apps
4. **Review suggestions** before copy-pasting fixes
5. **Check root cause first** before diving into stack traces

---

## 🔗 Related Files

- `src/components/ErrorDiagnosticsOverlay.tsx` - Visual UI component
- `src/hooks/useErrorDiagnostics.ts` - React hook for client-side
- `src/lib/error-diagnostics.ts` - Core diagnostics engine
- `src/app/layout.tsx` - Integration point
- `src/app/api/workshops/[id]/participants/route.ts` - Example usage

---

## ✅ Summary

You now have a powerful visual error diagnostics system that:
- ✅ Automatically appears when errors occur
- ✅ Shows exact error location with code context
- ✅ Provides copy-paste fixes ranked by priority
- ✅ Works in both client and server environments
- ✅ Only shows in development mode
- ✅ Helps debug complex issues instantly

Try triggering an error now - the overlay will guide you to the fix! 🚀
