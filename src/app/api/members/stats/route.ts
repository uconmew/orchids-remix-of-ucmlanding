import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { convicts } from '@/db/schema';
import { eq, sql, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Calculate 30 days ago from current date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    // Get total members count
    const totalMembersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(convicts);
    const totalMembers = totalMembersResult[0]?.count || 0;

    // Get counts by member type (now convictType)
    const byTypeResult = await db
      .select({
        convictType: convicts.convictType,
        count: sql<number>`count(*)`
      })
      .from(convicts)
      .groupBy(convicts.convictType);

    const byType = {
      workshop_participant: 0,
      outreach_participant: 0,
      ministry_volunteer: 0,
      newsletter_subscriber: 0,
      registered_user: 0
    };

    byTypeResult.forEach(row => {
      if (row.convictType && row.convictType in byType) {
        byType[row.convictType as keyof typeof byType] = row.count;
      }
    });

    // Get counts by status
    const byStatusResult = await db
      .select({
        status: convicts.status,
        count: sql<number>`count(*)`
      })
      .from(convicts)
      .groupBy(convicts.status);

    const byStatus = {
      active: 0,
      inactive: 0,
      suspended: 0
    };

    byStatusResult.forEach(row => {
      if (row.status && row.status in byStatus) {
        byStatus[row.status as keyof typeof byStatus] = row.count;
      }
    });

    // Get recent joins (last 30 days)
    const recentJoinsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(convicts)
      .where(gte(convicts.joinedAt, thirtyDaysAgoISO));
    const recentJoins = recentJoinsResult[0]?.count || 0;

    // Get active this month (lastActivityAt in last 30 days)
    const activeThisMonthResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(convicts)
      .where(gte(convicts.lastActivityAt, thirtyDaysAgoISO));
    const activeThisMonth = activeThisMonthResult[0]?.count || 0;

    // Get top 5 cities by member count
    const byCityTop5Result = await db
      .select({
        city: convicts.city,
        count: sql<number>`count(*)`
      })
      .from(convicts)
      .where(sql`${convicts.city} IS NOT NULL AND ${convicts.city} != ''`)
      .groupBy(convicts.city)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    const byCityTop5 = byCityTop5Result.map(row => ({
      city: row.city,
      count: row.count
    }));

    // Build and return the statistics object
    const stats = {
      totalMembers,
      byType,
      byStatus,
      recentJoins,
      activeThisMonth,
      byCityTop5
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('GET /api/members/stats error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}