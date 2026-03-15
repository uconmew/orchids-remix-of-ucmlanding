import { db } from '@/db';
import { account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function main() {
    // Generate fresh bcrypt hash with 10 salt rounds
    const newPasswordHash = await bcrypt.hash('Admin123!', 10);
    
    console.log('Generated new password hash:', newPasswordHash);
    console.log('Hash format:', newPasswordHash.substring(0, 4));
    
    // Update the account table
    await db.update(account)
        .set({
            password: newPasswordHash,
            updatedAt: Date.now(),
        })
        .where(
            and(
                eq(account.userId, 'admin_user_01'),
                eq(account.providerId, 'credential')
            )
        );
    
    // Query and verify the updated record
    const updatedAccount = await db.select()
        .from(account)
        .where(
            and(
                eq(account.userId, 'admin_user_01'),
                eq(account.providerId, 'credential')
            )
        )
        .limit(1);
    
    if (updatedAccount.length > 0) {
        console.log('\n✅ Password updated successfully for admin@ucon.test');
        console.log('Updated account record:');
        console.log('- User ID:', updatedAccount[0].userId);
        console.log('- Provider ID:', updatedAccount[0].providerId);
        console.log('- Password Hash:', updatedAccount[0].password);
        console.log('- Hash starts with:', updatedAccount[0].password?.substring(0, 4));
        console.log('- Updated At:', new Date(updatedAccount[0].updatedAt as number).toISOString());
    } else {
        console.error('⚠️ No account found for admin_user_01 with credential provider');
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});