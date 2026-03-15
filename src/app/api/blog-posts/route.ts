import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_CATEGORIES = ['news', 'testimony', 'update', 'announcement'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Blog post not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const publishedParam = searchParams.get('published');

    let query = db.select().from(blogPosts);
    const conditions = [];

    // Filter by category
    if (category) {
      if (!VALID_CATEGORIES.includes(category as any)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`, code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
      conditions.push(eq(blogPosts.category, category));
    }

    // Filter by published status
    if (publishedParam !== null) {
      const published = publishedParam === 'true';
      conditions.push(eq(blogPosts.published, published));
    }

    // Search by title
    if (search) {
      conditions.push(like(blogPosts.title, `%${search}%`));
    }

    // Apply filters
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Order by newest first and apply pagination
    const results = await query
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, author, category, featuredImageUrl, published, publishedAt } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Slug is required and must be a non-empty string', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string', code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    if (!author || typeof author !== 'string' || author.trim().length === 0) {
      return NextResponse.json(
        { error: 'Author is required and must be a non-empty string', code: 'MISSING_AUTHOR' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category as any)) {
      return NextResponse.json(
        { error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`, code: 'INVALID_CATEGORY' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug.trim()))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists', code: 'DUPLICATE_SLUG' },
        { status: 400 }
      );
    }

    const currentTimestamp = new Date().toISOString();
    const isPublished = published === true;

    // Auto-set publishedAt if published is true and publishedAt is not provided
    const finalPublishedAt = isPublished && !publishedAt ? currentTimestamp : publishedAt || null;

    const insertData = {
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      excerpt: excerpt ? excerpt.trim() : null,
      author: author.trim(),
      category: category.trim(),
      featuredImageUrl: featuredImageUrl ? featuredImageUrl.trim() : null,
      published: isPublished,
      publishedAt: finalPublishedAt,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };

    const newPost = await db
      .insert(blogPosts)
      .values(insertData)
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if blog post exists
    const existing = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, slug, content, excerpt, author, category, featuredImageUrl, published, publishedAt } = body;

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and update title
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    // Validate and update slug
    if (slug !== undefined) {
      if (typeof slug !== 'string' || slug.trim().length === 0) {
        return NextResponse.json(
          { error: 'Slug must be a non-empty string', code: 'INVALID_SLUG' },
          { status: 400 }
        );
      }

      // Check if slug already exists (excluding current post)
      const existingSlug = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug.trim()))
        .limit(1);

      if (existingSlug.length > 0 && existingSlug[0].id !== parseInt(id)) {
        return NextResponse.json(
          { error: 'A blog post with this slug already exists', code: 'DUPLICATE_SLUG' },
          { status: 400 }
        );
      }

      updates.slug = slug.trim();
    }

    // Validate and update content
    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Content must be a non-empty string', code: 'INVALID_CONTENT' },
          { status: 400 }
        );
      }
      updates.content = content.trim();
    }

    // Update excerpt
    if (excerpt !== undefined) {
      updates.excerpt = excerpt ? excerpt.trim() : null;
    }

    // Validate and update author
    if (author !== undefined) {
      if (typeof author !== 'string' || author.trim().length === 0) {
        return NextResponse.json(
          { error: 'Author must be a non-empty string', code: 'INVALID_AUTHOR' },
          { status: 400 }
        );
      }
      updates.author = author.trim();
    }

    // Validate and update category
    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category as any)) {
        return NextResponse.json(
          { error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`, code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
      updates.category = category.trim();
    }

    // Update featured image URL
    if (featuredImageUrl !== undefined) {
      updates.featuredImageUrl = featuredImageUrl ? featuredImageUrl.trim() : null;
    }

    // Handle published status and publishedAt
    if (published !== undefined) {
      updates.published = published === true;

      // If changing from false to true and publishedAt is not set
      if (updates.published && !existing[0].publishedAt && publishedAt === undefined) {
        updates.publishedAt = new Date().toISOString();
      }
    }

    // Update publishedAt if explicitly provided
    if (publishedAt !== undefined) {
      updates.publishedAt = publishedAt || null;
    }

    const updated = await db
      .update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if blog post exists
    const existing = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Blog post deleted successfully',
        deletedPost: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}