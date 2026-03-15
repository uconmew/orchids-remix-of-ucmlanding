/**
 * Create Full Permission Staff Member
 * 
 * Usage:
 *   bun run scripts/create-full-permission-staff.ts
 * 
 * Creates a staff member with:
 * - Level 1 Clearance (Executive Leadership)
 * - All 35 Permissions (Full Access)
 */

async function createFullPermissionStaff() {
  console.log('🔐 UCon Ministries - Full Permission Staff Creation\n');

  // Configuration - CHANGE THESE VALUES
  const staffConfig = {
    email: 'fullaccess@uconministries.org',
    firstName: 'Full',
    lastName: 'Access Admin',
    phone: '(555) 100-0001',
    password: 'FullAccess123!', // Change this to a secure password
    staffTitle: 'Executive Administrator',
    roleId: 11, // Level 1 - Executive Operations (updated to correct ID)
  };

  console.log('Creating full permission staff member with:');
  console.log(`  Email: ${staffConfig.email}`);
  console.log(`  Name: ${staffConfig.firstName} ${staffConfig.lastName}`);
  console.log(`  Phone: ${staffConfig.phone}`);
  console.log(`  Staff Title: ${staffConfig.staffTitle}`);
  console.log(`  Role: Level 1 - Executive Leadership (All 35 Permissions)`);
  console.log(`  Password: ********\n`);

  try {
    // Create the staff member via API
    const response = await fetch('http://localhost:3000/api/user-roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: staffConfig.firstName,
        lastName: staffConfig.lastName,
        email: staffConfig.email,
        phone: staffConfig.phone,
        roleId: staffConfig.roleId,
        staffTitle: staffConfig.staffTitle,
        initialPassword: staffConfig.password,
        assignedBy: null, // System-assigned
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Full permission staff member created\n');
      console.log('📋 Staff Details:');
      console.log(`  Registration: ${data.assignment.registrationNumber}`);
      console.log(`  Name: ${staffConfig.firstName} ${staffConfig.lastName}`);
      console.log(`  Email: ${data.assignment.userEmail}`);
      console.log(`  Phone: ${staffConfig.phone || 'N/A'}`);
      console.log(`  Role: Executive Leadership (Level 1)`);
      console.log(`  Staff Title: ${staffConfig.staffTitle}`);
      console.log(`  User ID: ${data.assignment.userId}\n`);
      
      console.log('🔑 Login Credentials:');
      console.log(`  Email: ${staffConfig.email}`);
      console.log(`  Password: ${staffConfig.password}\n`);
      
      console.log('✨ Permissions (All 35):');
      console.log('  ✅ View Dashboard');
      console.log('  ✅ Manage Staff');
      console.log('  ✅ Manage Roles');
      console.log('  ✅ Manage Permissions');
      console.log('  ✅ Manage Workshops');
      console.log('  ✅ Manage Events');
      console.log('  ✅ Manage Members');
      console.log('  ✅ Manage Prayers');
      console.log('  ✅ Manage Settings');
      console.log('  ... and 26 more permissions\n');
      
      if (data.emailSent) {
        console.log('📧 Email Status: ✅ Verification email sent successfully\n');
      } else {
        console.log('📧 Email Status: ⚠️  Email not sent (may need configuration)\n');
      }
      
      console.log('⚠️  IMPORTANT: Save these credentials securely!');
      console.log('    The password cannot be retrieved later.\n');
      
      console.log('🚀 Next Steps:');
      console.log('  1. Visit http://localhost:3000/staff-login');
      console.log('  2. Login with the credentials above');
      console.log('  3. Access the admin dashboard at /admin');
      console.log('  4. This user has FULL ACCESS to all features\n');
    } else {
      console.error('❌ ERROR:', data.error);
      if (data.details) {
        console.error('   Details:', data.details);
      }
    }
  } catch (error) {
    console.error('❌ FAILED to create staff member');
    console.error('   Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('\n   Make sure:');
    console.error('   - The development server is running (bun run dev)');
    console.error('   - The database is properly configured');
    console.error('   - Level 1 role exists (Executive Leadership)');
    console.error('   - All migrations have been run');
  }
}

// Run the script
createFullPermissionStaff();