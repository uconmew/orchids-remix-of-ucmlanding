# UCON Ministries Error Code System

This document provides a comprehensive reference for all error codes used throughout the UCON Ministries platform. Error codes help developers and staff quickly diagnose issues and provide appropriate support.

**Library Location**: `src/lib/error-codes.ts`

## Error Code Format

All error codes follow a **5-character format**: `[LETTER][4 DIGITS]`

- The **letter prefix** indicates the error category
- The **4 digits** uniquely identify the specific error

Example: `T1001` = Time-related error #1001 (24-hour advance notice required)

---

## Error Categories

| Prefix | Category | Description |
|--------|----------|-------------|
| A | Authentication/Authorization | Login, session, permissions |
| B | Booking | Transit, events, reservations |
| C | Configuration | Settings, environment variables |
| D | Database | Queries, connections, constraints |
| E | External | Third-party services |
| F | Fetch/Network | API calls, HTTP requests |
| I | Input/Validation | Form validation, missing fields |
| L | Location/Address | Address validation, geocoding |
| O | Override | Override codes, special permissions |
| P | Payment | Stripe, donations |
| R | Resource | Availability, capacity limits |
| S | System | Internal server errors |
| T | Time | Scheduling, availability windows |
| U | User | Profile, account issues |
| W | Workshop | Live sessions, recordings |

---

## Complete Error Code Reference

### Authentication Errors (A0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| A1001 | User not authenticated | No valid session found |
| A1002 | Session expired | Session timeout |
| A1003 | Insufficient permissions | Role/clearance denied |
| A1004 | Invalid credentials | Wrong email/password combination |
| A1005 | Account locked | Too many failed login attempts |
| A1006 | Staff-only access required | Resource requires staff auth |
| A1007 | Duty clearance required | Missing duty clearance bits |
| A1008 | Email not found | No account with this email |
| A1009 | Incorrect password | Password doesn't match account |
| A1010 | Account not verified | Email verification pending |
| A1011 | Account suspended | Admin suspended account |
| A1012 | Account deactivated | Account has been deactivated |
| A1013 | Password expired | Force password change |
| A1014 | Authentication failed | General auth failure |
| A1015 | No staff role found | User lacks staff/admin role |
| A1016 | Missing staff tag | Has role level but no Staff tag |
| A1017 | Missing admin tag | Has admin level but no Admin tag |
| A1018 | Convict-only account | Only has Convict tag, no Staff/Admin |
| A1019 | Role verification failed | Database role check error |
| A1020 | Invalid role level | Role level insufficient |
| A1021 | Missing email field | Email required but empty |
| A1022 | Missing password field | Password required but empty |
| A1023 | Invalid email format | Bad email syntax |
| A1024 | Password too short | Under minimum length |
| A1025 | Admin access required | Requires admin privileges |
| A1026 | Session cookie missing | Session cookie not present |
| A1027 | Staff session cookie missing | Staff cookie required |
| A1028 | Admin session cookie missing | Admin cookie required |
| A1029 | User ID missing | No user ID in session |
| A1030 | Rate limit exceeded | Too many login attempts |

### Booking/Reservation Errors (B0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| B0001 | Booking not found | Invalid booking ID |
| B0002 | Booking already exists | Duplicate booking attempt |
| B0003 | Booking capacity reached | Event/service full |
| B0004 | Cannot modify completed booking | Past booking edit |
| B0005 | Cannot cancel booking - Too late | Cancellation window passed |
| B0006 | Booking conflict - Time slot unavailable | Schedule conflict |
| B0007 | Booking requires approval | Pending admin review |
| B0008 | Booking status cannot be changed | Invalid status transition |

### Configuration Errors (C0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| C0001 | Service not configured | Missing service setup |
| C0002 | Invalid configuration | Malformed config |
| C0003 | Feature disabled | Turned off feature |
| C0004 | Environment variable missing | Missing env var |

### Database Errors (D0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| D0001 | Database connection failed | Connection timeout |
| D0002 | Query execution failed | SQL error |
| D0003 | Duplicate entry | Unique constraint violation |
| D0004 | Foreign key constraint violation | Invalid reference |
| D0005 | Transaction failed | Rollback occurred |
| D0006 | Data integrity error | Corrupted data |

### Fetch/Network Errors (F0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| F0001 | Network request failed | Connection error |
| F0002 | Request timeout | Slow response |
| F0003 | External service unavailable | Third-party down |
| F0004 | API rate limit exceeded | Too many requests |
| F0005 | Invalid API response | Malformed response |
| F0006 | CORS error | Cross-origin blocked |

### Input Validation Errors (I0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| I0001 | Missing required fields | Empty required input |
| I0002 | Invalid email format | Bad email syntax |
| I0003 | Invalid phone number format | Bad phone syntax |
| I0004 | Invalid date format | Bad date syntax |
| I0005 | Value out of range | Number outside bounds |
| I0006 | Text too long | Exceeded max length |
| I0007 | Invalid file type | Wrong file extension |
| I0008 | File too large | Exceeded size limit |
| I0009 | Invalid ID format | Bad ID syntax |
| I0010 | Terms not accepted | Required checkbox unchecked |

### Notification Errors (N0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| N0001 | Email delivery failed | SMTP error |
| N0002 | SMS delivery failed | Twilio/SMS error |
| N0003 | Push notification failed | FCM/APN error |
| N0004 | Invalid notification recipient | Bad recipient |
| N0005 | Notification template not found | Missing template |

