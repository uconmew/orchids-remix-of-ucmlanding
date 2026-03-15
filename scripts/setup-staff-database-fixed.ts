#!/usr/bin/env bun
/**
 * Staff Database Setup Script - FIXED VERSION
 * 
 * This script:
 * 1. Deletes all staff except UCM users (@uconministries.org)
 * 2. Creates entries for homepage/about page staff
 * 3. Assigns UCM (Ucon Clearance Metrics) to each staff member
 * 4. Uses correct schema: roles.level instead of clearanceLevel
 */

import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { user, uconRoles, roles } from '../src/db/schema';

// Staff members from homepage (src/app/page.tsx lines 144-186)
const homepageStaff = [
  {
    name: "Founding Visionary Lead",
    role: "Founder & Executive Director",
    email: "founder@uconministries.org",
    bio: "Founded Ucon Ministries after personal transformation from addiction and justice system involvement. Leads strategic vision and ministry direction with 8 years of biblical experience and lived recovery journey.",
    expertise: ["Ministry Founder", "LDI Developer", "Peer Equal"],
    clearance: 100,
    staffTitle: "Founding Visionary Lead"
  },
  {
    name: "Spiritual Formation Director",
    role: "Biblical Integration",
    email: "spiritual@uconministries.org",
    bio: "Leads spiritual formation curriculum design and biblical integration across all ministry programs. Specializes in contemplative practices, theological education, and creating sacred spaces for authentic spiritual growth and transformation.",
    expertise: ["M.Div. Theology", "Biblical Counselor", "SME"],
    clearance: 90,
    staffTitle: "Spiritual Formation Director"
  },
  {
    name: "Clinical Director",
    role: "Mental Health & Clinical Excellence",
    email: "clinical@uconministries.org",
    bio: "Licensed clinical psychologist specializing in addiction recovery and trauma treatment, integrating evidence-based practices with faith-based principles.",
    expertise: ["Clinical Psychology", "Trauma-Informed Care", "SME"],
    clearance: 95,
    staffTitle: "Clinical Director"
  },
  {
    name: "Multiplication Director",
    role: "Ministry Programs",
    email: "programs@uconministries.org",
    bio: "Oversees multiplication of ministry programs across all tiers and tracks, ensuring program quality, participant transformation success, and scalable impact.",
    expertise: ["LDI Developer", "Purpose Driven"],
    clearance: 85,
    staffTitle: "Multiplication Director"
  },
  {
    name: "Outreach Coordinator",
    role: "Community Engagement",
    email: "outreach@uconministries.org",
    bio: "Leads Track 3 outreach initiatives, coordinating volunteers and ensuring immediate crisis response to community needs 24/7.",
    expertise: ["Social Work", "Community Organizer"],
    clearance: 75,
    staffTitle: "Outreach Coordinator"
  },
  {
    name: "Nicole Hedges",
    role: "Outreach Director",
    email: "nicole@uconministries.org",
    bio: "Hey. Yeah. Whatever.. as Outreach Director and convict, I live for the moments when barriers crumble and hearts connect across all the lines that usually divide us—because I believe love is the most powerful force for change, and it's meant to be tangible, hands-on, and radically inclusive.",
    expertise: ["Outreach Director", "Community Bridge", "Convict"],
    clearance: 80,
    staffTitle: "Outreach Director"
  }
];

