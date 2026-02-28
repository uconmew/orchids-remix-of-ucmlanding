import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobApplications, jobPostings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/job-applications - Fetch all applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobPostingId = searchParams.get('jobPostingId');
    const status = searchParams.get('status');

    let query = db.select().from(jobApplications);

    if (jobPostingId) {
      query = query.where(eq(jobApplications.jobPostingId, parseInt(jobPostingId))) as any;
    }

    if (status) {
      query = query.where(eq(jobApplications.status, status)) as any;
    }

    const applications = await query.orderBy(desc(jobApplications.submittedAt));

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST /api/job-applications - Submit new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      jobPostingId,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      resumeUrl,
      coverLetter,
      linkedinUrl,
      portfolioUrl,
      yearsOfExperience,
      currentEmployer,
      expectedSalary,
      availableStartDate,
      howDidYouHear,
      whyInterested,
      additionalInfo,
    } = body;

    // Validate required fields
    if (!jobPostingId || !firstName || !lastName || !email || !phone || !whyInterested) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify job posting exists
    const job = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, jobPostingId))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const newApplication = await db
      .insert(jobApplications)
      .values({
        jobPostingId,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        resumeUrl,
        coverLetter,
        linkedinUrl,
        portfolioUrl,
        yearsOfExperience,
        currentEmployer,
        expectedSalary,
        availableStartDate,
        howDidYouHear,
        whyInterested,
        additionalInfo,
        status: 'submitted',
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Increment application count on job posting
    await db
      .update(jobPostings)
      .set({ applicationCount: (job[0].applicationCount || 0) + 1 })
      .where(eq(jobPostings.id, jobPostingId));

    return NextResponse.json(newApplication[0], { status: 201 });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