### Permission/Authorization Errors (P0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| P0001 | Insufficient permissions | RBAC denied |
| P0002 | Role not assigned | No role found |
| P0003 | Clearance level too low | Security clearance |
| P0004 | Action not allowed for this role | Role restriction |
| P0005 | Resource access denied | Object-level security |
| P0006 | Admin approval required | Needs admin sign-off |
| P0007 | Duty clearance required | Special duty needed |

### Resource Errors (R0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| R0001 | Resource not found | 404 equivalent |
| R0002 | Resource already exists | Duplicate creation |
| R0003 | Resource locked | Concurrent edit block |
| R0004 | Resource deleted | Soft-deleted item |
| R0005 | Resource limit exceeded | Quota reached |

### System Errors (S0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| S0001 | Internal server error | Generic 500 |
| S0002 | Service temporarily unavailable | 503 status |
| S0003 | Maintenance mode active | Planned downtime |
| S0004 | System overloaded | High load |
| S0005 | Unexpected error occurred | Catch-all |

### Time-related Errors (T0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| T0001 | Request must be 24 hours in advance | Transit 24h rule |
| T0002 | Outside open hours | After hours request |
| T0003 | Service closed on this day | Weekend/holiday |
| T0004 | Time slot expired | Past slot |
| T0005 | Scheduling conflict | Double-booking |
| T0006 | Event has already started | Late registration |
| T0007 | Event has ended | Past event |
| T0008 | Registration period closed | Sign-up deadline |

### User Errors (U0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| U0001 | User not found | Invalid user ID |
| U0002 | User already exists | Duplicate registration |
| U0003 | Profile incomplete | Missing profile data |
| U0004 | Account suspended | Admin suspension |
| U0005 | Account not verified | Pending verification |
| U0006 | Convict profile required | Missing convict record |

### Verification Errors (V0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| V0001 | Invalid override code | Wrong 4-digit code |
| V0002 | Override code expired | Code past 5min window |
| V0003 | Override code already used | Reuse attempt |
| V0004 | Verification code expired | Email/SMS code expired |
| V0005 | Invalid verification token | Bad token |
| V0006 | Captcha verification failed | Bot check failed |

### Workshop Errors (W0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| W0001 | Workshop not found | Invalid workshop ID |
| W0002 | Workshop full | Capacity reached |
| W0003 | Workshop not started | Too early to join |
| W0004 | Workshop has ended | Session over |
| W0005 | Already registered for workshop | Duplicate registration |
| W0006 | Not registered for workshop | Unregistered access |
| W0007 | Recording not available | No recording exists |
| W0008 | Live session connection failed | WebRTC/connection error |

### Location/Address Errors (L0xxx)

| Code | Message | When to Use |
|------|---------|-------------|
| L0001 | Missing street number | Address without house number |
| L0002 | Missing street name | Address without street name |
| L0003 | Missing city | Address without city |
| L0004 | Missing state | Address without state |
| L0005 | Missing ZIP code | Address without ZIP |
| L0006 | Invalid ZIP code format | ZIP not 5 or 5+4 digits |
| L0007 | Address not found | Unable to parse/verify |
| L0008 | Multiple address matches found | Ambiguous address |
| L0009 | Address verification failed | External service error |
| L0010 | Invalid state abbreviation | State not in US states list |

---

## Usage in Code

### Creating Errors (Backend)

```typescript
import { createError, ERROR_CODES } from '@/lib/errorCodes';

// Return standardized error
return NextResponse.json(
  createError('T0001', 'Transit requests require 24h advance notice'),
  { status: 400 }
);

// Or simpler approach
return NextResponse.json({ 
  error: ERROR_CODES.T0001.message,
  code: 'T0001'
}, { status: 400 });
```

### Handling Errors (Frontend)

```typescript
import { getErrorByCode } from '@/lib/errorCodes';

const response = await fetch('/api/...');
const data = await response.json();

if (data.code) {
  const errorDef = getErrorByCode(data.code);
  toast.error(`Error ${data.code}: ${errorDef?.message || data.error}`);
}
```

---

## Staff Diagnostic Guide

When a user reports an error code, staff can use this guide to quickly diagnose:

1. **Look up the error category** by the first letter
2. **Find the specific error** in the table above
3. **Check common causes** based on the error type
4. **Escalate if needed** for D/S category errors (database/system)

### Common User Issues

| Error Code | Likely Cause | Quick Fix |
|------------|--------------|-----------|
| A1001 | Not logged in | Have user log in |
| A1002 | Session timeout | Refresh and log in again |
| A1004 | Wrong credentials | Verify email/password |
| A1005 | Too many failed logins | Wait 15 minutes |
| A1008 | Email not in system | Check email or register |
| A1009 | Wrong password | Reset password if needed |
| A1010 | Email not verified | Check inbox for verification |
| A1015 | No staff role | Contact admin for role |
| A1018 | Convict-only account | Use regular login |
| T0001 | Same-day booking | Provide override code |
| T0002 | After-hours request | Provide override code |
| V0001 | Wrong code entered | Generate new code |
| V0002 | Waited too long | Generate new code |
| P0001 | Missing role | Contact admin for role assignment |

### Escalation Path

- **A/U errors**: User Support Team
- **P errors**: Admin/Role Manager
- **D/S errors**: Technical Team (Urgent)
- **T/V errors**: Staff with override access
- **B/W errors**: Service Coordinator

---

## Adding New Error Codes

When adding new error codes:

1. Choose the appropriate category letter
2. Use the next available number in that category
3. Add to `src/lib/errorCodes.ts`
4. Update this documentation
5. Test the error flow end-to-end

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-20 | Initial error code system |

---

*For technical questions about error handling, contact the development team.*
*For user-facing error support, contact the staff support team.*
