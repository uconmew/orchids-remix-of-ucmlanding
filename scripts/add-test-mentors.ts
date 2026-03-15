import { db } from '../src/db';
import { roles, userRoles, user } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function addTestMentors() {
  console.log('Creating mentor role...');
  
  // Create or get mentor role with level 4
  const existingMentorRole = await db
    .select()
    .from(roles)
    .where(eq(roles.name, 'Mentor'))
    .limit(1);

  let mentorRole;
  if (existingMentorRole.length === 0) {
    const [newRole] = await db
      .insert(roles)
      .values({
        name: 'Mentor',
        description: 'LDI graduates actively mentoring Tier 1 and 2 participants',
        level: 4,
        createdAt: new Date().toISOString(),
      })
      .returning();
    mentorRole = newRole;
    console.log('Created new Mentor role:', mentorRole);
  } else {
    mentorRole = existingMentorRole[0];
    console.log('Using existing Mentor role:', mentorRole);
  }

  // Get existing users to assign as mentors
  const existingUsers = await db.select().from(user).limit(10);
  console.log(`Found ${existingUsers.length} existing users`);

  if (existingUsers.length === 0) {
    console.log('No users found. Please create users first.');
    process.exit(0);
  }

  // Assign first 5 users as mentors with level 4 clearance
  const usersToAssign = existingUsers.slice(0, Math.min(5, existingUsers.length));
  
  for (const userData of usersToAssign) {
    // Check if user already has this role
    const existingAssignment = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userData.id))
      .limit(1);

    if (existingAssignment.length === 0) {
      await db.insert(userRoles).values({
        userId: userData.id,
        roleId: mentorRole.id,
        staffTitle: 'Mentor',
        permissionClearance: 4,
        dutyClearance: 4,
        assignedAt: new Date().toISOString(),
      });
      console.log(`✓ Assigned ${userData.name} as Mentor with level 4 clearance`);
    } else {
      console.log(`- ${userData.name} already has a role assigned`);
    }
  }

  // Count active mentors
  const mentorCount = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.permissionClearance, 4));

  console.log(`\n✅ Total active mentors with level 4 clearance: ${mentorCount.length}`);
  
  process.exit(0);
}

addTestMentors().catch((error) => {
  console.error('Error adding test mentors:', error);
  process.exit(1);
});
