export interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  badges: string[];
}

export const defaultTeamMembers: TeamMember[] = [
    {
      name: "Founding Visionary Lead",
      role: "Founder & Executive Director",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/20250713_161156-1-1763993852854.jpg?width=1358&height=1393&resize=cover",
      description: "Founded Ucon Ministries after personal transformation from addiction and justice system involvement. Leads strategic vision and ministry direction with 8 years of biblical experience and lived recovery journey.",
      badges: ["Ministry Founder", "LDI Developer", "Peer Equal"]
    },
    {
      name: "Spiritual Formation Director",
      role: "Biblical Integration",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/20251124_065619-1763993309149.jpg?width=1358&height=1393&resize=cover",
      description: "Leads spiritual formation curriculum design and biblical integration across all ministry programs. Specializes in contemplative practices, theological education, and creating sacred spaces for authentic spiritual growth and transformation.",
      badges: ["M.Div. Theology", "Biblical Counselor", "SME"]
    },
      {
        name: "Clinical Formation Director",
        role: "Mental Health & Clinical Excellence",
        image: "https://i.ibb.co/PzPd8K3Y/Screenshot-20260304-084924-Gallery.jpghttps://i.ibb.co/PzPd8K3Y/Screenshot-20260304-084924-Gallery.jpgw?idth=1358&height=1393&resize=cover",
        description: "Licensed clinical psychologist specializing in addiction recovery and trauma treatment, integrating evidence-based practices with faith-based principles.",
        badges: ["Clinical Psychology", "Trauma-Informed Care", "SME"]
      },
    {
      name: "Multiplication Director",
      role: "Ministry Programs",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_071419_Facebook-1763993696703.jpg?width=1358&height=1393&resize=cover",
      description: "Oversees multiplication of ministry programs across all tiers and tracks, ensuring program quality, participant transformation success, and scalable impact.",
      badges: ["LDI Developer", "Purpose Driven"]
    },
    {
      name: "Outreach Coordinator",
      role: "Community Engagement",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_072456_Gallery-1763994324892.jpg?width=1358&height=1393&resize=cover",
      description: "Leads Track 3 outreach initiatives, coordinating volunteers and ensuring immediate crisis response to community needs 24/7.",
      badges: ["Social Work", "Community Organizer"]
    },
    {
      name: "Nicole Hedges",
      role: "Outreach Director",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_072323_Gallery-1763994456744.jpg?width=1358&height=1393&resize=cover",
      description: "Hey. Yeah. Whatever.. as Outreach Director and convict, I live for the moments when barriers crumble and hearts connect across all the lines that usually divide us—because I believe love is the most powerful force for change, and it's meant to be tangible, hands-on, and radically inclusive.",
      badges: ["Outreach Director", "Community Bridge", "Convict"]
    }

];
