# Error Diagnostics System - Complete Guide

## 🎯 Summary

I've created a comprehensive error diagnostics utility that:
- **Pinpoints error sources in depth** with file locations and code context
- **Categorizes errors** (Database, Authentication, Validation, etc.)
- **Provides actionable fix suggestions** with code examples
- **Logs detailed diagnostics** for quick debugging

## 📋 What Was Fixed

### 1. Root Cause Identified

**Error:** `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed`

**Location:** `/api/workshops/[id]/participants` (POST endpoint)

**Cause:** The database has an old foreign key constraint on `workshop_participants.user_id` that references the `user` table. When guests try to join (with IDs like `guest_1764082181775_bvfmpbz86`), the constraint fails because guest IDs don't exist in the `user` table.

### 2. Error Diagnostics Utility Created

**Location:** `src/lib/error-diagnostics.ts`

**Features:**
- Parses stack traces and extracts file locations
- Reads source code around error lines
- Categorizes errors by type (Database, Auth, Validation, Network, Type Safety, etc.)
- Generates fix suggestions with code examples
- Formats comprehensive error reports
- Logs to console with detailed context

**Usage:**
```typescript
import { logErrorDiagnostics, type ErrorContext } from '@/lib/error-diagnostics';

try {
  // Your code
} catch (error) {
  const errorContext: ErrorContext = {
    error: error as Error,
    timestamp: new Date(),
    request: {
      method: 'POST',
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: { ...requestBody },
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
    },
  };
  logErrorDiagnostics(errorContext);
}
```

### 3. API Route Enhanced

**File:** `src/app/api/workshops/[id]/participants/route.ts`

**Improvements:**
- Added comprehensive error diagnostics logging
- Specific handling for foreign key constraint errors
- Better error messages with actionable details
- Preserved all existing functionality for both Awaken and Equip workshops

## 🔧 How to Fix the Database Issue

### Option 1: Run SQL Commands Directly

If you have access to your Turso database dashboard, run these SQL commands:

```sql
-- Step 1: Disable foreign keys temporarily
PRAGMA foreign_keys = OFF;

-- Step 2: Backup existing data
CREATE TABLE workshop_participants_backup AS 
SELECT * FROM workshop_participants;

-- Step 3: Drop old table
DROP TABLE workshop_participants;

-- Step 4: Create new table WITHOUT user_id foreign key
CREATE TABLE workshop_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workshop_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  peer_id TEXT,
  is_host INTEGER DEFAULT 0,
  is_muted INTEGER DEFAULT 0,
  is_video_off INTEGER DEFAULT 0,
  joined_at TEXT NOT NULL,
  left_at TEXT,
  FOREIGN KEY (workshop_id) REFERENCES workshops(id)
);

-- Step 5: Restore data
INSERT INTO workshop_participants 
SELECT * FROM workshop_participants_backup;

-- Step 6: Verify
SELECT COUNT(*) FROM workshop_participants;

-- Step 7: Drop backup
DROP TABLE workshop_participants_backup;

-- Step 8: Re-enable foreign keys
PRAGMA foreign_keys = ON;

-- Step 9: Verify schema
PRAGMA foreign_key_list(workshop_participants);
```

### Option 2: Use Database Agent

Request the database agent to:
```
"Remove the foreign key constraint from workshop_participants.user_id column while keeping the workshop_id foreign key intact. This is blocking guests from joining workshops."
```

### Option 3: Manual Drizzle Migration

1. Update `src/db/schema.ts` - remove the `.references()` from `userId`:
```typescript
export const workshopParticipants = sqliteTable('workshop_participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  userId: text('user_id').notNull(), // ✅ No .references() here
  // ... rest of fields
});
```

2. Generate and push migration:
```bash
npm run db:generate
npm run db:push
```

## 📊 Error Diagnostics Output Example

When an error occurs, you'll see detailed output like this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 ERROR DIAGNOSTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Type: Error
📝 Message: FOREIGN KEY constraint failed
🏷️  Category: Database
⚠️  Severity: HIGH

🎯 ROOT CAUSE:
   Error originated in src/app/api/workshops/[id]/participants/route.ts at line 200

📁 AFFECTED FILES:

   1. src/app/api/workshops/[id]/participants/route.ts:200:27

       196 |       }
       197 |     }
       198 |
       199 |     // Create participant record
   >>> 200 |     const newParticipant = await db.insert(workshopParticipants)
       201 |       .values({
       202 |         workshopId: id,
       203 |         userId: userId,
       204 |         userName: userName,

💡 POTENTIAL FIXES:
   1. Verify database connection is established
   2. Check table/column names match schema
   3. Ensure database migrations are up to date

🔧 SUGGESTED SOLUTIONS:

   1. Check database connection and schema (Priority: 1)

      // Verify database connection
      await db.execute(sql`SELECT 1`);
      
      // Check schema exists
      await db.select().from(yourTable).limit(1);

   2. Wrap database operations in try-catch (Priority: 2)

      try {
        const result = await db.query();
        return result;
      } catch (error) {
        console.error('Database error:', error);
        throw new Error('Database operation failed');
      }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🧪 Testing the Error Diagnostics

Run the test script:
```bash
npx tsx scripts/test-error-diagnostics.ts
```

This simulates various error types and shows how the diagnostics system works.

## 🚀 Current Status

✅ **Error diagnostics utility created** - Ready to use
✅ **API route enhanced** - Now logs detailed error info
✅ **Root cause identified** - Foreign key constraint issue
✅ **Fix documented** - Three options provided above
⏳ **Database fix pending** - Needs to be applied via one of the options

## 📝 Next Steps

1. **Apply the database fix** using one of the three options above
2. **Test guest joining** - Try joining an Awaken workshop as a guest
3. **Monitor logs** - Watch for detailed error diagnostics if any issues occur
4. **Verify fix** - Ensure guests can join Awaken workshops successfully

## 💡 Benefits of the New System

1. **Instant Error Identification** - Know exactly where and why errors occur
2. **Actionable Solutions** - Get specific code examples to fix issues
3. **Better Debugging** - See code context around errors
4. **Categorized Errors** - Understand error types and severity
5. **Production Ready** - Can integrate with error tracking services

## 🔗 Related Files

- `src/lib/error-diagnostics.ts` - Main diagnostics utility
- `src/app/api/workshops/[id]/participants/route.ts` - Enhanced API with diagnostics
- `scripts/test-error-diagnostics.ts` - Test script
- `scripts/fix-workshop-participants-fk.ts` - Migration script (needs env vars)

---

**Note:** The error diagnostics system is now active in the workshops participants API. All future errors will be logged with full diagnostic information for quick resolution.
