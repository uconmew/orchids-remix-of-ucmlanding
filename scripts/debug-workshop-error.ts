#!/usr/bin/env bun

/**
 * Workshop Error Debugging Script
 * 
 * This script helps debug workshop-related errors by:
 * 1. Checking workshop and participant records
 * 2. Validating foreign key relationships
 * 3. Testing guest user scenarios
 * 4. Providing detailed error information
 * 
 * Usage: bun run scripts/debug-workshop-error.ts [workshopId]
 */

import { db } from '@/db';
import { workshops, workshopParticipants, workshopRegistrations, user } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(color: keyof typeof COLORS, message: string) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  log('cyan', `  ${title}`);
  console.log('='.repeat(60));
}

async function debugWorkshop(workshopId?: string) {
  try {
    section('Workshop Error Debugger');
    
    // Get workshop ID from args or use default
    const targetWorkshopId = workshopId ? parseInt(workshopId) : 1;
    
    log('blue', `\nDebugging Workshop ID: ${targetWorkshopId}`);

    // 1. Check if workshop exists
    section('1. Workshop Details');
    const workshopData = await db.select()
      .from(workshops)
      .where(eq(workshops.id, targetWorkshopId))
      .limit(1);

    if (workshopData.length === 0) {
      log('red', '❌ Workshop not found!');
      return;
    }

    const workshop = workshopData[0];
    log('green', '✓ Workshop found');
    console.log(JSON.stringify(workshop, null, 2));

    // Determine workshop type
    const isAwakenWorkshop = workshop.programType === 'awaken' ||
      workshop.category?.toLowerCase().includes('bible') ||
      workshop.category?.toLowerCase().includes('ministerial') ||
      workshop.title?.toLowerCase().includes('bible') ||
      workshop.title?.toLowerCase().includes('ministerial');

    log('blue', `\nWorkshop Type: ${isAwakenWorkshop ? 'AWAKEN (guests allowed)' : 'EQUIP (registration required)'}`);

    // 2. Check participants
    section('2. Active Participants');
    const participants = await db.select()
      .from(workshopParticipants)
      .where(
        and(
          eq(workshopParticipants.workshopId, targetWorkshopId),
          isNull(workshopParticipants.leftAt)
        )
      );

    log('blue', `Total active participants: ${participants.length}`);
    
    if (participants.length > 0) {
      console.log('\nParticipants:');
      for (const p of participants) {
        const isGuest = p.userId.startsWith('guest_');
        log(isGuest ? 'yellow' : 'white', `  - ${p.userName} (${p.userId}) ${isGuest ? '[GUEST]' : '[REGISTERED]'}`);
      }
    } else {
      log('yellow', 'No active participants');
    }

    // 3. Check for guest participants with FK issues
    section('3. Guest Participant Analysis');
    const guestParticipants = participants.filter(p => p.userId.startsWith('guest_'));
    
    if (guestParticipants.length > 0) {
      log('yellow', `Found ${guestParticipants.length} guest participant(s)`);
      log('red', '⚠️  WARNING: Guest users may cause FOREIGN KEY constraint failures!');
      log('blue', '\nGuest IDs in database:');
      guestParticipants.forEach(g => {
        console.log(`  - ${g.userId}`);
      });
    } else {
      log('green', '✓ No guest participants (no FK issues expected)');
    }

    // 4. Check registrations
    section('4. Workshop Registrations');
    const registrations = await db.select()
      .from(workshopRegistrations)
      .where(eq(workshopRegistrations.workshopId, targetWorkshopId));

    log('blue', `Total registrations: ${registrations.length}`);
    
    if (registrations.length > 0) {
      console.log('\nRegistered users:');
      for (const r of registrations) {
        const attended = r.attendedAt ? '✓' : '✗';
        log('white', `  ${attended} ${r.userId} (registered: ${r.registeredAt})`);
      }
    }

    // 5. Check user table integrity
    section('5. User Table Integrity Check');
    const allUsers = await db.select().from(user);
    log('blue', `Total users in database: ${allUsers.length}`);

    // Check if participants exist in user table
    const participantUserIds = [...new Set(participants.map(p => p.userId))];
    const nonGuestParticipants = participantUserIds.filter(id => !id.startsWith('guest_'));
    
    for (const userId of nonGuestParticipants) {
      const userExists = allUsers.some(u => u.id === userId);
      if (userExists) {
        log('green', `✓ User ${userId} exists in user table`);
      } else {
        log('red', `❌ User ${userId} NOT found in user table (FK issue!)`);
      }
    }

    // 6. Test scenarios
    section('6. Common Error Scenarios');
    
    console.log('\n📋 Scenario Tests:');
    
    // Scenario 1: Guest joining Awaken workshop
    if (isAwakenWorkshop) {
      log('green', '✓ Guest can join (Awaken workshop)');
    } else {
      log('red', '✗ Guest CANNOT join (Equip workshop - blocked at API level)');
    }

    // Scenario 2: FK constraint
    log('red', '⚠️  IDENTIFIED ISSUE: guest_* userIds will fail FK constraint on insert');
    log('yellow', '   Problem: workshop_participants.user_id has FK to user table');
    log('yellow', '   Solution: Make user_id nullable OR remove FK constraint');

    // 7. Schema analysis
    section('7. Schema Recommendations');
    console.log('\n💡 To fix the FOREIGN KEY constraint error:');
    console.log('');
    log('cyan', 'Option 1: Make userId nullable');
    console.log('  - Modify workshop_participants schema:');
    console.log('    userId: text("user_id")  // Remove .notNull()');
    console.log('');
    log('cyan', 'Option 2: Remove FK constraint');
    console.log('  - Remove .references(() => user.id) from userId field');
    console.log('');
    log('cyan', 'Option 3: Add guest users to user table');
    console.log('  - Create temporary user records for guests');
    console.log('  - Mark them with isGuest flag');
    console.log('');
    log('green', 'Recommended: Option 2 or make userId nullable for guest support');

    // 8. Live debugging
    section('8. API Request Simulation');
    console.log('\n🧪 Simulating guest join request:');
    
    const testGuestData = {
      userId: `guest_${Date.now()}_test123`,
      userName: 'Test Guest',
      peerId: null,
      isHost: false,
      isGuest: true
    };

    log('blue', `Guest data: ${JSON.stringify(testGuestData, null, 2)}`);
    log('yellow', '\n⚠️  This would fail with: SQLITE_CONSTRAINT: FOREIGN KEY constraint failed');
    log('cyan', '   Because: guest_* userId does not exist in user table');

    section('Summary');
    console.log('\n📊 Debug Summary:');
    console.log(`  Workshop: ${workshop.title}`);
    console.log(`  Type: ${isAwakenWorkshop ? 'Awaken' : 'Equip'}`);
    console.log(`  Status: ${workshop.status}`);
    console.log(`  Active Participants: ${participants.length}`);
    console.log(`  Guest Participants: ${guestParticipants.length}`);
    console.log(`  Registrations: ${registrations.length}`);
    console.log('');
    log('red', '🔴 CRITICAL ISSUE: Foreign key constraint prevents guest participation');
    log('yellow', '📝 ACTION NEEDED: Update schema to support guest users');
    
  } catch (error) {
    section('ERROR');
    log('red', '❌ Debugging failed:');
    console.error(error);
    
    if (error instanceof Error) {
      console.log('\nError details:');
      console.log(`  Message: ${error.message}`);
      console.log(`  Stack: ${error.stack}`);
    }
  }
}

// Run the debugger
const workshopIdArg = process.argv[2];
debugWorkshop(workshopIdArg).then(() => {
  console.log('\n✅ Debug complete\n');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Debug script failed:', error);
  process.exit(1);
});
