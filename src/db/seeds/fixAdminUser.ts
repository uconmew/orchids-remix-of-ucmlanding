import { db } from '@/db';
import { user, account, userRoles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

async function main() {
    try {
        const adminEmail = 'admin@ucon.test';
        const plainPassword = 'Admin123!';
        
        // Check if user already exists
        const existingUser = await db.select().from(user).where(eq(user.email, adminEmail)).limit(1);
        
        let userId: string;
        
        if (existingUser.length > 0) {
            // User exists - update credentials
            userId = existingUser[0].id;
            console.log('📝 Found existing admin user with ID:', userId);
            
            // Hash the password
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            
            // Update user with verified email
            await db.update(user)
                .set({
                    emailVerified: true,
                    updatedAt: Date.now(),
                })
                .where(eq(user.id, userId));
            
            // Check if account exists
            const existingAccount = await db.select()
                .from(account)
                .where(eq(account.userId, userId))
                .where(eq(account.providerId, 'credential'))
                .limit(1);
            
            if (existingAccount.length > 0) {
                // Update existing account
                await db.update(account)
                    .set({
                        password: hashedPassword,
                        updatedAt: Date.now(),
                    })
                    .where(eq(account.id, existingAccount[0].id));
                
                console.log('🔄 Updated existing credential account');
            } else {
                // Create new account
                const accountId = 'account_' + crypto.randomUUID();
                await db.insert(account).values({
                    id: accountId,
                    accountId: adminEmail,
                    providerId: 'credential',
                    userId: userId,
                    password: hashedPassword,
                    accessToken: null,
                    refreshToken: null,
                    idToken: null,
                    accessTokenExpiresAt: null,
                    refreshTokenExpiresAt: null,
                    scope: null,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
                
                console.log('➕ Created new credential account');
            }
            
        } else {
            // User doesn't exist - create new
            userId = 'user_' + crypto.randomUUID().replace(/-/g, '').substring(0, 24);
            console.log('🆕 Creating new admin user with ID:', userId);
            
            // Hash the password
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            
            // Insert user
            await db.insert(user).values({
                id: userId,
                email: adminEmail,
                name: 'System Administrator',
                emailVerified: true,
                image: null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            
            // Insert account
            const accountId = 'account_' + crypto.randomUUID();
            await db.insert(account).values({
                id: accountId,
                accountId: adminEmail,
                providerId: 'credential',
                userId: userId,
                password: hashedPassword,
                accessToken: null,
                refreshToken: null,
                idToken: null,
                accessTokenExpiresAt: null,
                refreshTokenExpiresAt: null,
                scope: null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            
            console.log('✅ Created user and credential account');
        }
        
        // Ensure userRoles assignment exists for Executive Leadership (roleId: 11)
        const existingRole = await db.select()
            .from(userRoles)
            .where(eq(userRoles.userId, userId))
            .where(eq(userRoles.roleId, 11))
            .limit(1);
        
        if (existingRole.length === 0) {
            await db.insert(userRoles).values({
                userId: userId,
                roleId: 11,
                staffTitle: 'System Administrator',
                assignedAt: new Date().toISOString(),
                assignedBy: null,
            });
            console.log('👑 Assigned Executive Leadership role (ID: 11)');
        } else {
            console.log('✓ Executive Leadership role already assigned');
        }
        
        // Log final details
        console.log('\n🎉 Admin user setup completed successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User ID:', userId);
        console.log('Email:', adminEmail);
        console.log('Password:', plainPassword);
        console.log('Name: System Administrator');
        console.log('Email Verified: true');
        console.log('Role: Executive Leadership (ID: 11)');
        console.log('Staff Title: System Administrator');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✅ You can now login with these credentials');
        
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});