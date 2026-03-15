import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { outreachServiceStats, transitActivityLog, nourishActivityLog, neighborsActivityLog, voiceActivityLog, havenActivityLog, stepsActivityLog } from '@/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

const DEFAULT_STATS: Record<string, { stat1Label: string; stat2Label: string; stat3Label: string; stat4Label: string }> = {
  // Outreach Services (Track 3)
  transit: {
    stat1Label: 'Rides Monthly',
    stat2Label: 'Jobs Secured',
    stat3Label: 'Appointments',
    stat4Label: 'Hours Served'
  },
  nourish: {
    stat1Label: 'Meals Weekly',
    stat2Label: 'Families Served',
    stat3Label: 'Pantry Visits',
    stat4Label: 'Pounds Distributed'
  },
  neighbors: {
    stat1Label: 'Events Monthly',
    stat2Label: 'Volunteers',
    stat3Label: 'Partners',
    stat4Label: 'People Reached'
  },
  voice: {
    stat1Label: 'Cases Advocated',
    stat2Label: 'Policy Meetings',
    stat3Label: 'Rights Protected',
    stat4Label: 'Hours Served'
  },
  haven: {
    stat1Label: 'Sheltered Monthly',
    stat2Label: 'Housed Permanently',
    stat3Label: 'Vouchers Secured',
    stat4Label: 'Hours Served'
  },
  steps: {
    stat1Label: 'Crisis Calls',
    stat2Label: 'Rehab Placements',
    stat3Label: 'Recovery Support',
    stat4Label: 'Hours Served'
  },
  // Open Services (Track 2)
  equip: {
    stat1Label: 'Workshops Monthly',
    stat2Label: 'Participants',
    stat3Label: 'Skills Taught',
    stat4Label: 'Hours Served'
  },
  awaken: {
    stat1Label: 'Bible Studies',
    stat2Label: 'Participants',
    stat3Label: 'Topics Covered',
    stat4Label: 'Hours Served'
  },
  shepherd: {
    stat1Label: 'Counseling Sessions',
    stat2Label: 'Prayer Requests',
    stat3Label: 'Crisis Calls',
    stat4Label: 'Hours Served'
  },
  bridge: {
    stat1Label: 'Active Mentors',
    stat2Label: 'Mentees',
    stat3Label: 'Support Groups',
    stat4Label: 'Hours Served'
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (serviceId) {
      const statsList = await db.select().from(outreachServiceStats).where(eq(outreachServiceStats.serviceId, serviceId)).limit(1);
      const stats = statsList[0];
      
      if (stats) {
        return NextResponse.json({
          serviceId: stats.serviceId,
          stats: [
            { label: stats.stat1Label, value: stats.stat1Value.toString() },
            { label: stats.stat2Label, value: stats.stat2Value.toString() },
            { label: stats.stat3Label, value: stats.stat3Value.toString() },
            { label: stats.stat4Label, value: stats.stat4Value.toString() }
          ]
        });
      }

      const defaults = DEFAULT_STATS[serviceId];
      if (defaults) {
        return NextResponse.json({
          serviceId,
          stats: [
            { label: defaults.stat1Label, value: '0' },
            { label: defaults.stat2Label, value: '0' },
            { label: defaults.stat3Label, value: '0' },
            { label: defaults.stat4Label, value: '0' }
          ]
        });
      }

      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const allStats = await db.select().from(outreachServiceStats);
    
    const serviceIds = ['transit', 'nourish', 'neighbors', 'voice', 'haven', 'steps', 'equip', 'awaken', 'shepherd', 'bridge'];
    const result: Record<string, any> = {};
    
    for (const id of serviceIds) {
      const existing = allStats.find(s => s.serviceId === id);
      if (existing) {
        result[id] = {
          stats: [
            { label: existing.stat1Label, value: existing.stat1Value.toString() },
            { label: existing.stat2Label, value: existing.stat2Value.toString() },
            { label: existing.stat3Label, value: existing.stat3Value.toString() },
            { label: existing.stat4Label, value: existing.stat4Value.toString() }
          ]
        };
      } else {
        const defaults = DEFAULT_STATS[id];
        result[id] = {
          stats: [
            { label: defaults.stat1Label, value: '0' },
            { label: defaults.stat2Label, value: '0' },
            { label: defaults.stat3Label, value: '0' },
            { label: defaults.stat4Label, value: '0' }
          ]
        };
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching outreach stats:', error);
    return NextResponse.json({ error: 'Failed to fetch outreach stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, stat1Label, stat1Value, stat2Label, stat2Value, stat3Label, stat3Value, stat4Label, stat4Value } = body;

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const defaults = DEFAULT_STATS[serviceId];
    
    const statsList = await db.select().from(outreachServiceStats).where(eq(outreachServiceStats.serviceId, serviceId)).limit(1);
    const existing = statsList[0];

    if (existing) {
      await db.update(outreachServiceStats)
        .set({
          stat1Label: stat1Label || existing.stat1Label,
          stat1Value: stat1Value ?? existing.stat1Value,
          stat2Label: stat2Label || existing.stat2Label,
          stat2Value: stat2Value ?? existing.stat2Value,
          stat3Label: stat3Label || existing.stat3Label,
          stat3Value: stat3Value ?? existing.stat3Value,
          stat4Label: stat4Label || existing.stat4Label,
          stat4Value: stat4Value ?? existing.stat4Value,
          updatedAt: now
        })
        .where(eq(outreachServiceStats.serviceId, serviceId));
    } else {
      await db.insert(outreachServiceStats).values({
        serviceId,
        stat1Label: stat1Label || defaults?.stat1Label || 'Stat 1',
        stat1Value: stat1Value ?? 0,
        stat2Label: stat2Label || defaults?.stat2Label || 'Stat 2',
        stat2Value: stat2Value ?? 0,
        stat3Label: stat3Label || defaults?.stat3Label || 'Stat 3',
        stat3Value: stat3Value ?? 0,
        stat4Label: stat4Label || defaults?.stat4Label || 'Stat 4',
        stat4Value: stat4Value ?? 0,
        createdAt: now,
        updatedAt: now
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating outreach stats:', error);
    return NextResponse.json({ error: 'Failed to update outreach stats' }, { status: 500 });
  }
}
