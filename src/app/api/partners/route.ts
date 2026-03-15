import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { partnerOrganizations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    let query = db.select().from(partnerOrganizations);

    // Filter by category if provided
    if (category) {
      query = query.where(eq(partnerOrganizations.category, category));
    }

    // Filter by featured if provided
    if (featured === 'true') {
      query = query.where(eq(partnerOrganizations.isFeatured, true));
    }

    // Filter only active partners
    query = query.where(eq(partnerOrganizations.isActive, true));

    const partners = await query;

    // Group by category for easier frontend consumption
    const groupedPartners = partners.reduce((acc, partner) => {
      const category = partner.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(partner);
      return acc;
    }, {} as Record<string, typeof partners>);

    return NextResponse.json({
      partners,
      groupedPartners,
      total: partners.length
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newPartner = await db.insert(partnerOrganizations).values({
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(newPartner[0], { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
