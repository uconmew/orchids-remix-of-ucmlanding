import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobApplications } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/job-applications/[id] - Fetch single application (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const application = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, parseInt(id)))
      .limit(1);

    if (application.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application[0]);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// PUT /api/job-applications/[id] - Update application status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      status,
      reviewedBy,
      interviewDate,
      notes,
    } = body;

    const now = new Date().toISOString();

    const updateData: any = {
      updatedAt: now,
    };

    if (status) updateData.status = status;
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = now;
    }
    if (interviewDate !== undefined) updateData.interviewDate = interviewDate;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await db
      .update(jobApplications)
      .set(updateData)
      .where(eq(jobApplications.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE /api/job-applications/[id] - Delete application (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db
      .delete(jobApplications)
      .where(eq(jobApplications.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
