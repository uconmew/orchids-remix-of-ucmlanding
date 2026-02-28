import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { eq, count, sql } from 'drizzle-orm';

// GET /api/newsletter/stats - Get newsletter statistics
export async function GET(req: NextRequest) {
  try {
    // Total active subscribers
    const activeCount = await db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, 'active'));

    // Total unsubscribed
    const unsubscribedCount = await db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, 'unsubscribed'));

    // Total all time
    const totalCount = await db
      .select({ count: count() })
      .from(newsletterSubscribers);

    // Subscribers by source
    const bySource = await db
      .select({
        source: newsletterSubscribers.source,
        count: count(),
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, 'active'))
      .groupBy(newsletterSubscribers.source);

    // Recent subscribers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSubscribers = await db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(
        sql`${newsletterSubscribers.subscribedAt} >= ${thirtyDaysAgo.toISOString()} AND ${newsletterSubscribers.status} = 'active'`
      );

    // Growth rate (last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const lastWeek = await db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(
        sql`${newsletterSubscribers.subscribedAt} >= ${sevenDaysAgo.toISOString()} AND ${newsletterSubscribers.status} = 'active'`
      );

    const previousWeek = await db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(
        sql`${newsletterSubscribers.subscribedAt} >= ${fourteenDaysAgo.toISOString()} AND ${newsletterSubscribers.subscribedAt} < ${sevenDaysAgo.toISOString()} AND ${newsletterSubscribers.status} = 'active'`
      );

    const lastWeekCount = lastWeek[0]?.count || 0;
    const previousWeekCount = previousWeek[0]?.count || 0;
    const growthRate = previousWeekCount > 0 
      ? ((lastWeekCount - previousWeekCount) / previousWeekCount * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      success: true,
      stats: {
        active: activeCount[0]?.count || 0,
        unsubscribed: unsubscribedCount[0]?.count || 0,
        total: totalCount[0]?.count || 0,
        recentSubscribers: recentSubscribers[0]?.count || 0,
        growthRate: `${growthRate}%`,
        bySource: bySource.map(s => ({
          source: s.source || 'unknown',
          count: s.count,
        })),
      },
    });

  } catch (error: any) {
    console.error('Error fetching newsletter stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter stats', details: error.message },
      { status: 500 }
    );
  }
}
