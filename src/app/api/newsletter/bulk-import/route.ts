import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { sql } from 'drizzle-orm';

// POST /api/newsletter/bulk-import - Import subscribers from CSV
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscribers } = body;

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data. Expected array of subscribers' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const sub of subscribers) {
      try {
        const { name, email, source = 'bulk_import' } = sub;

        // Validation
        if (!name || !email) {
          results.failed++;
          results.errors.push(`Missing name or email for entry: ${JSON.stringify(sub)}`);
          continue;
        }

        if (!emailRegex.test(email)) {
          results.failed++;
          results.errors.push(`Invalid email: ${email}`);
          continue;
        }

        // Check if email already exists
        const existing = await db
          .select()
          .from(newsletterSubscribers)
          .where(sql`${newsletterSubscribers.email} = ${email.toLowerCase()}`)
          .limit(1);

        if (existing.length > 0) {
          results.skipped++;
          continue;
        }

        // Insert new subscriber
        await db.insert(newsletterSubscribers).values({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          status: 'active',
          subscribedAt: now,
          source,
          tags: JSON.stringify(['bulk_import']),
          emailsSent: 0,
          createdAt: now,
          updatedAt: now,
        });

        results.success++;

      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error processing ${sub.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk import completed',
      results: {
        total: subscribers.length,
        success: results.success,
        failed: results.failed,
        skipped: results.skipped,
        errors: results.errors.slice(0, 10), // Return first 10 errors
      },
    });

  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk import', details: error.message },
      { status: 500 }
    );
  }
}