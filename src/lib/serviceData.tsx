import { Truck, Utensils, Users, MessageSquare, Home, Stethoscope, GraduationCap, BookOpen, Heart, HandHeart } from "lucide-react";
import { ServiceModalData } from "@/components/ServiceModal";

export const outreachServices: Record<string, ServiceModalData> = {
  transit: {
    id: "transit",
    title: "UCON TRANSIT",
    subtitle: "Transportation to Transform Lives",
    icon: <Truck className="w-8 h-8 text-white" />,
    shortDescription: "Removing barriers to stability by providing transportation to essential services.",
    fullDescription: "UCON TRANSIT eliminates transportation as a barrier to transformation. We provide reliable, dignified transportation to job interviews, medical appointments, court dates, and housing connections. Every ride is an opportunity to build relationships and demonstrate that someone cares about your journey to stability and success.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/professional-photograph-of-a-modern-comm-c9ea36e2-20251124143645.jpg",
    features: [
      "Job interview transportation",
      "Medical appointment rides",
      "Court date transportation",
      "Housing connection visits",
      "Social services appointments",
      "Weekly grocery trips"
    ],
    benefits: [
      "Eliminates transportation barriers to employment",
      "Ensures medical care continuity",
      "Supports legal compliance and success",
      "Builds dignity through reliable service",
      "Creates mentoring opportunities during rides",
      "Connects individuals to essential resources"
    ],
    stats: [
      { label: "Rides Monthly", value: "0" },
      { label: "Jobs Secured", value: "0" },
      { label: "Appointments", value: "0" },
      { label: "Hours Served", value: "0" }
    ],
    contact: {
      phone: "(720) 370-6549",
      email: "transit@uconministries.org",
      hours: "Mon-Fri 7AM-7PM, Sat 9AM-5PM"
    },
    cta: {
      primary: { text: "Request a Ride", href: "/outreach#transit" },
      secondary: { text: "Become a Driver", href: "/volunteer#transit" }
    }
  },
  
  nourish: {
    id: "nourish",
    title: "UCON NOURISH",
    subtitle: "Nourishing Bodies, Feeding Hope",
    icon: <Utensils className="w-8 h-8 text-white" />,
    shortDescription: "Addressing food insecurity as a primary step toward stability and recovery.",
    fullDescription: "UCON NOURISH addresses food insecurity with dignity and compassion. We provide weekly food drives, maintain a community pantry, prepare hot meals, and partner with food banks to ensure no one in our community goes hungry. Food is our entry point for deeper relationships and comprehensive support.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/warm-photograph-of-community-food-distri-c574229f-20251124143645.jpg",
    features: [
      "Weekly food distribution drives",
      "Community pantry access",
      "Hot meal service (coming soon)",
      "Food bank partnerships",
      "Nutritional guidance",
      "Family meal packages"
    ],
    benefits: [
      "Immediate hunger relief for families",
      "Gateway to comprehensive services",
      "Community connection and belonging",
      "Reduced food insecurity stress",
      "Healthier nutrition options",
      "Emergency food assistance 24/7"
    ],
    stats: [
      { label: "Meals Weekly", value: "0" },
      { label: "Families Served", value: "0" },
      { label: "Pantry Visits", value: "0" },
      { label: "Pounds Distributed", value: "0" }
    ],
    contact: {
      phone: "(720) 663-9243",
      email: "nourish@uconministries.org",
      hours: "Food Pantry: Tue/Thu 10AM-2PM, Sat 12PM-4PM"
    },
    cta: {
      primary: { text: "Get Food Assistance", href: "/outreach#nourish" },
      secondary: { text: "Donate Food", href: "/donations#food" }
    }
  },
  
  neighbors: {
    id: "neighbors",
    title: "UCON NEIGHBORS",
    subtitle: "Building Community Through Presence",
    icon: <Users className="w-8 h-8 text-white" />,
    shortDescription: "Active presence building trust and creating organic relationship opportunities.",
    fullDescription: "UCON NEIGHBORS is our intentional presence in the community. Through clean-ups, collaborations, festivals, and partnerships, we build trust and create opportunities for transformation. We show up consistently, building relationships that become pathways to hope and healing.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/community-members-working-together-on-ne-9c2d6c9e-20251124143645.jpg",
    features: [
      "Monthly community clean-ups",
      "Non-profit collaborations",
      "Community festival participation",
      "Strategic partnership initiatives",
      "Neighborhood block parties",
      "Youth mentoring events"
    ],
    benefits: [
      "Builds neighborhood trust and safety",
      "Creates organic connection opportunities",
      "Demonstrates unconditional service",
      "Addresses community beautification",
      "Strengthens non-profit networks",
      "Develops grassroots leadership"
    ],
    stats: [
      { label: "Events Monthly", value: "0" },
      { label: "Volunteers", value: "0" },
      { label: "Partners", value: "0" },
      { label: "People Reached", value: "0" }
    ],
    contact: {
      phone: "(720) 663-9243",
      email: "neighbors@uconministries.org",
      hours: "Events scheduled weekly - check calendar"
    },
    cta: {
      primary: { text: "Join an Event", href: "/events" },
      secondary: { text: "Volunteer", href: "/volunteer#neighbors" }
    }
  },
  
  voice: {
    id: "voice",
    title: "UCON VOICE",
    subtitle: "Advocacy for the Voiceless",
    icon: <MessageSquare className="w-8 h-8 text-white" />,
    shortDescription: "Giving voice to the voiceless and addressing root causes of brokenness.",
    fullDescription: "UCON VOICE advocates for systemic change. We engage in fair housing advocacy, criminal justice reform, policy work, and systemic justice initiatives. We amplify the voices of those impacted by broken systems and work toward policies that reflect dignity and justice for all.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/advocacy-and-community-organizing-scene--ae64f934-20251124143645.jpg",
    features: [
      "Fair housing advocacy",
      "Criminal justice reform work",
      "Policy engagement and testimony",
      "Systemic justice initiatives",
      "Legal rights education",
      "Community organizing training"
    ],
    benefits: [
      "Addresses root causes of injustice",
      "Empowers community advocacy",
      "Influences policy and legislation",
      "Protects tenant and housing rights",
      "Supports reentry success",
      "Creates systemic transformation"
    ],
    stats: [
      { label: "Cases Advocated", value: "0" },
      { label: "Policy Meetings", value: "0" },
      { label: "Rights Protected", value: "0" },
      { label: "Hours Served", value: "0" }
    ],
    contact: {
      phone: "(720) 663-9243",
      email: "voice@uconministries.org",
      hours: "By appointment - urgent advocacy available 24/7"
    },
    cta: {
      primary: { text: "Request Advocacy", href: "/outreach#voice" },
      secondary: { text: "Join the Movement", href: "/get-involved" }
    }
  },
  
  haven: {
    id: "haven",
    title: "UCON HAVEN",
    subtitle: "Safe Shelter, Stable Foundation",
    icon: <Home className="w-8 h-8 text-white" />,
    shortDescription: "Providing safe, stable environments as foundation for recovery journey.",
    fullDescription: "UCON HAVEN provides emergency shelter, transitional housing, housing vouchers, and long-term housing solutions. We believe stable housing is foundational to transformation. Every person deserves a safe place to call home as they rebuild their lives.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/safe-and-welcoming-transitional-housing--71246d73-20251124143644.jpg",
    features: [
      "Emergency shelter placement",
      "Transitional housing programs",
      "Housing voucher assistance",
      "Long-term housing solutions",
      "Landlord mediation",
      "Housing navigation support"
    ],
    benefits: [
      "Immediate safety from homelessness",
      "Stable foundation for recovery",
      "Pathway to permanent housing",
      "Reduced housing insecurity",
      "Family reunification support",
      "Community reintegration"
    ],
    stats: [
      { label: "Sheltered Monthly", value: "0" },
      { label: "Housed Permanently", value: "0" },
      { label: "Vouchers Secured", value: "0" },
      { label: "Hours Served", value: "0" }
    ],
    contact: {
      phone: "(720) 370-6549",
      email: "haven@uconministries.org",
      hours: "Emergency hotline 24/7"
    },
    cta: {
      primary: { text: "Get Housing Help", href: "/outreach#haven" },
      secondary: { text: "Donate Housing Funds", href: "/donations#housing" }
    }
  },
  
  steps: {
    id: "steps",
    title: "UCON STEPS",
    subtitle: "First Steps to Recovery",
    icon: <Stethoscope className="w-8 h-8 text-white" />,
    shortDescription: "First point of contact for addiction support with professional medical care access.",
    fullDescription: "UCON STEPS is our first-response addiction support program. We provide crisis intervention, detox referrals, rehab connections, and ongoing post-rehab support. We walk with individuals through every step of recovery, from crisis to long-term sobriety.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/compassionate-support-for-recovery-journ-60f3b1af-20251124143645.jpg",
    features: [
      "24/7 crisis support hotline",
      "Detox center referrals",
      "Rehab facility connections",
      "Post-rehab ongoing support",
      "Medication-assisted treatment links",
      "Recovery coaching"
    ],
    benefits: [
      "Immediate crisis intervention",
      "Professional medical care access",
      "Comprehensive recovery pathway",
      "Long-term sobriety support",
      "Reduces overdose risk",
      "Family support and education"
    ],
    stats: [
      { label: "Crisis Calls", value: "0" },
      { label: "Rehab Placements", value: "0" },
      { label: "Recovery Support", value: "0" },
      { label: "Hours Served", value: "0" }
    ],
    contact: {
      phone: "(720) 370-6549",
      email: "steps@uconministries.org",
      hours: "Crisis hotline 24/7 - Counseling by appointment"
    },
    cta: {
      primary: { text: "Get Help Now", href: "/outreach#steps" },
      secondary: { text: "Support Recovery", href: "/donations#recovery" }
    }
  }
};

