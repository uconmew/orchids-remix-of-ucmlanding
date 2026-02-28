import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { prayers } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

// Simple content moderation function
function moderateContent(text: string): { allowed: boolean; reason?: string } {
  const lowerText = text.toLowerCase();
  
  // Spam patterns
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner|click here|buy now)\b/gi,
    /\b(http|https|www\.)\S+/gi, // URLs
    /(.)\1{10,}/gi, // Repeated characters (spam indicator)
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi // Email addresses
  ];
  
  // Inappropriate language (basic list)
  const inappropriateWords = [
    'fuck', 'shit', 'bitch', 'asshole', 'damn', 'hell',
    'crap', 'bastard', 'piss', 'cock', 'dick', 'pussy'
  ];
  
  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return { allowed: false, reason: 'Spam or promotional content detected' };
    }
  }
  
  // Check for inappropriate language
  for (const word of inappropriateWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(text)) {
      return { allowed: false, reason: 'Inappropriate language detected' };
    }
  }
  
  // Check for excessive caps (spam indicator)
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  if (capsCount > text.length * 0.7 && text.length > 20) {
    return { allowed: false, reason: 'Excessive capitalization detected' };
  }
  
  return { allowed: true };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5000');
    
    const allPrayers = await db
      .select()
      .from(prayers)
      .orderBy(desc(prayers.createdAt))
      .limit(Math.min(limit, 5000));
    
    return NextResponse.json(allPrayers);
  } catch (error) {
    console.error('Error fetching prayers:', error);
    return NextResponse.json({ error: 'Failed to fetch prayers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, prayerRequest, category, isAnonymous, userId } = body;
    
    // Moderate prayer request content
    const moderation = moderateContent(prayerRequest);
    if (!moderation.allowed) {
      return NextResponse.json(
        { error: 'Your prayer request contains inappropriate content. Please revise and try again.' },
        { status: 400 }
      );
    }
    
    // Moderate name if provided
    if (name && !isAnonymous) {
      const nameModeration = moderateContent(name);
      if (!nameModeration.allowed) {
        return NextResponse.json(
          { error: 'Name contains inappropriate content. Please use a different name or submit anonymously.' },
          { status: 400 }
        );
      }
    }
    
    const now = new Date().toISOString();
    const newPrayer = await db.insert(prayers).values({
      name: isAnonymous ? null : name,
      userId: userId || null, // Store userId for logged in users to edit later
      prayerRequest,
      category,
      isAnonymous,
      prayCount: 0,
      prayers: [],
      opReply: null,
      createdAt: now,
      updatedAt: now
    }).returning();
    
    return NextResponse.json(newPrayer[0]);
  } catch (error) {
    console.error('Error creating prayer:', error);
    return NextResponse.json({ error: 'Failed to create prayer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const body = await request.json();
    const { action, prayerText, opReply, userId, newPrayerRequest, replyText, replyUserName } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Prayer ID is required' }, { status: 400 });
    }
    
    const prayer = await db.select().from(prayers).where(eq(prayers.id, id)).limit(1);
    
    if (prayer.length === 0) {
      return NextResponse.json({ error: 'Prayer not found' }, { status: 404 });
    }
    
    const currentPrayer = prayer[0];
    
    // Edit prayer action - only owner can edit
    if (action === 'editPrayer') {
      if (!userId || currentPrayer.userId !== userId) {
        return NextResponse.json({ error: 'You can only edit your own prayers' }, { status: 403 });
      }
      
      if (!newPrayerRequest || !newPrayerRequest.trim()) {
        return NextResponse.json({ error: 'Prayer request text is required' }, { status: 400 });
      }
      
      // Moderate edited content
      const moderation = moderateContent(newPrayerRequest);
      if (!moderation.allowed) {
        return NextResponse.json(
          { error: 'Your prayer request contains inappropriate content. Please revise and try again.' },
          { status: 400 }
        );
      }
      
      const updatedPrayer = await db
        .update(prayers)
        .set({
          prayerRequest: newPrayerRequest.trim(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(prayers.id, id))
        .returning();
      
      return NextResponse.json(updatedPrayer[0]);
    }
    
    // Add community reply - any logged in user can reply to community prayers
    if (action === 'addCommunityReply') {
      if (!replyText || !replyText.trim()) {
        return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
      }
      
      // Moderate reply content
      const moderation = moderateContent(replyText);
      if (!moderation.allowed) {
        return NextResponse.json(
          { error: 'Your reply contains inappropriate content. Please revise and try again.' },
          { status: 400 }
        );
      }
      
      const existingPrayers = Array.isArray(currentPrayer.prayers) ? currentPrayer.prayers : [];
      const newReplyEntry = {
        text: replyText.trim(),
        userName: replyUserName || 'Anonymous',
        userId: userId || null,
        isReply: true,
        createdAt: new Date().toISOString()
      };
      
      const updatedPrayer = await db
        .update(prayers)
        .set({
          prayers: [...existingPrayers, newReplyEntry],
          prayCount: (currentPrayer.prayCount || 0) + 1
        })
        .where(eq(prayers.id, id))
        .returning();
      
      return NextResponse.json(updatedPrayer[0]);
    }
    
    if (action === 'addPrayer') {
      // FIXED: Only add to messages array if prayerText is provided and not empty
      // Otherwise, just increment prayCount
      if (prayerText && prayerText.trim()) {
        // Moderate prayer message content
        const moderation = moderateContent(prayerText);
        if (!moderation.allowed) {
          return NextResponse.json(
            { error: 'Your message contains inappropriate content. Please revise and try again.' },
            { status: 400 }
          );
        }
        
        const existingPrayers = Array.isArray(currentPrayer.prayers) ? currentPrayer.prayers : [];
        const newPrayerEntry = {
          text: prayerText.trim(),
          createdAt: new Date().toISOString()
        };
        
        const updatedPrayer = await db
          .update(prayers)
          .set({
            prayers: [...existingPrayers, newPrayerEntry],
            prayCount: (currentPrayer.prayCount || 0) + 1
          })
          .where(eq(prayers.id, id))
          .returning();
        
        return NextResponse.json(updatedPrayer[0]);
      } else {
        // Just increment prayCount, don't add to messages
        const updatedPrayer = await db
          .update(prayers)
          .set({
            prayCount: (currentPrayer.prayCount || 0) + 1
          })
          .where(eq(prayers.id, id))
          .returning();
        
        return NextResponse.json(updatedPrayer[0]);
      }
    }
    
    if (action === 'addOpReply') {
      if (!opReply || !opReply.trim()) {
        return NextResponse.json({ error: 'OP reply text is required' }, { status: 400 });
      }
      
      // Moderate OP reply content
      const moderation = moderateContent(opReply);
      if (!moderation.allowed) {
        return NextResponse.json(
          { error: 'Your reply contains inappropriate content. Please revise and try again.' },
          { status: 400 }
        );
      }
      
      if (currentPrayer.opReply) {
        return NextResponse.json({ error: 'OP reply already exists' }, { status: 400 });
      }
      
      const updatedPrayer = await db
        .update(prayers)
        .set({
          opReply: opReply.trim()
        })
        .where(eq(prayers.id, id))
        .returning();
      
      return NextResponse.json(updatedPrayer[0]);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating prayer:', error);
    return NextResponse.json({ error: 'Failed to update prayer' }, { status: 500 });
  }
}