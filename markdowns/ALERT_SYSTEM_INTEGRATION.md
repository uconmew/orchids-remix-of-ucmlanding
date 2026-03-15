# Alert System Integration Guide

This document explains how to integrate the site-wide alert system into new components and features.

## Overview

The alert system provides a centralized way to notify users about important events, actions required, and status changes. Alerts are displayed in the navigation bar via the AlertCenter component.

## Database Schema

```sql
CREATE TABLE user_alerts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id),
  type TEXT NOT NULL,           -- Alert category
  title TEXT NOT NULL,          -- Short title
  message TEXT NOT NULL,        -- Detailed message
  action_url TEXT,              -- URL to navigate when clicked
  action_label TEXT,            -- Button/link text
  reference_id TEXT,            -- Related entity ID
  reference_type TEXT,          -- Related entity type
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  metadata JSONB,               -- Additional data
  expires_at TEXT,              -- Auto-expire time (ISO string)
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## Alert Types

| Type | Description | Priority |
|------|-------------|----------|
| `more_info_needed` | User needs to provide additional information | high |
| `booking_approved` | Transit booking approved | normal |
| `booking_denied` | Transit booking denied | normal |
| `booking_cancelled` | Booking was cancelled | normal |
| `workshop_reminder` | Upcoming workshop reminder | high |
| `workshop_cancelled` | Workshop has been cancelled | normal |
| `donation_received` | Donation confirmation | normal |
| `system` | System announcements | varies |
| `welcome` | New user welcome | normal |
| `account` | Account-related alerts | varies |
| `custom` | Custom alerts | varies |

## Creating Alerts

### Using the Alert Library

Import and use the helper functions from `src/lib/alerts.ts`:

```typescript
import { 
  createAlert,
  createMoreInfoNeededAlert,
  createBookingApprovedAlert,
  createBookingDeniedAlert,
  createWorkshopReminderAlert,
  createSystemAlert,
  createWelcomeAlert
} from '@/lib/alerts';

// Generic alert
await createAlert({
  userId: 'user-id-here',
  type: 'custom',
  title: 'Alert Title',
  message: 'Alert message content',
  actionUrl: '/path/to/action',
  actionLabel: 'Take Action',
  referenceId: '123',
  referenceType: 'some_entity',
  priority: 'normal',
  metadata: { customData: 'value' },
  expiresAt: '2025-12-31T23:59:59Z' // Optional
});

// More info needed for transit booking
await createMoreInfoNeededAlert(
  userId,
  bookingId,
  'Please provide your phone number and preferred pickup time.'
);

// Booking approved
await createBookingApprovedAlert(
  userId,
  bookingId,
  '2025-01-15T10:00:00Z' // Scheduled time
);

// Booking denied
await createBookingDeniedAlert(
  userId,
  bookingId,
  'Outside service area' // Optional reason
);

// Workshop reminder
await createWorkshopReminderAlert(
  userId,
  workshopId,
  'Financial Literacy Workshop',
  '2025-01-15T14:00:00Z'
);

// System alert
await createSystemAlert(
  userId,
  'System Maintenance',
  'Scheduled maintenance on Saturday 2AM-4AM',
  'normal'
);

// Welcome alert for new users
await createWelcomeAlert(userId, 'John Doe');
```

## API Endpoints

### GET /api/alerts

Fetch user alerts.

**Query Parameters:**
- `includeRead` (boolean): Include read alerts (default: false)
- `includeDismissed` (boolean): Include dismissed alerts (default: false)
- `limit` (number): Max alerts to return (default: 50)

**Response:**
```json
{
  "alerts": [...],
  "unreadCount": 5
}
```

### PATCH /api/alerts

Update alert status.

**Body:**
```json
{
  "id": 123,         // Single alert ID
  "ids": [1, 2, 3],  // Or multiple IDs
  "action": "read"   // "read", "dismiss", or "unread"
}
```

### DELETE /api/alerts

Dismiss alerts.

**Query Parameters:**
- `id` (number): Single alert ID to dismiss
- `dismissAll` (boolean): Dismiss all user alerts

## Frontend Integration

### Using AlertCenter Component

The AlertCenter component is already integrated into the Navigation component. It:
- Displays a bell icon with unread count badge
- Shows alerts in a dropdown panel
- Allows marking as read and dismissing
- Navigates to action URLs when clicked

### Custom Alert Display

If you need to display alerts in a custom component:

```typescript
"use client";

import { useState, useEffect } from 'react';

function MyComponent() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data.alerts));
  }, []);

  return (
    <div>
      {alerts.map(alert => (
        <div key={alert.id}>
          <h4>{alert.title}</h4>
          <p>{alert.message}</p>
          {alert.metadata?.staffRequirements && (
            <div className="requirements">
              {alert.metadata.staffRequirements}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Use Appropriate Priority Levels:**
   - `urgent`: Critical issues requiring immediate attention
   - `high`: Important but not critical (e.g., action required)
   - `normal`: Standard notifications
   - `low`: Informational only

2. **Set Expiration for Time-Sensitive Alerts:**
   ```typescript
   await createAlert({
     ...params,
     expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
   });
   ```

3. **Include Action URLs:**
   Always provide an actionUrl when the user needs to take action.

4. **Use Metadata for Complex Data:**
   Store additional context in the metadata field for rich alert displays.

5. **Reference Entity IDs:**
   Set referenceId and referenceType to link alerts to specific records for tracking.

## Adding New Alert Types

1. Add the type to `src/lib/alerts.ts`:
   ```typescript
   export type AlertType = 
     | 'more_info_needed'
     | 'your_new_type'  // Add here
     | ...;
   ```

2. Create a helper function:
   ```typescript
   export async function createYourNewAlert(
     userId: string,
     customParam: string
   ) {
     return createAlert({
       userId,
       type: 'your_new_type',
       title: 'Your Alert Title',
       message: `Custom message with ${customParam}`,
       priority: 'normal',
     });
   }
   ```

3. Update `AlertCenter.tsx` to handle the new type icon:
   ```typescript
   case 'your_new_type':
     return <YourIcon className="w-5 h-5 text-blue-500" />;
   ```

## Error Handling

Always wrap alert creation in try-catch to prevent alert failures from breaking main functionality:

```typescript
try {
  await createMoreInfoNeededAlert(userId, bookingId, requirements);
} catch (alertError) {
  console.error('Error creating alert:', alertError);
  // Don't throw - allow main operation to continue
}
```

## Testing Alerts

1. Create a test alert via API:
   ```bash
   curl -X POST http://localhost:3000/api/alerts \
     -H "Content-Type: application/json" \
     -d '{"type":"system","title":"Test","message":"Test message"}'
   ```

2. Check the AlertCenter in the navigation bar for the notification badge.

3. Click to open and verify alert display.

## Migration Notes

If upgrading from the old notification system:
- The new alert system works alongside existing notifications
- Alerts provide richer metadata and expiration support
- Consider migrating time-sensitive notifications to alerts
