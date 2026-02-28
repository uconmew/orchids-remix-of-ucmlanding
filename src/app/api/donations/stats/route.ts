import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donations, donationSubscriptions } from '@/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    const [
      totalOneTimeResult,
      totalRecurringResult,
      completedDonationsResult,
      activeSubscriptionsResult,
      recentDonationsResult,
      recentSubscriptionsResult,
    ] = await Promise.all([
      db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(donations)
        .where(eq(donations.status, 'completed')),
      db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(donationSubscriptions)
        .where(eq(donationSubscriptions.status, 'active')),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(donations)
        .where(eq(donations.status, 'completed')),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(donationSubscriptions)
        .where(eq(donationSubscriptions.status, 'active')),
      db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(donations)
        .where(
          and(
            eq(donations.status, 'completed'),
            gte(donations.createdAt, thirtyDaysAgoStr)
          )
        ),
      db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(donationSubscriptions)
        .where(
          and(
            eq(donationSubscriptions.status, 'active'),
            gte(donationSubscriptions.createdAt, thirtyDaysAgoStr)
          )
        ),
    ]);

    const totalOneTime = totalOneTimeResult[0]?.total || 0;
    const totalRecurring = totalRecurringResult[0]?.total || 0;
    const completedDonations = completedDonationsResult[0]?.count || 0;
    const activeSubscriptions = activeSubscriptionsResult[0]?.count || 0;
    const recentOneTime = recentDonationsResult[0]?.total || 0;
    const recentRecurring = recentSubscriptionsResult[0]?.total || 0;

    return NextResponse.json({
      totalRaised: totalOneTime + totalRecurring,
      totalOneTime,
      monthlyRecurring: totalRecurring,
      totalDonations: completedDonations,
      activeSubscriptions,
      last30Days: {
        oneTime: recentOneTime,
        recurring: recentRecurring,
        total: recentOneTime + recentRecurring,
      },
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation statistics' },
      { status: 500 }
    );
  }
}
