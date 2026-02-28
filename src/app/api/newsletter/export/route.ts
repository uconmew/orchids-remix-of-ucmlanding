import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/newsletter/export - Export subscribers as CSV
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || 'active';

    let query = db.select().from(newsletterSubscribers);

    if (status && status !== 'all') {
      query = query.where(eq(newsletterSubscribers.status, status as 'active' | 'unsubscribed'));
    }

    const subscribers = await query;

    // Generate CSV
    const headers = ['ID', 'Name', 'Email', 'Status', 'Source', 'Subscribed At', 'Unsubscribed At', 'Emails Sent'];
    const csvRows = [headers.join(',')];

    subscribers.forEach(sub => {
      const row = [
        sub.id,
        `"${sub.name}"`,
        sub.email,
        sub.status,
        sub.source || 'unknown',
        sub.subscribedAt,
        sub.unsubscribedAt || '',
        sub.emailsSent || 0,
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error: any) {
    console.error('Error exporting newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to export newsletter subscribers', details: error.message },
      { status: 500 }
    );
  }
}
