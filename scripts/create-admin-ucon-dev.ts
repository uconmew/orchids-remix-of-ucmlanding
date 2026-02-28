/**
 * Create Admin User: admin@ucon.dev
 * 
 * Usage:
 *   bun run scripts/create-admin-ucon-dev.ts
 * 
 * Creates admin@ucon.dev with:
 * - Level 1 Clearance (Executive Leadership)
 * - All 35 Permissions (Full Access)
 * - Staff Title: Founding Visionary Lead
 */

async function createAdminUconDev() {
  console.log('🔐 UCon Ministries - Creating admin@ucon.dev with Full Access\n');

  const adminConfig = {
    email: 'admin@ucon.dev',
    name: 'Admin Ucon',
    password: 'AdminUcon2024!', // Change this to desired password
    staffTitle: 'Founding Visionary Lead',
  };

  console.log('Creating admin user with:');
  console.log(`  Email: ${adminConfig.email}`);
  console.log(`  Name: ${adminConfig.name}`);
  console.log(`  Staff Title: ${adminConfig.staffTitle}`);
  console.log(`  Access Level: Level 1 - Executive Leadership (All 35 Permissions)`);
  console.log(`  Password: ********\n`);

  try {
    // Use the admin creation endpoint
    const response = await fetch('http://localhost:3000/api/admin/create-admin-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminConfig),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ SUCCESS! admin@ucon.dev created with full access\n');
      console.log('📋 Admin Details:');
      console.log(`  User ID: ${data.user.id}`);
      console.log(`  Name: ${data.user.name}`);
      console.log(`  Email: ${data.user.email}`);
      console.log(`  Role: ${data.user.role}`);
      console.log(`  Role Level: ${data.user.roleLevel} (Full Access)`);
      console.log(`  Staff Title: ${data.user.staffTitle}\n`);
      
      console.log('🔑 Login Credentials:');
      console.log(`  Email: ${adminConfig.email}`);
      console.log(`  Password: ${adminConfig.password}\n`);
      
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
      console.log('  ... and 22 more permissions\n');
      
      console.log('⚠️  IMPORTANT: Save these credentials securely!');
      console.log('    The password cannot be retrieved later.\n');
      
      console.log('🚀 Next Steps:');
      console.log('  1. Visit http://localhost:3000/staff-login');
      console.log('  2. Login with:');
      console.log(`     Email: ${adminConfig.email}`);
      console.log(`     Password: ${adminConfig.password}`);
      console.log('  3. Access the admin dashboard at /admin');
      console.log('  4. Access auth-status tool at /auth-status');
      console.log('  5. This user has FULL ACCESS to all features\n');
      
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
    } else {
      console.error('❌ ERROR:', data.error || 'Unknown error');
      if (data.details) {
        console.error('   Details:', data.details);
      }
      
      if (data.error?.includes('already exists')) {
        console.log('\n💡 User already exists. Try one of these options:');
        console.log('   1. Login with existing credentials at /staff-login');
        console.log('   2. Use password reset at /staff-login/reset-password');
        console.log('   3. Delete the existing user from database and re-run this script');
        console.log('   4. Use a different email address\n');
      }
    }
  } catch (error) {
    console.error('❌ FAILED to create admin user');
    console.error('   Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('\n   Make sure:');
    console.error('   - The development server is running (bun run dev)');
    console.error('   - The database is properly configured');
    console.error('   - Level 1 role exists (Executive Leadership)');
    console.error('   - All migrations have been run');
    console.error('   - Database seeds have been executed\n');
  }
}

// Run the script
createAdminUconDev();
