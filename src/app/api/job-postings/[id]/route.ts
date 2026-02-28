import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobPostings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/job-postings/[id] - Fetch single job posting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const job = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, parseInt(id)))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db
      .update(jobPostings)
      .set({ viewCount: (job[0].viewCount || 0) + 1 })
      .where(eq(jobPostings.id, parseInt(id)));

    return NextResponse.json(job[0]);
  } catch (error) {
    console.error('Error fetching job posting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job posting' },
      { status: 500 }
    );
  }
}

// PUT /api/job-postings/[id] - Update job posting (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      department,
      location,
      employmentType,
      salaryRange,
      description,
      responsibilities,
      qualifications,
      benefits,
      applicationDeadline,
      isPublished,
      isFeatured,
    } = body;

    const now = new Date().toISOString();

    // Check if job exists
    const existing = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    // Generate new slug if title changed
    let slug = existing[0].slug;
    if (title && title !== existing[0].title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now()}`;
    }

    const updateData: any = {
      updatedAt: now,
    };

    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (department) updateData.department = department;
    if (location) updateData.location = location;
    if (employmentType) updateData.employmentType = employmentType;
    if (salaryRange !== undefined) updateData.salaryRange = salaryRange;
    if (description) updateData.description = description;
    if (responsibilities) updateData.responsibilities = JSON.stringify(responsibilities);
    if (qualifications) updateData.qualifications = JSON.stringify(qualifications);
    if (benefits !== undefined) updateData.benefits = benefits ? JSON.stringify(benefits) : null;
    if (applicationDeadline !== undefined) updateData.applicationDeadline = applicationDeadline;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    // Handle publishing
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished && !existing[0].publishedAt) {
        updateData.publishedAt = now;
      } else if (!isPublished) {
        updateData.publishedAt = null;
      }
    }

    const updated = await db
      .update(jobPostings)
      .set(updateData)
      .where(eq(jobPostings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating job posting:', error);
    return NextResponse.json(
      { error: 'Failed to update job posting' },
      { status: 500 }
    );
  }
}

// DELETE /api/job-postings/[id] - Delete job posting (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db
      .delete(jobPostings)
      .where(eq(jobPostings.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    return NextResponse.json(
      { error: 'Failed to delete job posting' },
      { status: 500 }
    );
  }
}