async function setupStaffDatabase() {
  console.log('🚀 Starting Staff Database Setup...\n');

  try {
    // Step 1: Check existing roles
    console.log('🔐 Checking existing roles...');
    const existingRoles = await db.select().from(roles);
    console.log(`Found ${existingRoles.length} existing roles`);

    // Create role mappings
    let adminRoleId: number | null = null;
    let staffRoleId: number | null = null;

    for (const role of existingRoles) {
      if (role.name.toLowerCase() === 'admin') {
        adminRoleId = role.id;
      } else if (role.name.toLowerCase() === 'staff') {
        staffRoleId = role.id;
      }
    }

    // Create missing roles
    if (!adminRoleId) {
      const result: any = await db.insert(roles).values({
        name: 'Admin',
        description: 'Full system access',
        level: 100,
        createdAt: new Date().toISOString()
      }).returning();
      adminRoleId = result[0].id;
      console.log(`✓ Created Admin role (ID: ${adminRoleId})`);
    }

    if (!staffRoleId) {
      const result: any = await db.insert(roles).values({
        name: 'Staff',
        description: 'Staff member access',
        level: 50,
        createdAt: new Date().toISOString()
      }).returning();
      staffRoleId = result[0].id;
      console.log(`✓ Created Staff role (ID: ${staffRoleId})`);
    }

    console.log('\n');

    // Step 2: Delete all non-UCM users from user table
    console.log('🗑️  Deleting non-UCM users...');
    
    const allUsers: any = await db.select().from(user);
    console.log(`Found ${allUsers.length} total users`);

    const ucmUsers = allUsers.filter((u: any) => u.email?.includes('@uconministries.org'));
    console.log(`Found ${ucmUsers.length} UCM users to preserve`);

    // Delete non-UCM users
    const nonUcmUsers = allUsers.filter((u: any) => !u.email?.includes('@uconministries.org'));
    for (const nonUcmUser of nonUcmUsers) {
      await db.delete(user).where(sql`${user.id} = ${nonUcmUser.id}`);
    }

    console.log(`✓ Deleted ${nonUcmUsers.length} non-UCM users\n`);

    // Step 3: Create or update homepage staff
    console.log('👥 Creating homepage staff entries...\n');

    for (const staff of homepageStaff) {
      // Check if user exists
      const existingUsers: any = await db
        .select()
        .from(user)
        .where(sql`${user.email} = ${staff.email}`);

      let userId: string;

      if (existingUsers.length > 0) {
        // Update existing user
        userId = existingUsers[0].id;
        await db
          .update(user)
          .set({
            name: staff.name,
            bio: staff.bio,
            expertise: staff.expertise,
            updatedAt: new Date()
          })
          .where(sql`${user.id} = ${userId}`);
        console.log(`✓ Updated user: ${staff.name} (${staff.email})`);
      } else {
        // Create new user
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await db.insert(user).values({
          id: userId,
          name: staff.name,
          email: staff.email,
          emailVerified: false,
          bio: staff.bio,
          expertise: staff.expertise,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✓ Created user: ${staff.name} (${staff.email})`);
      }

      // Check if ucon_roles entry exists
      const existingUconRoles: any = await db
        .select()
        .from(uconRoles)
        .where(sql`${uconRoles.userId} = ${userId}`);

      // Determine role based on clearance
      const roleId = staff.clearance === 100 ? adminRoleId : staffRoleId;

      if (existingUconRoles.length > 0) {
        // Update existing ucon_role
        await db
          .update(uconRoles)
          .set({
            roleId: roleId!,
            staffTitle: staff.staffTitle,
            permissionClearance: staff.clearance,
            dutyClearance: staff.clearance
          })
          .where(sql`${uconRoles.id} = ${existingUconRoles[0].id}`);
        console.log(`  ✓ Updated Ucon Role: ${staff.staffTitle} (Clearance: ${staff.clearance})`);
      } else {
        // Create new ucon_role
        await db.insert(uconRoles).values({
          userId,
          roleId: roleId!,
          staffTitle: staff.staffTitle,
          permissionClearance: staff.clearance,
          dutyClearance: staff.clearance,
          assignedAt: new Date().toISOString(),
          assignedBy: null
        });
        console.log(`  ✓ Created Ucon Role: ${staff.staffTitle} (Clearance: ${staff.clearance})`);
      }

      console.log('');
    }

    // Step 4: Verify setup
    console.log('📊 Verification:\n');
    
    const ucmCount: any = await db
      .select()
      .from(user)
      .where(sql`${user.email} LIKE '%@uconministries.org'`);
    
    const uconRolesCount: any = await db.select().from(uconRoles);

    console.log(`✓ UCM users: ${ucmCount.length}`);
    console.log(`✓ Ucon Roles assigned: ${uconRolesCount.length}`);

    console.log('\n✅ Staff database setup complete!');
    console.log('\n📋 Summary:');
    console.log('   • All non-UCM users deleted');
    console.log('   • Homepage/about staff created with UCM emails');
    console.log('   • Clearance levels assigned (UCM = Ucon Clearance Metrics)');
    console.log('   • Staff Permissions configured\n');

    // List all staff created
    console.log('📝 Staff Members Created:\n');
    for (const staff of homepageStaff) {
      console.log(`   ${staff.name}`);
      console.log(`   └─ ${staff.email}`);
      console.log(`   └─ ${staff.staffTitle} (Clearance: ${staff.clearance})\n`);
    }

  } catch (error) {
    console.error('❌ Error setting up staff database:', error);
    throw error;
  }
}

// Run the setup
setupStaffDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
