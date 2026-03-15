# Component Integration Checklist

**Purpose**: Run through this checklist every time you build a new component or feature to ensure proper integration with the alert system and error code system.

---

## Before You Start

1. **Identify if your component needs**:
   - User notifications (alerts)
   - Error handling with standardized codes
   - Both

---

## Alert System Integration

### When to Integrate Alerts

Integrate the alert system if your component:
- Sends notifications to users about status changes
- Requires user action (e.g., "more info needed")
- Has time-sensitive information (reminders, deadlines)
- Confirms successful actions (bookings, registrations, donations)
- Needs to communicate system messages

### How to Integrate Alerts

#### 1. Import the Alert Library

```typescript
import { 
  createAlert,
  createMoreInfoNeededAlert,
  createSystemAlert,
  createWelcomeAlert
} from '@/lib/alerts';
```

#### 2. Choose the Right Alert Type

| Alert Type | Use When |
|------------|----------|
| `more_info_needed` | User must provide additional information |
| `booking_approved` | A booking/registration was approved |
| `booking_denied` | A booking/registration was denied |
| `booking_cancelled` | A booking was cancelled |
| `workshop_reminder` | Upcoming workshop/event reminder |
| `workshop_cancelled` | Workshop/event was cancelled |
| `donation_received` | Donation confirmation |
| `system` | System announcements |
| `welcome` | New user welcome |
| `account` | Account-related alerts |
| `custom` | Any other notification |

#### 3. Create the Alert

```typescript
// Generic alert
await createAlert({
  userId: 'user-id-here',
  type: 'custom',
  title: 'Alert Title',
  message: 'Alert message content',
  actionUrl: '/path/to/action',
  actionLabel: 'Take Action',
  referenceId: '123',
  referenceType: 'entity_type',
  priority: 'normal', // low, normal, high, urgent
  metadata: { customData: 'value' },
  expiresAt: '2025-12-31T23:59:59Z' // Optional
});
```

#### 4. Wrap in Try-Catch

```typescript
try {
  await createAlert({ ... });
} catch (alertError) {
  console.error('Error creating alert:', alertError);
  // Don't throw - allow main operation to continue
}
```

#### 5. Add New Alert Types (if needed)

If you need a new alert type:
1. Add to `src/lib/alerts.ts` AlertType union
2. Create a helper function
3. Update `src/components/AlertCenter.tsx` for the icon

---

## Error Code System Integration

### When to Integrate Error Codes

Integrate error codes if your component:
- Returns errors to the client
- Validates user input
- Handles API responses
- Catches exceptions
- Needs diagnostic information for staff

### How to Integrate Error Codes

#### 1. Import the Error Library

```typescript
import { createError, ERROR_CODES, getErrorByCode } from '@/lib/error-codes';
```

#### 2. Choose the Right Error Category

| Prefix | Category | Use When |
|--------|----------|----------|
| A | Authentication | Login, session, permissions |
| B | Booking | Transit, events, reservations |
| C | Configuration | Settings, environment variables |
| D | Database | Queries, connections, constraints |
| F | Fetch/Network | API calls, HTTP requests |
| I | Input/Validation | Form validation, missing fields |
| L | Location/Address | Address validation, geocoding |
| O | Override | Override codes, special permissions |
| P | Permission | RBAC, role restrictions |
| R | Resource | Availability, capacity limits |
| S | System | Internal server errors |
| T | Time | Scheduling, availability windows |
| U | User | Profile, account issues |
| V | Verification | Codes, tokens, captcha |
| W | Workshop | Live sessions, recordings |

#### 3. Return Standardized Errors (Backend)

```typescript
// Using createError helper
return NextResponse.json(
  createError('T0001', 'Transit requests require 24h advance notice'),
  { status: 400 }
);

// Or direct approach
return NextResponse.json({ 
  error: ERROR_CODES.T0001.message,
  code: 'T0001'
}, { status: 400 });
```

#### 4. Handle Errors (Frontend)

```typescript
const response = await fetch('/api/...');
const data = await response.json();

if (data.code) {
  const errorDef = getErrorByCode(data.code);
  toast.error(`Error ${data.code}: ${errorDef?.message || data.error}`);
}
```

#### 5. Add New Error Codes (if needed)

If you need a new error code:
1. Choose the appropriate category letter
2. Use the next available number in that category
3. Add to `src/lib/error-codes.ts`
4. Update `ERROR_CODES.md` documentation

---

## Quick Reference: Common Patterns

### API Route with Both Systems

```typescript
import { NextResponse } from 'next/server';
import { createError, ERROR_CODES } from '@/lib/error-codes';
import { createAlert } from '@/lib/alerts';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Auth check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(createError('A0001'), { status: 401 });
    }

    const body = await request.json();
    
    // Validation
    if (!body.requiredField) {
      return NextResponse.json(createError('I0001', 'Required field missing'), { status: 400 });
    }

    // Business logic...
    const result = await doSomething(body);

    // Success alert
    try {
      await createAlert({
        userId: session.user.id,
        type: 'custom',
        title: 'Action Completed',
        message: 'Your action was successful',
        priority: 'normal'
      });
    } catch (alertError) {
      console.error('Alert creation failed:', alertError);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(createError('S0001'), { status: 500 });
  }
}
```

### Frontend Component with Error Handling

```typescript
"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { getErrorByCode } from '@/lib/error-codes';

export function MyComponent() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/my-endpoint', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(data)),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle error with code
        if (result.code) {
          const errorDef = getErrorByCode(result.code);
          toast.error(`Error ${result.code}: ${errorDef?.message || result.error}`);
        } else {
          toast.error(result.error || 'An error occurred');
        }
        return;
      }

      toast.success('Success!');
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (/* ... */);
}
```

---

## Checklist Summary

### For Every New Component

- [ ] Does it need user notifications? → Integrate Alert System
- [ ] Does it return errors? → Integrate Error Code System
- [ ] Are alerts wrapped in try-catch?
- [ ] Are error codes from the correct category?
- [ ] Is the error code documented in ERROR_CODES.md?
- [ ] Is the alert type documented in ALERT_SYSTEM_INTEGRATION.md?

### Before PR/Merge

- [ ] Test alert creation and display
- [ ] Test error code responses
- [ ] Verify alerts appear in AlertCenter
- [ ] Verify errors display user-friendly messages
- [ ] Update documentation if new types/codes added

---

## Documentation Links

- [Alert System Integration Guide](../ALERT_SYSTEM_INTEGRATION.md)
- [Error Codes Reference](../ERROR_CODES.md)
- [Alert Library Source](../src/lib/alerts.ts)
- [Error Codes Library Source](../src/lib/error-codes.ts)
