import { NextRequest, NextResponse } from 'next/server';

// Gemini AI API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAftop9YrTYGWqT31K5YcK7OFkCq5ON8WA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Content moderation - check for inappropriate content
function moderateContent(text: string): { isAppropriate: boolean; reason?: string } {
  const inappropriatePatterns = [
    /\b(fuck|shit|bitch|ass|damn|hell|bastard|crap)\b/gi,
    /\b(sex|porn|xxx|nude|naked)\b/gi,
    /\b(kill|murder|suicide|death|die)\b/gi,
    /\b(hate|racist|nazi|terrorism)\b/gi,
    /\b(drug|cocaine|heroin|meth|weed)\b/gi,
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(text)) {
      return { 
        isAppropriate: false, 
        reason: 'Your message contains inappropriate content. Please keep your messages respectful and appropriate for our community.' 
      };
    }
  }

  return { isAppropriate: true };
}

// UCon Ministries context for Gemini
const MINISTRY_CONTEXT = `You are a helpful assistant for UCon Ministries, a Christian nonprofit organization focused on transformation and leadership development.

ABOUT UCON MINISTRIES:
Mission: UCon Ministries exists to meet individuals at their point of need, offering immediate practical assistance and guiding them through a comprehensive journey of healing and transformation. Our mission is to transform feelings of worthlessness and mental health struggles into enduring purpose and dignity for those deeply impacted by the justice system, addiction, homelessness, and personal brokenness.

Slogan: "Where Your Past Becomes Your Purpose"

THREE-TRACK MODEL:
1. Leadership Development Institute (LDI) - Track 1:
   - Intensive 64-week, four-tier commitment-based program
   - Tier 1: Ascension (Weeks 1-16) - Foundation and mental health restoration
   - Tier 2: Pinnacle (Weeks 17-32) - Mentorship development
   - Tier 3: Apex (Weeks 33-48) - Systemic leadership
   - Tier 4: UCon (Weeks 49-64) - Visionary leadership
   - Requires signed commitment agreement
   - Provides housing and comprehensive support

2. Open Ministry Services - Track 2:
   - No commitment required
   - Workshops: Financial literacy, communication, creative expression
   - Bible Studies: Weekly gatherings for spiritual growth
   - Pastoral Services: One-on-one counseling and 24/7 prayer support
   - Mentoring: Peer support and guidance

3. Outreach & Community Advocacy - Track 3:
   - Transportation services to essential appointments
   - Food drives and distribution
   - Shelter and housing assistance
   - Rehabilitation and referral services
   - Community involvement and advocacy

CORE VALUES:
- Inherent Dignity: Upholding intrinsic worth of every individual
- Purpose-Driven Recovery: Anchoring healing in purpose discovery
- Unconditional Connection: Radical empathy and non-judgmental presence
- Community Transformation: Fostering systemic change
- Biblical Integration: Weaving spiritual truth with evidence-based practices
- Outreach & Accessibility: Eliminating barriers to essential services

CONTACT:
- 24/7 Crisis Hotline: 720.663.9243
- Email: info@uconministries.org
- Location: Colorado

When answering questions:
1. Be compassionate, encouraging, and hope-filled
2. Direct people to appropriate resources within our three tracks
3. Emphasize that transformation is possible for everyone
4. Maintain a Christ-centered perspective while being inclusive
5. Provide specific, actionable information
6. Be brief but thorough (2-3 paragraphs max unless asked for more detail)`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ 
        error: 'Message is required',
        code: 'MISSING_MESSAGE' 
      }, { status: 400 });
    }

    // Content moderation
    const moderation = moderateContent(message);
    if (!moderation.isAppropriate) {
      return NextResponse.json({
        message: moderation.reason || 'Please keep your messages appropriate and respectful.',
        moderated: true
      }, { status: 200 });
    }

    // Prepare conversation history for Gemini
    const conversationHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add system context as the first message
    const messages = [
      {
        role: 'user',
        parts: [{ text: MINISTRY_CONTEXT }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I will act as a helpful, compassionate assistant for UCon Ministries, providing information about our programs, services, and helping people find the support they need. I will be Christ-centered, encouraging, and provide specific actionable guidance.' }]
      },
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text());
      // Fallback to basic response if Gemini fails
      return NextResponse.json({
        message: "I'm here to help you learn about UCon Ministries. We offer three tracks of support:\n\n1. **LDI Program**: Intensive 64-week leadership development for those ready to commit to transformation\n2. **Open Services**: No-commitment workshops, Bible studies, and pastoral care\n3. **Outreach**: Immediate crisis support including food, shelter, and transportation\n\nHow can I assist you today? Would you like to know more about any of our programs?",
        moderated: false
      }, { status: 200 });
    }

    const data = await geminiResponse.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm here to help! Could you please rephrase your question?";

    return NextResponse.json({
      message: aiMessage,
      moderated: false
    }, { status: 200 });

  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}