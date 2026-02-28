/**
 * Upgrade admin@ucon.dev to Full Access
 * 
 * Usage:
 *   bun run scripts/upgrade-admin-to-full-access.ts
 * 
 * Updates admin@ucon.dev to:
 * - Level 1 Clearance (Executive Leadership)
 * - All 35 Permissions (Full Access)
 * - Permission Clearance: 100 (Full Access)
 * - Duty Clearance: 100 (Full Access)
 */

import { db } from '../src/db';
import { user, userRoles, roles } from '../src/db/schema';
import { eq, and } from 'drizzle-orm';

async function upgradeAdminToFullAccess() {
  console.log('🔐 UCon Ministries - Upgrading admin@ucon.dev to Full Access\n');

  const targetEmail = 'admin@ucon.dev';

  try {
    // Find the user
    console.log(`🔍 Looking up user: ${targetEmail}...`);
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.email, targetEmail))
      .limit(1);

    if (targetUser.length === 0) {
      console.error('❌ ERROR: User not found');
      console.error(`   No user exists with email: ${targetEmail}\n`);
      return;
    }

    const userId = targetUser[0].id;
    console.log(`✅ User found: ${targetUser[0].name} (ID: ${userId})\n`);

    // Get Level 1 role (Executive Leadership)
    console.log('🔍 Finding Level 1 role (Executive Leadership)...');
    const level1Role = await db
      .select()
      .from(roles)
      .where(eq(roles.level, 1))
      .limit(1);

    if (level1Role.length === 0) {
      console.error('❌ ERROR: Level 1 role not found');
      console.error('   Please run database seeds to create roles\n');
      return;
    }

    console.log(`✅ Level 1 role found: ${level1Role[0].name} (ID: ${level1Role[0].id})\n`);

    // Check current role assignment
    console.log('🔍 Checking current role assignment...');
    const currentRole = await db
      .select({
        userRole: userRoles,
        role: roles,
      })
      .from(userRoles)
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))
      .limit(1);

    if (currentRole.length > 0 && currentRole[0].role) {
      console.log(`📋 Current role: ${currentRole[0].role.name} (Level ${currentRole[0].role.level})`);
      console.log(`   Staff Title: ${currentRole[0].userRole.staffTitle || 'N/A'}`);
      console.log(`   Permission Clearance: ${currentRole[0].userRole.permissionClearance || 0}`);
      console.log(`   Duty Clearance: ${currentRole[0].userRole.dutyClearance || 0}\n`);

      if (currentRole[0].role.level === 1 && 
          currentRole[0].userRole.permissionClearance === 100 &&
          currentRole[0].userRole.dutyClearance === 100) {
        console.log('✅ User already has Level 1 access with full clearance (100/100)!');
        console.log('   No changes needed.\n');
        console.log('🔑 Login at: http://localhost:3000/staff-login');
        console.log(`   Email: ${targetEmail}\n`);
        return;
      }

      // Update existing role assignment with full clearance
      console.log('🔄 Updating role to Level 1 with full clearance (100/100)...');
      await db
        .update(userRoles)
        .set({
          roleId: level1Role[0].id,
          staffTitle: 'Founding Visionary Lead',
          permissionClearance: 100,
          dutyClearance: 100,
          assignedAt: new Date().toISOString(),
        })
        .where(eq(userRoles.userId, userId));
    } else {
      // Create new role assignment with full clearance
      console.log('📝 Creating Level 1 role assignment with full clearance (100/100)...');
      await db
        .insert(userRoles)
        .values({
          userId: userId,
          roleId: level1Role[0].id,
          staffTitle: 'Founding Visionary Lead',
          permissionClearance: 100,
          dutyClearance: 100,
          assignedAt: new Date().toISOString(),
          assignedBy: userId,
        });
    }

    console.log('✅ SUCCESS! admin@ucon.dev upgraded to full access\n');

    // Fetch updated role to confirm
    const updatedRole = await db
      .select({
        userRole: userRoles,
        role: roles,
      })
      .from(userRoles)
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))
      .limit(1);

    console.log('📋 Updated Admin Details:');
    console.log(`  User ID: ${userId}`);
    console.log(`  Name: ${targetUser[0].name}`);
    console.log(`  Email: ${targetUser[0].email}`);
    if (updatedRole.length > 0 && updatedRole[0].role) {
      console.log(`  Role: ${updatedRole[0].role.name}`);
      console.log(`  Role Level: ${updatedRole[0].role.level} (Full Access)`);
      console.log(`  Staff Title: ${updatedRole[0].userRole.staffTitle}`);
      console.log(`  Permission Clearance: ${updatedRole[0].userRole.permissionClearance}/100 ✅`);
      console.log(`  Duty Clearance: ${updatedRole[0].userRole.dutyClearance}/100 ✅`);
    }
    console.log();

    console.log('✨ Clearance System:');
    console.log('  📊 Permission Clearance: 100/100 (Full Access)');
    console.log('     - Complete control over all permissions');
    console.log('     - Access to all permission-based features');
    console.log('     - Can modify any permission settings');
    console.log();
    console.log('  📊 Duty Clearance: 100/100 (Full Access)');
    console.log('     - Complete control over all duties');
    console.log('     - Access to all duty-based features');
    console.log('     - Can assign and modify any duties');
    console.log();

    console.log('✨ Permissions Granted (All 35):');
    console.log('  ✅ View Dashboard');
    console.log('  ✅ Manage Staff');
    console.log('  ✅ Manage Roles');
    console.log('  ✅ Manage Permissions');
    console.log('  ✅ Manage Workshops');
    console.log('  ✅ Manage Events');
    console.log('  ✅ Manage Members');
    console.log('  ✅ Manage Prayers');
    console.log('  ✅ Manage Settings');
    console.log('  ✅ View Reports');
    console.log('  ✅ Manage Users');
    console.log('  ✅ Delete Data');
    console.log('  ✅ System Settings');
    console.log('  ✅ Export Data');
    console.log('  ✅ Import Data');
    console.log('  ... and 20 more permissions\n');

    console.log('🚀 Next Steps:');
    console.log('  1. Visit http://localhost:3000/staff-login');
    console.log(`  2. Login with email: ${targetEmail}`);
    console.log('  3. Access the admin dashboard at /admin');
    console.log('  4. Access auth-status tool at /auth-status (Level 1-2 access)');
    console.log('  5. This user now has FULL ACCESS to all features\n');

    console.log('📱 Available Tools:');
    console.log('  • Admin Dashboard: /admin');
    console.log('  • Auth Status Tool: /auth-status (Level 1-2 access)');
    console.log('  • Staff Management: /admin/staff');
    console.log('  • Role Management: /admin/roles');
    console.log('  • Workshop Management: /admin/workshops');
    console.log('  • Member Management: /admin/members');
    console.log('  • Prayer Management: /admin/prayers');
    console.log('  • Event Management: /admin/events');
    console.log('  • System Settings: /admin/settings\n');

  } catch (error) {
    console.error('❌ FAILED to upgrade admin user');
    console.error('   Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('\n   Make sure:');
    console.error('   - The database is properly configured');
    console.error('   - Level 1 role exists (Executive Leadership)');
    console.error('   - All migrations have been run');
    console.error('   - Database seeds have been executed\n');
  }
}

// Run the script
upgradeAdminToFullAccess();