import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobPostings } from '@/db/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';

// GET /api/job-postings - Fetch all published job postings (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const employmentType = searchParams.get('employmentType');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    // Build filter conditions
    const conditions = [];
    
    if (!includeUnpublished) {
      conditions.push(eq(jobPostings.isPublished, true));
    }
    
    if (department) {
      conditions.push(eq(jobPostings.department, department));
    }
    
    if (employmentType) {
      conditions.push(eq(jobPostings.employmentType, employmentType));
    }
    
    if (location) {
      conditions.push(like(jobPostings.location, `%${location}%`));
    }
    
    if (search) {
      conditions.push(
        or(
          like(jobPostings.title, `%${search}%`),
          like(jobPostings.description, `%${search}%`)
        )
      );
    }

    const jobs = await db
      .select()
      .from(jobPostings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(jobPostings.isFeatured), desc(jobPostings.createdAt));

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job postings' },
      { status: 500 }
    );
  }
}

// POST /api/job-postings - Create new job posting (admin only)
export async function POST(request: NextRequest) {
  try {
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
      isPublished = false,
      isFeatured = false,
      postedBy,
    } = body;

    // Validate required fields
    if (!title || !department || !location || !employmentType || !description || !responsibilities || !qualifications) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const now = new Date().toISOString();

    const newJob = await db
      .insert(jobPostings)
      .values({
        title,
        slug: `${slug}-${Date.now()}`,
        department,
        location,
        employmentType,
        salaryRange,
        description,
        responsibilities: JSON.stringify(responsibilities),
        qualifications: JSON.stringify(qualifications),
        benefits: benefits ? JSON.stringify(benefits) : null,
        applicationDeadline,
        isPublished,
        isFeatured,
        postedBy,
        publishedAt: isPublished ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newJob[0], { status: 201 });
  } catch (error) {
    console.error('Error creating job posting:', error);
    return NextResponse.json(
      { error: 'Failed to create job posting' },
      { status: 500 }
    );
  }
}
