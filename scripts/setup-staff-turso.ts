#!/usr/bin/env bun
/**
 * Staff Database Setup Script - TURSO VERSION
 * 
 * This script uses the actual Turso database structure with correct column names:
 * - emailVerified (not email_verified)
 * - createdAt (not created_at)
 * - isStaff, staffTitle, etc.
 */

import { createClient } from '@libsql/client';

// Staff members from homepage
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
  console.log('🚀 Starting Staff Database Setup (Turso)...\n');

  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  try {
    // Step 1: Check/create roles
    console.log('🔐 Setting up roles...');
    
    const rolesResult = await client.execute('SELECT * FROM roles');
    console.log(`Found ${rolesResult.rows.length} existing roles`);

    // Check for Admin role
    const adminRole = rolesResult.rows.find((r: any) => r.name?.toLowerCase() === 'admin');
    let adminRoleId: number;

    if (!adminRole) {
      const result = await client.execute({
        sql: 'INSERT INTO roles (name, description, level, createdAt) VALUES (?, ?, ?, unixepoch()) RETURNING id',
        args: ['Admin', 'Full system access', 100]
      });
      adminRoleId = result.rows[0].id as number;
      console.log(`✓ Created Admin role (ID: ${adminRoleId})`);
    } else {
      adminRoleId = adminRole.id as number;
      console.log(`✓ Found Admin role (ID: ${adminRoleId})`);
    }

    // Check for Staff role
    const staffRole = rolesResult.rows.find((r: any) => r.name?.toLowerCase() === 'staff');
    let staffRoleId: number;

    if (!staffRole) {
      const result = await client.execute({
        sql: 'INSERT INTO roles (name, description, level, createdAt) VALUES (?, ?, ?, unixepoch()) RETURNING id',
        args: ['Staff', 'Staff member access', 50]
      });
      staffRoleId = result.rows[0].id as number;
      console.log(`✓ Created Staff role (ID: ${staffRoleId})`);
    } else {
      staffRoleId = staffRole.id as number;
      console.log(`✓ Found Staff role (ID: ${staffRoleId})`);
    }

    console.log('\n');

    // Step 2: Delete all non-UCM users
    console.log('🗑️  Deleting non-UCM users...');
    
    const allUsersResult = await client.execute('SELECT id, email FROM user');
    console.log(`Found ${allUsersResult.rows.length} total users`);

    const nonUcmUsers = allUsersResult.rows.filter((u: any) => !u.email?.includes('@uconministries.org'));
    console.log(`Found ${nonUcmUsers.length} non-UCM users to delete`);

    for (const user of nonUcmUsers) {
      await client.execute({
        sql: 'DELETE FROM user WHERE id = ?',
        args: [user.id]
      });
    }

    console.log(`✓ Deleted ${nonUcmUsers.length} non-UCM users\n`);

    // Step 3: Create or update homepage staff
    console.log('👥 Creating homepage staff entries...\n');

    for (const staff of homepageStaff) {
      // Check if user exists
      const existingUserResult = await client.execute({
        sql: 'SELECT id FROM user WHERE email = ?',
        args: [staff.email]
      });

      let userId: string;

      if (existingUserResult.rows.length > 0) {
        // Update existing user
        userId = existingUserResult.rows[0].id as string;
        await client.execute({
          sql: `UPDATE user 
                SET name = ?, bio = ?, expertise = ?, isStaff = 1, staffTitle = ?, updatedAt = unixepoch()
                WHERE id = ?`,
          args: [staff.name, staff.bio, JSON.stringify(staff.expertise), staff.staffTitle, userId]
        });
        console.log(`✓ Updated user: ${staff.name} (${staff.email})`);
      } else {
        // Create new user
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await client.execute({
          sql: `INSERT INTO user (id, name, email, emailVerified, bio, expertise, isStaff, staffTitle, createdAt, updatedAt)
                VALUES (?, ?, ?, 0, ?, ?, 1, ?, unixepoch(), unixepoch())`,
          args: [userId, staff.name, staff.email, staff.bio, JSON.stringify(staff.expertise), staff.staffTitle]
        });
        console.log(`✓ Created user: ${staff.name} (${staff.email})`);
      }

      // Check if ucon_roles entry exists
      const existingUconRoleResult = await client.execute({
        sql: 'SELECT id FROM ucon_roles WHERE userId = ?',
        args: [userId]
      });

      // Determine role based on clearance
      const roleId = staff.clearance === 100 ? adminRoleId : staffRoleId;

      if (existingUconRoleResult.rows.length > 0) {
        // Update existing ucon_role
        await client.execute({
          sql: `UPDATE ucon_roles 
                SET roleId = ?, staffTitle = ?, permissionClearance = ?, dutyClearance = ?
                WHERE id = ?`,
          args: [roleId, staff.staffTitle, staff.clearance, staff.clearance, existingUconRoleResult.rows[0].id]
        });
        console.log(`  ✓ Updated Ucon Role: ${staff.staffTitle} (Clearance: ${staff.clearance})`);
      } else {
        // Create new ucon_role
        await client.execute({
          sql: `INSERT INTO ucon_roles (userId, roleId, staffTitle, permissionClearance, dutyClearance, assignedAt)
                VALUES (?, ?, ?, ?, ?, datetime('now'))`,
          args: [userId, roleId, staff.staffTitle, staff.clearance, staff.clearance]
        });
        console.log(`  ✓ Created Ucon Role: ${staff.staffTitle} (Clearance: ${staff.clearance})`);
      }

      console.log('');
    }

    // Step 4: Verify setup
    console.log('📊 Verification:\n');
    
    const ucmUsersResult = await client.execute("SELECT COUNT(*) as count FROM user WHERE email LIKE '%@uconministries.org'");
    const uconRolesResult = await client.execute('SELECT COUNT(*) as count FROM ucon_roles');

    console.log(`✓ UCM users: ${ucmUsersResult.rows[0].count}`);
    console.log(`✓ Ucon Roles assigned: ${uconRolesResult.rows[0].count}`);

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
