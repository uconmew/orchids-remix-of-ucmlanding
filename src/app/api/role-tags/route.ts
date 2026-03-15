import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { roleTags, user, userRoles, ucmLevels, ROLE_TAGS } from '@/db/schema';
import { eq, and, asc, inArray } from 'drizzle-orm';

const VALID_TAGS = [
  'convict', 'staff', 'admin',
  'director', 'coordinator', 'executive', 'mentor', 'volunteer', 'facilitator'
] as const;
type ValidTag = typeof VALID_TAGS[number];

export function getTagsForRoleLevel(level: number): ValidTag[] {
  if (level === 1) {
    return ['admin', 'staff', 'convict', 'executive', 'director'];
  } else if (level === 2) {
    return ['staff', 'convict', 'director'];
  } else if (level === 3) {
    return ['staff', 'convict', 'coordinator'];
  } else if (level === 4) {
    return ['staff', 'convict'];
  } else {
    return ['convict', 'volunteer'];
  }
}

export function canApproveAuditChanges(tags: string[]): boolean {
  return tags.some(tag => ['executive', 'director'].includes(tag));
}

export function getRequiredApproverLevel(changeType: string): number {
  const auditLevelChanges = ['audit_delete', 'staff_name_change', 'operational_change', 'role_change'];
  if (auditLevelChanges.includes(changeType)) {
    return 2;
  }
  return 3;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    const tags = await db
      .select({
        id: roleTags.id,
        userId: roleTags.userId,
        tag: roleTags.tag,
        assignedAt: roleTags.assignedAt,
        assignedBy: roleTags.assignedBy,
      })
      .from(roleTags)
      .where(eq(roleTags.userId, userId))
      .orderBy(asc(roleTags.tag));

    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error('GET role-tags error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tag, assignedBy } = body;

    if (!userId || !tag) {
      return NextResponse.json({ 
        error: "userId and tag are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    if (!VALID_TAGS.includes(tag)) {
      return NextResponse.json({ 
        error: `Invalid tag. Valid tags are: ${VALID_TAGS.join(', ')}`,
        code: "INVALID_TAG" 
      }, { status: 400 });
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    const existingTag = await db
      .select()
      .from(roleTags)
      .where(and(
        eq(roleTags.userId, userId),
        eq(roleTags.tag, tag)
      ))
      .limit(1);

    if (existingTag.length > 0) {
      return NextResponse.json({ 
        error: "User already has this tag assigned",
        code: "DUPLICATE_TAG" 
      }, { status: 400 });
    }

    const [newTag] = await db
      .insert(roleTags)
      .values({
        userId,
        tag,
        assignedAt: new Date().toISOString(),
        assignedBy: assignedBy || null,
      })
      .returning();

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('POST role-tags error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const tag = searchParams.get('tag');

    if (id) {
      const existingTag = await db
        .select()
        .from(roleTags)
        .where(eq(roleTags.id, parseInt(id)))
        .limit(1);

      if (existingTag.length === 0) {
        return NextResponse.json({ 
          error: "Role tag not found",
          code: "TAG_NOT_FOUND" 
        }, { status: 404 });
      }

      await db.delete(roleTags).where(eq(roleTags.id, parseInt(id)));

      return NextResponse.json({
        message: "Role tag deleted successfully",
        deletedTag: existingTag[0]
      }, { status: 200 });
    }

    if (userId && tag) {
      const existingTag = await db
        .select()
        .from(roleTags)
        .where(and(
          eq(roleTags.userId, userId),
          eq(roleTags.tag, tag)
        ))
        .limit(1);

      if (existingTag.length === 0) {
        return NextResponse.json({ 
          error: "Role tag not found for this user",
          code: "TAG_NOT_FOUND" 
        }, { status: 404 });
      }

      await db.delete(roleTags).where(and(
        eq(roleTags.userId, userId),
        eq(roleTags.tag, tag)
      ));

      return NextResponse.json({
        message: "Role tag deleted successfully",
        deletedTag: existingTag[0]
      }, { status: 200 });
    }

    return NextResponse.json({ 
      error: "Either id or (userId and tag) parameters are required",
      code: "MISSING_PARAMETERS" 
    }, { status: 400 });
  } catch (error) {
    console.error('DELETE role-tags error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
