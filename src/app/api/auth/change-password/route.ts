import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate all required fields are provided
    if (!currentPassword || typeof currentPassword !== 'string' || currentPassword.trim() === '') {
      return NextResponse.json(
        { error: 'Current password is required', code: 'MISSING_CURRENT_PASSWORD' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
      return NextResponse.json(
        { error: 'New password is required', code: 'MISSING_NEW_PASSWORD' },
        { status: 400 }
      );
    }

    if (!confirmPassword || typeof confirmPassword !== 'string' || confirmPassword.trim() === '') {
      return NextResponse.json(
        { error: 'Password confirmation is required', code: 'MISSING_CONFIRM_PASSWORD' },
        { status: 400 }
      );
    }

    // Verify passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match', code: 'PASSWORDS_MISMATCH' },
        { status: 400 }
      );
    }

    // Validate new password complexity
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long', code: 'PASSWORD_TOO_SHORT' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter', code: 'PASSWORD_NO_UPPERCASE' },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one lowercase letter', code: 'PASSWORD_NO_LOWERCASE' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number', code: 'PASSWORD_NO_NUMBER' },
        { status: 400 }
      );
    }

    if (!/[@$!%*?&]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one special character (@$!%*?&)', code: 'PASSWORD_NO_SPECIAL_CHAR' },
        { status: 400 }
      );
    }

    // Query account for the authenticated user with credential provider
    const userAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, user.id),
          eq(account.providerId, 'credential')
        )
      )
      .limit(1);

    if (userAccount.length === 0) {
      return NextResponse.json(
        { error: 'Account not found', code: 'ACCOUNT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const userAccountData = userAccount[0];

    // Verify current password
    if (!userAccountData.password) {
      return NextResponse.json(
        { error: 'Account does not have a password set', code: 'NO_PASSWORD_SET' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, userAccountData.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect', code: 'INVALID_CURRENT_PASSWORD' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update account with new password
    const updatedAccount = await db
      .update(account)
      .set({
        password: hashedPassword,
        requiresPasswordChange: false,
        updatedAt: Date.now(),
      })
      .where(
        and(
          eq(account.userId, user.id),
          eq(account.providerId, 'credential')
        )
      )
      .returning();

    if (updatedAccount.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update password', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Password changed successfully',
        requiresPasswordChange: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/auth/change-password error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}