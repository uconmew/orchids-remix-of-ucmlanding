/**
 * Staff Database Cleanup & Setup Script
 * 
 * This script will:
 * 1. Delete all staff users EXCEPT those with @uconministries.org emails (UCM users)
 * 2. Create database entries for staff members shown on homepage and about page
 * 3. Assign each staff member a UCM (Ucon Clearance Metric)
 * 4. Set up proper Ucon Roles (staff-only roles)
 * 
 * Run with: bun run scripts/cleanup-and-setup-staff.ts
 */

import { db } from '../src/db';
import { user, uconRoles, roles } from '../src/db/schema';
import { eq, notLike } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

// Staff members from homepage (lines 144-186 in page.tsx)
const homepageStaff = [
  {
    name: "Founding Visionary Lead",
    email: "t.salazar@uconministries.org",
    role: "Founder & Executive Director",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/20250713_161156-1-1763993852854.jpg",
    bio: "Founded Ucon Ministries after personal transformation from addiction and justice system involvement. Leads strategic vision and ministry direction with 8 years of biblical experience and lived recovery journey.",
    expertise: ["Ministry Founder", "LDI Developer", "Peer Equal"],
    ucm: 100, // Highest clearance - Founder
    roleLevel: 100
  },
  {
    name: "Spiritual Formation Director",
    email: "c.adams@uconministries.org",
    role: "Biblical Integration",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/20251124_065619-1763993309149.jpg",
    bio: "Leads spiritual formation curriculum design and biblical integration across all ministry programs. Specializes in contemplative practices, theological education, and creating sacred spaces for authentic spiritual growth and transformation.",
    expertise: ["M.Div. Theology", "Biblical Counselor", "SME"],
    ucm: 90,
    roleLevel: 90
  },
  {
    name: "Clinical Director",
    email: "clinical.director@uconministries.org",
    role: "Mental Health & Clinical Excellence",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=75",
    bio: "Licensed clinical psychologist specializing in addiction recovery and trauma treatment, integrating evidence-based practices with faith-based principles.",
    expertise: ["Clinical Psychology", "Trauma-Informed Care", "SME"],
    ucm: 85,
    roleLevel: 85
  },
  {
    name: "Multiplication Director",
    email: "b.joseph@uconministries.org",
    role: "Ministry Programs",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_071419_Facebook-1763993696703.jpg",
    bio: "Oversees multiplication of ministry programs across all tiers and tracks, ensuring program quality, participant transformation success, and scalable impact.",
    expertise: ["LDI Developer", "Purpose Driven"],
    ucm: 80,
    roleLevel: 80
  },
  {
    name: "Outreach Coordinator",
    email: "outreach.coordinator@uconministries.org",
    role: "Community Engagement",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_072456_Gallery-1763994324892.jpg",
    bio: "Leads Track 3 outreach initiatives, coordinating volunteers and ensuring immediate crisis response to community needs 24/7.",
    expertise: ["Social Work", "Community Organizer"],
    ucm: 70,
    roleLevel: 70
  },
  {
    name: "Nicole Hedges",
    email: "n.hedges@uconministries.org",
    role: "Outreach Director",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_072323_Gallery-1763994456744.jpg",
    bio: "Hey. Yeah. Whatever.. as Outreach Director and convict, I live for the moments when barriers crumble and hearts connect across all the lines that usually divide us—because I believe love is the most powerful force for change, and it's meant to be tangible, hands-on, and radically inclusive.",
    expertise: ["Outreach Director", "Community Bridge", "Convict"],
    ucm: 75,
    roleLevel: 75
  }
];

// Additional staff from about page (lines 44-163 in AboutPage.tsx)
const additionalAboutStaff = [
  {
    name: "Troy Salazar",
    email: "t.salazar@uconministries.org", // Same as homepage - will merge
    phone: "720.663.9243"
  },
  {
    name: "Niko Owen's",
    email: "n.owens@uconministries.org",
    role: "Programs Coordinator",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251214_173822_Facebook-1765759125085.jpg",
    bio: "I'm the person who makes sure the beautiful vision of transformation actually happens on the ground—coordinating schedules, managing logistics, and keeping all the moving pieces flowing smoothly so that our team can focus on what matters most: changing lives with love and intention.",
    expertise: ["Program Coordination", "Logistics Management", "Operations Excellence"],
    ucm: 75,
    roleLevel: 75
  },
  {
    name: "Shandale Spiller",
    email: "shandale@uconministries.org",
    role: "Ucon Ambassador",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_072323_Gallery-1763994456744.jpg",
    bio: "I'm honored to be the face and voice of a mission that has touched my life in ways I'm still discovering—carrying the message of hope, redemption, and unconditional love wherever I go because I've experienced firsthand how transformative this community can be.",
    expertise: ["Brand Ambassador", "Community Relations", "Lived Experience"],
    ucm: 65,
    roleLevel: 65
  }
];

