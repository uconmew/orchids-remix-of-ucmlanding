#!/usr/bin/env bun
/**
 * Staff Database Setup Script
 * 
 * This script:
 * 1. Creates necessary tables if they don't exist
 * 2. Deletes all staff except UCM users (@uconministries.org)
 * 3. Creates entries for homepage/about page staff
 * 4. Assigns UCM (Ucon Clearance Metrics) to each staff member
 */

import { db } from '../src/db';
import { sql } from 'drizzle-orm';

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
    // Step 1: Create tables if they don't exist
    console.log('📋 Creating tables...');
    
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        emailVerified INTEGER,
        image TEXT,
        password TEXT,
        role TEXT DEFAULT 'member',
        isStaff INTEGER DEFAULT 0,
        staffTitle TEXT,
        bio TEXT,
        phone TEXT,
        expertise TEXT,
        createdAt INTEGER DEFAULT (unixepoch()),
        updatedAt INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT NOT NULL,
        image TEXT,
        expertise TEXT,
        order_position INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ucon_roles (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        roleId TEXT NOT NULL,
        staffTitle TEXT NOT NULL,
        permissionClearance INTEGER DEFAULT 0,
        dutyClearance INTEGER DEFAULT 0,
        assignedAt INTEGER DEFAULT (unixepoch()),
        assignedBy TEXT,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE(userId, roleId)
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        clearanceLevel INTEGER DEFAULT 0,
        isSystemRole INTEGER DEFAULT 0,
        createdAt INTEGER DEFAULT (unixepoch()),
        updatedAt INTEGER DEFAULT (unixepoch())
      )
    `);

    console.log('✅ Tables created successfully\n');

    // Step 2: Create default roles if they don't exist
    console.log('🔐 Creating default roles...');
    
    const roles = [
      { id: 'admin', name: 'Admin', description: 'Full system access', clearanceLevel: 100 },
      { id: 'staff', name: 'Staff', description: 'Staff member access', clearanceLevel: 50 },
      { id: 'volunteer', name: 'Volunteer', description: 'Volunteer access', clearanceLevel: 30 }
    ];

    for (const role of roles) {
      await db.run(sql`
        INSERT OR IGNORE INTO roles (id, name, description, clearanceLevel, isSystemRole, createdAt, updatedAt)
        VALUES (${role.id}, ${role.name}, ${role.description}, ${role.clearanceLevel}, 1, unixepoch(), unixepoch())
      `);
    }

    console.log('✅ Default roles created\n');

    // Step 3: Delete all non-UCM staff
    console.log('🗑️  Deleting non-UCM staff...');
    
    // Get all staff users (those with @uconministries.org emails)
    const ucmUsers = await db.all(sql`
      SELECT id, email FROM user WHERE email LIKE '%@uconministries.org'
    `);
    
    console.log(`Found ${ucmUsers.length} UCM users to preserve`);

    // Delete staff entries not linked to UCM users
    if (ucmUsers.length > 0) {
      const ucmUserIds = ucmUsers.map(u => u.id);
      await db.run(sql`
        DELETE FROM staff 
        WHERE userId NOT IN (${sql.join(ucmUserIds.map(id => sql`${id}`), sql`, `)})
      `);
    } else {
      // If no UCM users exist, delete all staff
      await db.run(sql`DELETE FROM staff`);
    }

    console.log('✅ Non-UCM staff deleted\n');

    // Step 4: Create or update homepage staff
    console.log('👥 Creating homepage staff entries...\n');

    for (const staff of homepageStaff) {
      // Check if user exists
      const existingUser = await db.get(sql`
        SELECT id FROM user WHERE email = ${staff.email}
      `);

      let userId: string;

      if (existingUser) {
        // Update existing user
        userId = existingUser.id;
        await db.run(sql`
          UPDATE user 
          SET 
            name = ${staff.name},
            isStaff = 1,
            staffTitle = ${staff.staffTitle},
            bio = ${staff.bio},
            expertise = ${JSON.stringify(staff.expertise)},
            updatedAt = unixepoch()
          WHERE id = ${userId}
        `);
        console.log(`✓ Updated user: ${staff.name} (${staff.email})`);
      } else {
        // Create new user
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await db.run(sql`
          INSERT INTO user (
            id, name, email, isStaff, staffTitle, bio, expertise, 
            role, createdAt, updatedAt
          )
          VALUES (
            ${userId}, ${staff.name}, ${staff.email}, 1, ${staff.staffTitle},
            ${staff.bio}, ${JSON.stringify(staff.expertise)}, 'staff',
            unixepoch(), unixepoch()
          )
        `);
        console.log(`✓ Created user: ${staff.name} (${staff.email})`);
      }

      // Check if staff entry exists
      const existingStaff = await db.get(sql`
        SELECT id FROM staff WHERE userId = ${userId}
      `);

      const staffId = existingStaff?.id || `staff_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      if (existingStaff) {
        // Update existing staff
        await db.run(sql`
          UPDATE staff
          SET
            name = ${staff.name},
            role = ${staff.role},
            bio = ${staff.bio},
            expertise = ${JSON.stringify(staff.expertise)},
            updated_at = unixepoch()
          WHERE id = ${staffId}
        `);
        console.log(`  ✓ Updated staff entry for ${staff.name}`);
      } else {
        // Create new staff entry
        await db.run(sql`
          INSERT INTO staff (
            id, userId, name, role, bio, expertise,
            order_position, is_visible, created_at, updated_at
          )
          VALUES (
            ${staffId}, ${userId}, ${staff.name}, ${staff.role},
            ${staff.bio}, ${JSON.stringify(staff.expertise)},
            0, 1, unixepoch(), unixepoch()
          )
        `);
        console.log(`  ✓ Created staff entry for ${staff.name}`);
      }

      // Check if ucon_roles entry exists
      const existingUconRole = await db.get(sql`
        SELECT id FROM ucon_roles WHERE userId = ${userId}
      `);

      // Determine role based on clearance
      const roleId = staff.clearance === 100 ? 'admin' : 'staff';

      if (existingUconRole) {
        // Update existing ucon_role
        await db.run(sql`
          UPDATE ucon_roles
          SET
            roleId = ${roleId},
            staffTitle = ${staff.staffTitle},
            permissionClearance = ${staff.clearance},
            dutyClearance = ${staff.clearance}
          WHERE id = ${existingUconRole.id}
        `);
        console.log(`  ✓ Updated Ucon Role: ${staff.staffTitle} (Clearance: ${staff.clearance})`);
      } else {
        // Create new ucon_role
        const uconRoleId = `ucon_role_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await db.run(sql`
          INSERT INTO ucon_roles (
            id, userId, roleId, staffTitle, 
            permissionClearance, dutyClearance, assignedAt
          )
          VALUES (
            ${uconRoleId}, ${userId}, ${roleId}, ${staff.staffTitle},
            ${staff.clearance}, ${staff.clearance}, unixepoch()
          )
        `);
        console.log(`  ✓ Created Ucon Role: ${staff.staffTitle} (Clearance: ${staff.clearance})`);
      }

      console.log('');
    }

    // Step 5: Verify setup
    console.log('📊 Verification:\n');
    
    const staffCount = await db.get(sql`SELECT COUNT(*) as count FROM staff`);
    const ucmCount = await db.get(sql`SELECT COUNT(*) as count FROM user WHERE email LIKE '%@uconministries.org'`);
    const uconRolesCount = await db.get(sql`SELECT COUNT(*) as count FROM ucon_roles`);

    console.log(`✓ Staff entries: ${staffCount?.count || 0}`);
    console.log(`✓ UCM users: ${ucmCount?.count || 0}`);
    console.log(`✓ Ucon Roles assigned: ${uconRolesCount?.count || 0}`);

    console.log('\n✅ Staff database setup complete!');
    console.log('\n📋 Summary:');
    console.log('   • All non-UCM staff deleted');
    console.log('   • Homepage/about staff created with UCM emails');
    console.log('   • Clearance levels assigned (UCM = Ucon Clearance Metrics)');
    console.log('   • Staff Permissions configured\n');

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
