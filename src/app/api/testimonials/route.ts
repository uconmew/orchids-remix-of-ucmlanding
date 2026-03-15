import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const all = searchParams.get('all'); // For admin to get all including unpublished

    let results;
    
    if (all === 'true') {
      // Admin view - get all testimonials
      results = await db
        .select()
        .from(testimonials)
        .orderBy(testimonials.sortOrder, desc(testimonials.createdAt));
    } else if (featured === 'true') {
      results = await db
        .select()
        .from(testimonials)
        .where(and(eq(testimonials.isPublished, true), eq(testimonials.isFeatured, true)))
        .orderBy(testimonials.sortOrder, desc(testimonials.createdAt));
    } else {
      results = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.isPublished, true))
        .orderBy(testimonials.sortOrder, desc(testimonials.createdAt));
    }

    // Deduplicate by name + quote (keep the first occurrence)
    const seen = new Set<string>();
    const dedupedResults = results.filter((t) => {
      const key = `${t.name}|${t.quote}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    const limitedResults = limit ? dedupedResults.slice(0, parseInt(limit)) : dedupedResults;

    return NextResponse.json(limitedResults);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const newTestimonial = await db.insert(testimonials).values({
      name: body.name,
      role: body.role,
      image: body.image || null,
      quote: body.quote,
      badge: body.badge || null,
      rating: body.rating || 5,
      isPublished: body.isPublished ?? false,
      isFeatured: body.isFeatured ?? false,
      sortOrder: body.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json(newTestimonial[0], { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const now = new Date().toISOString();

    const updatedTestimonial = await db
      .update(testimonials)
      .set({
        name: body.name,
        role: body.role,
        image: body.image || null,
        quote: body.quote,
        badge: body.badge || null,
        rating: body.rating || 5,
        isPublished: body.isPublished ?? false,
        isFeatured: body.isFeatured ?? false,
        sortOrder: body.sortOrder || 0,
        updatedAt: now,
      })
      .where(eq(testimonials.id, parseInt(id)))
      .returning();

    if (updatedTestimonial.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTestimonial[0]);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required" }, { status: 400 });
    }

    await db.delete(testimonials).where(eq(testimonials.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