async function cleanupAndSetupStaff() {
  console.log('🚀 Starting Staff Database Cleanup & Setup...\n');

  try {
    // STEP 1: Delete all staff users EXCEPT UCM users
    console.log('📧 Step 1: Deleting all non-UCM users...');
    const deletedUsers = await db.delete(user)
      .where(notLike(user.email, '%@uconministries.org'))
      .returning();
    
    console.log(`✅ Deleted ${deletedUsers.length} non-UCM users\n`);

    // STEP 2: Create roles if they don't exist
    console.log('🎭 Step 2: Setting up role hierarchy...');
    
    const roleHierarchy = [
      { name: 'founder', description: 'Ministry Founder & Executive Director', level: 100 },
      { name: 'director', description: 'Department Director', level: 90 },
      { name: 'manager', description: 'Program Manager', level: 80 },
      { name: 'coordinator', description: 'Program Coordinator', level: 70 },
      { name: 'specialist', description: 'Subject Matter Expert', level: 60 },
      { name: 'staff', description: 'General Staff Member', level: 50 }
    ];

    for (const roleData of roleHierarchy) {
      const existingRole = await db.select().from(roles).where(eq(roles.name, roleData.name)).limit(1);
      
      if (existingRole.length === 0) {
        await db.insert(roles).values({
          name: roleData.name,
          description: roleData.description,
          level: roleData.level,
          createdAt: new Date().toISOString()
        });
        console.log(`✅ Created role: ${roleData.name} (Level ${roleData.level})`);
      }
    }
    console.log('');

    // STEP 3: Create staff user accounts and assign Ucon Roles
    console.log('👥 Step 3: Creating staff user accounts...\n');

    // Merge homepage and about staff (avoiding duplicates)
    const allStaff = [...homepageStaff];
    for (const aboutStaff of additionalAboutStaff) {
      const exists = allStaff.some(s => s.email === aboutStaff.email);
      if (!exists && aboutStaff.email) {
        allStaff.push(aboutStaff as any);
      }
    }

    for (const staffMember of allStaff) {
      // Check if user already exists
      const existingUser = await db.select().from(user)
        .where(eq(user.email, staffMember.email))
        .limit(1);

      let userId: string;

      if (existingUser.length > 0) {
        // Update existing user
        userId = existingUser[0].id;
        await db.update(user)
          .set({
            name: staffMember.name,
            image: staffMember.image || existingUser[0].image,
            bio: staffMember.bio || existingUser[0].bio,
            expertise: JSON.stringify(staffMember.expertise || []),
            phone: (staffMember as any).phone || existingUser[0].phone,
            updatedAt: new Date()
          })
          .where(eq(user.id, userId));
        
        console.log(`📝 Updated existing user: ${staffMember.name}`);
      } else {
        // Create new user
        const newUser = await db.insert(user).values({
          id: `staff_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: staffMember.name,
          email: staffMember.email,
          emailVerified: true,
          image: staffMember.image,
          bio: staffMember.bio,
          expertise: JSON.stringify(staffMember.expertise || []),
          phone: (staffMember as any).phone || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();

        userId = newUser[0].id;
        console.log(`✅ Created new user: ${staffMember.name}`);
      }

      // Assign Ucon Role (staff role) with UCM clearance
      const ucmValue = staffMember.ucm || 50;
      const roleLevel = staffMember.roleLevel || 50;
      
      // Determine role based on level
      let roleName = 'staff';
      if (roleLevel >= 100) roleName = 'founder';
      else if (roleLevel >= 90) roleName = 'director';
      else if (roleLevel >= 80) roleName = 'manager';
      else if (roleLevel >= 70) roleName = 'coordinator';
      else if (roleLevel >= 60) roleName = 'specialist';

      const staffRole = await db.select().from(roles)
        .where(eq(roles.name, roleName))
        .limit(1);

      if (staffRole.length > 0) {
        // Check if Ucon Role assignment already exists
        const existingUconRole = await db.select().from(uconRoles)
          .where(eq(uconRoles.userId, userId))
          .limit(1);

        if (existingUconRole.length > 0) {
          // Update existing assignment
          await db.update(uconRoles)
            .set({
              roleId: staffRole[0].id,
              staffTitle: staffMember.role,
              permissionClearance: ucmValue,
              dutyClearance: ucmValue
            })
            .where(eq(uconRoles.userId, userId));
          
          console.log(`   📊 Updated UCM: ${ucmValue} | Role: ${roleName}`);
        } else {
          // Create new Ucon Role assignment
          await db.insert(uconRoles).values({
            userId: userId,
            roleId: staffRole[0].id,
            staffTitle: staffMember.role,
            permissionClearance: ucmValue,
            dutyClearance: ucmValue,
            assignedAt: new Date().toISOString(),
            assignedBy: null
          });
          
          console.log(`   📊 Assigned UCM: ${ucmValue} | Role: ${roleName}`);
        }
      }

      console.log('');
    }

    // STEP 4: Summary
    console.log('📊 SUMMARY\n');
    console.log('✅ Staff cleanup and setup complete!');
    console.log(`✅ Total staff members: ${allStaff.length}`);
    console.log(`✅ All staff have UCM (Ucon Clearance Metrics) assigned`);
    console.log(`✅ Ucon Roles (staff-only roles) configured\n`);
    
    console.log('🎯 UCM Clearance Levels Assigned:');
    const sortedStaff = [...allStaff].sort((a, b) => (b.ucm || 0) - (a.ucm || 0));
    for (const s of sortedStaff) {
      console.log(`   ${(s.ucm || 50).toString().padStart(3)} - ${s.name} (${s.role})`);
    }

  } catch (error) {
    console.error('❌ Error during staff cleanup:', error);
    throw error;
  }
}

// Run the script
cleanupAndSetupStaff()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
