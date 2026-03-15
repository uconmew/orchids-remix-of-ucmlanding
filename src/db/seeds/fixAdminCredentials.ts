import { db } from '@/db';
import { account, userRoles } from '@/db/schema';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

async function main() {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const accountData = {
        id: 'account_' + randomUUID(),
        accountId: 'admin@ucon.test',
        providerId: 'credential',
        userId: 'admin_user_01',
        password: hashedPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    const roleAssignment = {
        userId: 'admin_user_01',
        roleId: 11,
        staffTitle: 'System Administrator',
        assignedAt: new Date().toISOString(),
        assignedBy: null,
    };

    await db.insert(account).values(accountData);
    await db.insert(userRoles).values(roleAssignment);
    
    console.log('✅ Admin credentials fixed successfully');
    console.log('📧 Email: admin@ucon.test');
    console.log('🔑 Password: Admin123!');
    console.log('👤 User ID: admin_user_01');
    console.log('🎭 Role ID: 11 (Executive Leadership)');
    console.log('📋 Staff Title: System Administrator');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});