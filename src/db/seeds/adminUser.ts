import { db } from '@/db';
import { user, account, userRoles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function main() {
  const testEmail = 'admin@ucon.test';
  const testPassword = 'Admin123!';
  
  try {
    // Check if user already exists
    const existingUser = await db.select().from(user).where(eq(user.email, testEmail)).limit(1);
    
    let userId: string;
    
    if (existingUser.length === 0) {
      // Hash password with bcrypt (10 salt rounds)
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      // Generate user ID in Better Auth compatible format
      userId = 'user_' + crypto.randomUUID().replace(/-/g, '').substring(0, 24);
      
      const now = Date.now();
      
      // Create user record
      await db.insert(user).values({
        id: userId,
        email: testEmail,
        name: 'Test Admin',
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now
      });
      
      console.log('✅ Test admin user created successfully with ID:', userId);
      
      // Create account record with hashed password
      const accountId = 'account_' + crypto.randomUUID().replace(/-/g, '').substring(0, 20);
      
      await db.insert(account).values({
        id: accountId,
        accountId: testEmail,
        providerId: 'credential',
        userId: userId,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now
      });
      
      console.log('✅ Account record created for admin user');
    } else {
      userId = existingUser[0].id;
      console.log('ℹ️ User already exists with ID:', userId);
    }
    
    // Check if role assignment already exists
    const existingRole = await db.select().from(userRoles).where(
      and(eq(userRoles.userId, userId), eq(userRoles.roleId, 1))
    ).limit(1);
    
    if (existingRole.length === 0) {
      // Assign Executive Leadership role (roleId: 1)
      await db.insert(userRoles).values({
        userId: userId,
        roleId: 1,
        staffTitle: 'System Administrator',
        assignedBy: userId,
        assignedAt: new Date().toISOString()
      });
      
      console.log('✅ Executive Leadership role assigned to admin user');
    } else {
      console.log('ℹ️ Role already assigned, skipping assignment');
    }
    
    console.log('\n✅ Admin seeder completed successfully');
    console.log('📧 Email: admin@ucon.test');
    console.log('🔑 Password: Admin123!');
    
  } catch (error) {
    console.error('❌ Admin seeder failed:', error);
    throw error;
  }
}

main().catch((error) => {
  console.error('❌ Seeder failed:', error);
  process.exit(1);
});