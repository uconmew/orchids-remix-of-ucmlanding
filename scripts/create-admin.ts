/**
 * Quick Script to Create Admin User
 * 
 * Usage:
 *   bun run scripts/create-admin.ts
 * 
 * This script helps you quickly create an admin user with full access
 */

async function createAdminUser() {
  console.log('🔐 UCon Ministries - Admin User Creation\n');

  // Configuration - CHANGE THESE VALUES
  const adminConfig = {
    email: 'admin@uconministries.org',
    name: 'System Administrator',
    password: 'AdminPass123!', // Change this to a secure password
    staffTitle: 'Founding Visionary Lead',
  };

  console.log('Creating admin user with:');
  console.log(`  Email: ${adminConfig.email}`);
  console.log(`  Name: ${adminConfig.name}`);
  console.log(`  Staff Title: ${adminConfig.staffTitle}`);
  console.log(`  Password: ********\n`);

  try {
    const response = await fetch('http://localhost:3000/api/admin/create-admin-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminConfig),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Admin user created successfully\n');
      console.log('📋 User Details:');
      console.log(`  ID: ${data.user.id}`);
      console.log(`  Name: ${data.user.name}`);
      console.log(`  Email: ${data.user.email}`);
      console.log(`  Role: ${data.user.role} (Level ${data.user.roleLevel})`);
      console.log(`  Staff Title: ${data.user.staffTitle}\n`);
      console.log('🔑 Login Credentials:');
      console.log(`  Email: ${adminConfig.email}`);
      console.log(`  Password: ${adminConfig.password}\n`);
      console.log('⚠️  IMPORTANT: Save these credentials securely!');
      console.log('    The password cannot be retrieved later.\n');
      console.log('🚀 Next Steps:');
      console.log('  1. Visit http://localhost:3000/staff-login');
      console.log('  2. Login with the credentials above');
      console.log('  3. Access the admin dashboard at /admin\n');
    } else {
      console.error('❌ ERROR:', data.error);
      if (data.details) {
        console.error('   Details:', data.details);
      }
    }
  } catch (error) {
    console.error('❌ FAILED to create admin user');
    console.error('   Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('\n   Make sure:');
    console.error('   - The development server is running (bun run dev)');
    console.error('   - The database is properly configured');
    console.error('   - All migrations have been run');
  }
}

// Run the script
createAdminUser();
