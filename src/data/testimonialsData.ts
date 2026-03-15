export interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
  badge: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    name: "Marcus T.",
    role: "Outreach Recipient",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762834483420-v9zvsw6ymh.png",
    quote: "When I was living on the streets, Ucon's outreach team found me. They didn't just give me a meal—they sat with me, listened to my story, and treated me like I mattered. Now I'm on the waitlist for the LDI program, and for the first time in years, I have real hope.",
    badge: "Seen. Heard. Valued.",
    rating: 5
  },
  {
    name: "Sarah L.",
    role: "Services Participant",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762834895212-1rziiuwy9se.jpg",
    quote: "I started attending the UCON Awaken and Equip just looking for community after rehab. The workshops on financial literacy and the pastoral support have been life-changing. I'm excited about what Ucon is building—I've never seen a ministry approach recovery this comprehensively.",
    badge: "Supporting Every Step Forward",
    rating: 5
  },
  {
    name: "James K.",
    role: "Volunteer",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762835614164-pdcorjjmyp.png",
    quote: "As someone who went through addiction myself years ago, I'm blown away by Ucon's vision. The three-track model and the LDI program design are exactly what this community needs. I volunteer every week because I believe in this mission completely.",
    badge: "Been There. Serving Here",
    rating: 5
  },
  {
    name: "Diana R.",
    role: "Services Participant",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762836294042-v39uhxc78x.png",
    quote: "This community gave me more than church attendance—it gave me a faith that's actually mine. The teachers here don't see me as broken; they see me as someone God is transforming. I'm learning theology, practicing spiritual disciplines, and for the first time, I feel rooted in something real and lasting.",
    badge: "Where Scripture Meets Life",
    rating: 5
  },
  {
    name: "Thomas P.",
    role: "Early LDI Candidate",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762836623683-hhrhnmrg93.jpg",
    quote: "I've been clean for 6 months and working with UCon's pastoral team. When they told me about the 64-week LDI program, I knew that's what I need. Not just recovery, but real transformation and purpose. I've completed my application and can't wait to start.",
    badge: "Committed to Complete Change",
    rating: 5
  },
  {
    name: "Linda M.",
    role: "Community Partner",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/generated_images/professional-headshot-portrait-photograp-82743e11-20251105190506.jpg",
    quote: "As a local business owner, I've partnered with UCon to provide employment opportunities. What impresses me most is their holistic vision—they're not just helping people survive, they're building leaders who will transform this entire community. I'm excited to see what's ahead.",
    badge: "Leaders Who Give Back",
    rating: 5
  }
];