export const openServices: Record<string, ServiceModalData> = {
  equip: {
    id: "equip",
    title: "UCON EQUIP",
    subtitle: "Workshops for Life Transformation",
    icon: <GraduationCap className="w-8 h-8 text-white" />,
    shortDescription: "Comprehensive workshops covering spiritual foundations, practical life skills, and career development.",
    fullDescription: "UCON EQUIP provides comprehensive workshops that empower participants to achieve stability and become contributing members of the community. From financial literacy to creative expression, our workshops address the practical skills needed for lasting transformation.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/warm-photojournalistic-scene-of-a-divers-d16e7dd0-20251124144451.jpg",
    features: [
      "Financial literacy and budgeting",
      "Communication and conflict resolution",
      "Creative expression and arts",
      "Job readiness and career development",
      "Computer skills training",
      "Life skills fundamentals"
    ],
    benefits: [
      "Practical skills for independence",
      "Increased employment readiness",
      "Financial stability foundation",
      "Healthy relationship skills",
      "Creative outlet for expression",
      "Community connection"
    ],
      stats: [
        { label: "Workshops Monthly", value: "0" },
        { label: "Participants", value: "0" },
        { label: "Skills Taught", value: "0" },
        { label: "Job Placements", value: "0" }
      ],
    contact: {
      phone: "(720) 663-9243",
      email: "equip@uconministries.org",
      hours: "Mon/Wed/Fri 10AM-2PM, Sat 1PM-4PM"
    },
    cta: {
      primary: { text: "Join a Workshop", href: "/workshops" },
      secondary: { text: "View Schedule", href: "/events" }
    }
  },
  
  awaken: {
    id: "awaken",
    title: "UCON AWAKEN",
    subtitle: "Spiritual Growth & Faith Formation",
    icon: <BookOpen className="w-8 h-8 text-white" />,
    shortDescription: "Engaging Bible studies and faith-strengthening courses to deepen your relationship with God.",
    fullDescription: "UCON AWAKEN provides engaging Bible studies and faith formation opportunities. Through scriptural exploration, prayer workshops, and theological discussions, we help participants develop a faith that's authentic, personal, and rooted in Scripture.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/uplifting-small-group-bible-study-open-b-8bf54410-20251124144450.jpg",
    features: [
      "Weekly Bible study groups",
      "Topical scripture exploration",
      "Fellowship and community building",
      "Theological discussions and Q&A",
      "Prayer ministry training",
      "Discipleship courses"
    ],
    benefits: [
      "Deeper relationship with God",
      "Biblical knowledge foundation",
      "Spiritual community connection",
      "Prayer life development",
      "Faith-based identity formation",
      "Belonging and acceptance"
    ],
    stats: [
      { label: "Bible Studies", value: "0" },
      { label: "Participants", value: "0" },
      { label: "Topics Covered", value: "0" },
      { label: "Hours Served", value: "0" }
    ],
    contact: {
      phone: "(720) 663-9243",
      email: "awaken@uconministries.org",
      hours: "Multiple study times available - see calendar"
    },
    cta: {
      primary: { text: "Join a Bible Study", href: "/services#awaken" },
      secondary: { text: "View Studies", href: "/resources" }
    }
  },
  
  shepherd: {
    id: "shepherd",
    title: "UCON SHEPHERD",
    subtitle: "Spiritual Care & Pastoral Support",
    icon: <Heart className="w-8 h-8 text-white" />,
    shortDescription: "Compassionate spiritual care and personalized guidance for life's challenges.",
    fullDescription: "UCON SHEPHERD provides compassionate pastoral care and spiritual guidance. Our pastoral team walks alongside you with empathy, biblical insight, and practical care, helping you find hope and renewed strength through life's challenges.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/compassionate-pastoral-care-session-two--45e54051-20251124144451.jpg",
    features: [
      "Individual pastoral counseling",
      "24/7 prayer support hotline",
      "Crisis intervention and support",
      "Spiritual guidance and direction",
      "Grief and loss counseling",
      "Life transition support"
    ],
    benefits: [
      "Emotional and spiritual support",
      "Professional pastoral care",
      "Crisis intervention available",
      "Biblical wisdom applied",
      "Confidential counseling",
      "Holistic healing approach"
    ],
    stats: [
      { label: "Counseling Sessions", value: "0" },
      { label: "Prayer Requests", value: "0" },
      { label: "Crisis Calls", value: "0" },
      { label: "Hours Served", value: "0" }
    ],
    contact: {
      phone: "(720) 663-9243",
      email: "shepherd@uconministries.org",
      hours: "Appointments Mon-Sat, Prayer hotline 24/7"
    },
    cta: {
      primary: { text: "Schedule Counseling", href: "/contact" },
      secondary: { text: "Prayer Request", href: "/prayer-wall" }
    }
  },
  
  bridge: {
    id: "bridge",
    title: "UCON BRIDGE",
    subtitle: "Mentorship & Peer Support",
    icon: <HandHeart className="w-8 h-8 text-white" />,
    shortDescription: "Connect with experienced guides who understand transformation and recovery.",
    fullDescription: "UCON BRIDGE connects you with mentors who understand transformation and recovery. Through one-on-one relationships and peer support groups, you'll develop the resilience and community bonds essential for lasting change.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/mentorship-and-peer-support-moment-two-a-b5b07c3a-20251124144451.jpg",
    features: [
      "One-on-one mentorship matching",
      "Peer support groups",
      "Accountability partnerships",
      "Bridge to LDI program",
      "Recovery coaching",
      "Life skills mentoring"
    ],
    benefits: [
      "Personal guidance from those who've been there",
      "Community accountability",
      "Belonging and connection",
      "Practical life wisdom",
      "Pathway to deeper involvement",
      "Reduced isolation"
    ],
    stats: [
      { label: "Active Mentors", value: "0" },
      { label: "Mentees", value: "0" },
      { label: "Support Groups", value: "0" },
      { label: "Hours Served", value: "0" }
    ],
    contact: {
      phone: "(720) 663-9243",
      email: "bridge@uconministries.org",
      hours: "Mentor matching by appointment"
    },
    cta: {
      primary: { text: "Get a Mentor", href: "/services#bridge" },
      secondary: { text: "Become a Mentor", href: "/volunteer#mentor" }
    }
  }
};
