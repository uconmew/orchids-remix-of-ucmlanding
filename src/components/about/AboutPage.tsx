"use client"

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Heart, Target, Users, Compass, BookOpen, Church,
  Award, TrendingUp, Shield, Sparkles, ArrowRight,
  CircleCheck, Star, Globe, Building2, HandHeart, Mail, Linkedin,
  Music, Megaphone, Phone, Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Intersection Observer Hook
function useIntersectionObserver(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible] as const;
}

// Staff Member Data - Organized by Department
const staticStaffByDepartment = {
  leadership: [
    {
      id: 1,
      name: "Troy Salazar",
      role: "Founding Visionary Lead",
      bio: "I pour my whole heart into uplifting and transforming lives because I've walked through the darkness of brokenness and know intimately what it feels like when hope seems impossible to find. My journey through operational management and the creative arts has been less about building a career and more about discovering that the most beautiful ministry happens when we blend strategic thinking with raw, honest compassion—where spreadsheets meet soul-deep connection and organizational systems become vessels for radical love. I lead with tears in my eyes and fire in my heart, connecting with those we serve not as an expert who has all the answers, but as a fellow traveler who understands that healing is messy, transformation takes time, and every single person deserves to be seen, heard, and cherished exactly where they are. Through this deeply personal approach, I guide our team in creating impact that doesn't just change circumstances—it touches souls, restores dignity, and reminds people that they are worthy of love, belonging, and a future filled with purpose. Every small victory we celebrate together feels like a miracle to me, because I remember when I needed someone to believe those miracles were possible for my own life.",
      expertise: ["Leadership Development", "Creative Arts", "Equal Peer"],
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/20250713_161156-1-1763993852854.jpg?width=8000&height=8000&resize=contain",
      email: "t.salazar@uconministries.org",
      linkedin: "#",
      phone: "720.663.9243"
    },
    {
      id: 2,
      name: "Brittany Joseph",
      role: "Ministry Programs Multiplication Director",
      bio: "As Programs Multiplication Director for Ucon Ministries, I'm a connector at heart who specializes in scaling impact through authentic community partnerships and strategic program development. My journey to this role wasn't a straight line—it was messy, full of detours, and taught me that the most beautiful growth often happens in the valleys, not just on the mountaintops. I focus on identifying what works, replicating success across diverse communities, and equipping leaders to carry our mission forward, but I never forget that people aren't projects—they're partners in this journey of hope and healing. With a passion for sustainable growth and grassroots empowerment, I ensure every program we multiply maintains its transformative core while adapting to each community's unique needs, because I believe real change begins with shared meals, listening ears, and showing up even when it's inconvenient.",
      expertise: ["Program Multiplication", "Community Partnerships", "Strategic Development"],
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_071419_Facebook-1763993696703.jpg?width=8000&height=8000&resize=contain",
      email: "b.joseph@uconministries.org",
      linkedin: "#"
    },
  ],
  ministry: [
    {
      id: 3,
      name: "Richard 'Brotha' Chavez",
      role: "Supplication Coordinator",
      bio: "I'm the person who makes sure the beautiful vision of transformation actually happens on the ground—coordinating schedules, managing logistics, and keeping all the moving pieces flowing smoothly so that our team can focus on what matters most: changing lives with love and intention. My work might look like spreadsheets and timelines, but what I'm really doing is creating space for miracles to unfold, ensuring that when someone walks through our doors desperate for hope, everything is in place to welcome them with dignity and purpose. I've learned that excellence in the details isn't about perfection—it's about honor, showing people through our preparedness and care that they matter enough for us to get things right. With a heart for organization and an eye for what needs to happen next, I juggle multiple programs, support our incredible team, and troubleshoot challenges with grace and creativity, always remembering that behind every event, workshop, and initiative are real people with real pain and real dreams. My greatest satisfaction comes in those moments when everything clicks into place—when the chaos becomes clarity, when obstacles turn into opportunities, and when our programs run so smoothly that transformation can happen without distraction. I may work behind the scenes, but I know that every detail I manage, every system I improve, and every problem I solve is another way of saying to those we serve: you are worth our very best.",
      expertise: ["Prayer & Supplication", "Logistics Management", "Operations Excellence"],
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251214_173822_Facebook-1765759125085.jpg?width=8000&height=8000&resize=contain",
      email: "brother.richard@uconministries.org",
      linkedin: "#"
    },
      {
        id: 4,
        name: "Pastor Cassie Adams",
        role: "Spiritual Formation Director",
        bio: "Yo! I'm Cassie. I walk alongside souls in the sacred, sometimes painful work of becoming—not who the world says they should be, but who they were always meant to be in their deepest, truest essence. My role isn't about having all the spiritual answers or presenting a perfect faith; it's about creating tender spaces where questions are welcomed, doubts are honored, and transformation unfolds at the pace of grace rather than pressure. I've learned through my own winding spiritual journey that formation happens in the quiet moments, the wrestling seasons, and the gentle invitations to go deeper, and I bring that understanding into every curriculum I design, every workshop I facilitate, and every conversation I hold. With expertise in spiritual practices, contemplative traditions, and the beautiful mess of real-life discipleship, I help our community discover that spiritual growth isn't about checking boxes or performing righteousness—it's about falling in love with the Divine, learning to love ourselves as beloved, and extending that radical love to a world desperate for compassion. I believe every person's spiritual path is unique and holy, and my greatest joy is witnessing the moment someone realizes they don't have to earn their worth or hide their struggles to experience profound spiritual connection and peace.",
        expertise: ["Subject Matter Expert", "Biblical Integration", "M.Div Theology"],
        image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/20251124_065619-1763993309149.jpg?width=8000&height=8000&resize=contain",
        email: "c.adams@uconministries.org",
        linkedin: "#"
      },
      {
        id: 12,
        name: "Amanda Andrews",
        role: "Clinical Formation Director",
        bio: "Licensed clinical psychologist specializing in addiction recovery and trauma treatment, integrating evidence-based practices with faith-based principles.",
        expertise: ["Clinical Psychology", "Trauma-Informed Care", "Care"],
        image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1740523215286-h139u5335m.png",
        email: "amanda.andrews@uconministries.org",
        linkedin: "#"
      },
  ],
  outreach: [
    {
      id: 6,
      name: "Nicole Hedges",
      role: "Outreach Director",
      bio: "Hey. Yeah. Whatever.. as Outreach Director and convict, I live for the moments when barriers crumble and hearts connect across all the lines that usually divide us—because I believe love is the most powerful force for change, and it's meant to be tangible, hands-on, and radically inclusive. My work isn't just about coordinating events or managing volunteers; it's about building bridges into communities, showing up with open hands and listening hearts, and proving through action that nobody is forgotten, overlooked, or too far gone to matter deeply. I've learned that the best outreach happens when we stop trying to be saviors and start being neighbors—when we share meals, hear stories, sit in pain we can't fix, and celebrate joy we didn't create but get to witness. With experience in community engagement, grassroots mobilization, and the beautiful chaos of meeting people exactly where they are, I lead our team in creating outreach initiatives that don't just serve—they honor, dignify, and empower. My heart breaks and heals a thousand times in this work, and I wouldn't have it any other way, because every connection made, every burden shared, and every moment of genuine human kindness reminds me why we're here: to love people back to life, one person at a time, one convict at a time, one soul that society has written off but God never has.",
      expertise: ["Outreach Director", "Community Bridge", "Convict"],
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_072456_Gallery-1763994324892.jpg?width=8000&height=8000&resize=contain",
      email: "n.hedges@uconministries.org",
      linkedin: "#"
    },
    {
      id: 7,
      name: "Shandale Spiller",
      role: "Ucon Ambassador",
      bio: "I'm honored to be the face and voice of a mission that has touched my life in ways I'm still discovering—carrying the message of hope, redemption, and unconditional love wherever I go because I've experienced firsthand how transformative this community can be. My role is beautifully simple yet profoundly important: I share our story, connect with potential partners and supporters, and help others see that transformation isn't just possible, it's happening right now in real lives, including my own. I don't speak from a script or a polished pitch; I speak from the heart, sharing authentic testimonies of changed lives, restored dignity, and second chances that became new beginnings. Whether I'm building relationships with donors, speaking at community events, or simply having coffee with someone curious about our work, I bring the passion of someone who truly believes in this mission because I've witnessed its power to heal the broken places we all carry. My greatest joy is when someone's eyes light up with recognition—that moment when they realize we're not just another nonprofit, we're a movement of radical love that sees every person as worthy, every story as sacred, and every life as full of untapped potential. I'm not just representing Ucon Ministries; I'm living proof that what we do matters, one conversation, one connection, one transformed life at a time.",
      expertise: ["Brand Ambassador", "Community Relations", "Lived Experience"],
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_072323_Gallery-1763994456744.jpg?width=8000&height=8000&resize=contain",
      email: "shandale@uconministries.org",
      linkedin: "#"
    },
    {
      id: 8,
      name: 'Robert "Rob" Taylor',
      role: "Transportation & Logistics Manager",
      bio: "Rob ensures no one is prevented from accessing help due to transportation barriers. He manages our vehicle fleet and coordinates rides to job interviews, medical appointments, and court dates.",
      expertise: ["Transportation Coordination", "Community Resources", "Crisis Logistics"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      email: "rtaylor@uconministries.org",
      linkedin: "#"
    }
  ],
  worship: [
    {
      id: 9,
      name: "Minister Elijah Washington",
      role: "Worship Director",
      bio: "Minister Elijah leads our worship experiences and music ministry. A gifted musician and worship leader, he creates space for authentic encounters with God through music, prayer, and creative expression.",
      expertise: ["Worship Leading", "Music Ministry", "Creative Arts"],
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      email: "ewashington@uconministries.org",
      linkedin: "#"
    },
    {
      id: 10,
      name: "Grace Thompson",
      role: "Creative Arts Coordinator",
      bio: "Grace facilitates workshops in visual arts, poetry, and creative expression as pathways to healing. She believes creativity unlocks parts of the soul that words alone cannot reach.",
      expertise: ["Art Therapy", "Creative Expression", "Workshop Facilitation"],
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
      email: "gthompson@uconministries.org",
      linkedin: "#"
    },
    {
      id: 11,
      name: "Deacon Thomas Brown",
      role: "Prayer Ministry Lead",
      bio: "Deacon Brown oversees our 24/7 prayer support hotline and prayer wall. With decades of experience in intercessory prayer, he trains prayer partners and ensures every request receives faithful attention.",
      expertise: ["Intercessory Prayer", "Spiritual Warfare", "Prayer Ministry"],
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop",
      email: "tbrown@uconministries.org",
      linkedin: "#"
    }
  ]
};

export default function AboutPage() {
  const [heroRef, heroVisible] = useIntersectionObserver();
  const [missionRef, missionVisible] = useIntersectionObserver();
  const [valuesRef, valuesVisible] = useIntersectionObserver();
  const [ldiRef, ldiVisible] = useIntersectionObserver();
  const [differentiatorRef, differentiatorVisible] = useIntersectionObserver();
  const [visionRef, visionVisible] = useIntersectionObserver();
  const [staffRef, staffVisible] = useIntersectionObserver();
  const [volunteerRef, volunteerVisible] = useIntersectionObserver();
  const [impactRef, impactVisible] = useIntersectionObserver();
  const [ctaRef, ctaVisible] = useIntersectionObserver();
  
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  
  // NEW: State for dynamically fetched staff
  const [dynamicStaff, setDynamicStaff] = useState<any[]>([]);
  const [staffByDepartment, setStaffByDepartment] = useState(staticStaffByDepartment);

  // State for live volunteer stats
  const [volunteerStats, setVolunteerStats] = useState({
    activeVolunteers: 250,
    hoursDonated: 5000,
    partnerChurches: 45,
  });

  // NEW: Fetch live staff from API and merge with static staff
  useEffect(() => {
    const fetchLiveStaff = async () => {
      try {
        const response = await fetch('/api/staff');
        if (response.ok) {
          const liveStaff = await response.json();
          setDynamicStaff(liveStaff);
          
          // Merge live staff with static staff by department
          const mergedStaff = {
            leadership: [...staticStaffByDepartment.leadership],
            ministry: [...staticStaffByDepartment.ministry],
            outreach: [...staticStaffByDepartment.outreach],
            worship: [...staticStaffByDepartment.worship],
          };

          // Add live staff to appropriate departments
          liveStaff.forEach((staff: any) => {
            const dept = staff.department || 'ministry';
            if (mergedStaff[dept as keyof typeof mergedStaff]) {
              // Check if staff already exists (by name to avoid duplicates)
              const exists = mergedStaff[dept as keyof typeof mergedStaff].some(
                (s: any) => s.name.toLowerCase() === staff.name.toLowerCase()
              );
              if (!exists) {
                mergedStaff[dept as keyof typeof mergedStaff].push(staff);
              }
            }
          });

          setStaffByDepartment(mergedStaff);
        }
      } catch (error) {
        console.error('Error fetching live staff:', error);
      }
    };

    fetchLiveStaff();
  }, []);

  // Fetch live stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setVolunteerStats({
            activeVolunteers: data.activeVolunteers || 250,
            hoursDonated: data.hoursDonated || 5000,
            partnerChurches: data.partnerChurches || 45,
          });
        }
      } catch (error) {
        console.error('Error fetching volunteer stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleStaffClick = (staff: any) => {
    setSelectedStaff(staff);
    setStaffDialogOpen(true);
  };

  const coreValues = [
    {
      icon: Heart,
      title: "Inherent Dignity",
      description: "Upholding the intrinsic worth of every individual, irrespective of background or circumstance.",
      color: "from-[#A92FFA] to-[#F28C28]"
    },
    {
      icon: Target,
      title: "Purpose-Driven Recovery",
      description: "We anchor sustainable healing in the discovery and cultivation of individual and communal purpose.",
      color: "from-[#F28C28] to-[#A92FFA]"
    },
    {
      icon: Users,
      title: "Unconditional Connection",
      description: "We demonstrate radical empathy and consistent, non-judgmental presence as the foundation of engagement.",
      color: "from-[#A92FFA] to-purple-600"
    },
    {
      icon: Globe,
      title: "Community Transformation",
      description: "We foster systemic change through empowered individuals who serve and inspire their communities.",
      color: "from-orange-500 to-[#F28C28]"
    },
    {
      icon: BookOpen,
      title: "Biblical Integration",
      description: "We seamlessly weave spiritual truth with clinically sound, evidence-based practices.",
      color: "from-purple-600 to-[#A92FFA]"
    },
    {
      icon: HandHeart,
      title: "Outreach & Accessibility",
      description: "We proactively engage marginalized populations and eliminate barriers to essential services.",
      color: "from-[#F28C28] to-orange-600"
    }
  ];

  const ldiDifferentiators = [
    {
      icon: Award,
      title: "Comprehensive Four-Tier System",
      description: "Unlike traditional programs, our 64-week LDI program progressively develops participants from personal healing to national leadership through four distinct tiers.",
      stats: "4 Tiers, 64 Weeks"
    },
    {
      icon: TrendingUp,
      title: "From Client to Change-Maker",
      description: "Participants don't just recover—they become certified peer mentors, organizational leaders, and movement builders who transform systems.",
      stats: "100% Leadership Track"
    },
    {
      icon: Shield,
      title: "Therapeutic Community Model",
      description: "We fuse clinical psychology, systematic theology, and lived re-entry experience into a holistic healing environment.",
      stats: "Evidence-Based + Faith-Integrated"
    },
    {
      icon: Building2,
      title: "Systemic Impact Focus",
      description: "Graduates don't just change their lives—they design programs, advocate for policy reform, and build movements that transform entire communities.",
      stats: "Community-Wide Transformation"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden double-exposure"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-700 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-6 bg-[#A92FFA] hover:bg-[#A92FFA]/90 text-lg px-6 py-2">
              <Heart className="w-5 h-5 mr-2" fill="currentColor" />
              About UCon Ministries
            </Badge>
            <h1 className={`text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 transition-all duration-700 delay-100 ${
              heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              Transforming Lives
              <br />
              <span className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] bg-clip-text text-transparent">
                Through Purpose
              </span>
            </h1>
            <p className={`text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 transition-all duration-700 delay-200 ${
              heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              We exist to meet individuals at their point of need, offering immediate practical assistance and guiding them through a comprehensive journey of healing and transformation.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section 
        ref={missionRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 overlay-gradient transition-all duration-700 ${
          missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-[#A92FFA]/10 via-card to-[#F28C28]/10 border-[#A92FFA]/20 hover-lift">
            <CardContent className="p-10 sm:p-16">
              <div className="text-center mb-8">
                <Church className="w-16 h-16 text-[#A92FFA] mx-auto mb-6" />
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">Our Mission</h2>
              </div>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8">
                UCon Ministries exists to <span className="text-[#A92FFA] font-semibold">transform feelings of worthlessness and mental health struggles into enduring purpose and dignity</span> for those deeply impacted by the justice system, addiction, homelessness, and personal brokenness.
              </p>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Through unconditional connection, consistent presence, and the redemptive love of Christ, we empower individuals to discover their inherent dignity and God-given purpose, cultivating them into <span className="text-[#F28C28] font-semibold">authentic servant leaders</span> who drive systemic change and build a legacy of hope in their communities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section 
        ref={valuesRef}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${
            valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-4 bg-[#F28C28] hover:bg-[#F28C28]/90">
              <Sparkles className="w-4 h-4 mr-2" />
              Our Foundation
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6">Core Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These principles guide every aspect of our ministry and shape our approach to transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <Card 
                key={index}
                className={`hover-lift transition-all duration-700 ${
                  valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${value.color} flex items-center justify-center mb-4`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* LDI Overview */}
      <section 
        ref={ldiRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 overlay-gradient transition-all duration-700 ${
          ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90">
              <Star className="w-4 h-4 mr-2" />
              Our Flagship Program
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6">
              The Leadership Development
              <br />
              <span className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] bg-clip-text text-transparent">
                Institute (LDI)
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Currently in development, the LDI will be our intensive, commitment-based program designed to transform lives and develop authentic leaders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-[#A92FFA] to-purple-700 text-white hover-glow">
              <CardHeader>
                <CardTitle className="text-3xl">64-Week Journey</CardTitle>
                <CardDescription className="text-white/80 text-lg">Four Progressive Tiers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CircleCheck className="w-6 h-6" />
                  <span className="text-lg">Tier 1: Ascension - Foundation Building</span>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheck className="w-6 h-6" />
                  <span className="text-lg">Tier 2: Pinnacle - Mentorship Development</span>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheck className="w-6 h-6" />
                  <span className="text-lg">Tier 3: Apex - Systemic Leadership</span>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheck className="w-6 h-6" />
                  <span className="text-lg">Tier 4: UCon - Visionary Impact</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#F28C28] to-orange-700 text-white hover-glow">
              <CardHeader>
                <CardTitle className="text-3xl">Commitment-Based</CardTitle>
                <CardDescription className="text-white/80 text-lg">Intensive Transformation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CircleCheck className="w-6 h-6" />
                  <span className="text-lg">Signed commitment agreement</span>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheck className="w-6 h-6" />
                  <span className="text-lg">Therapeutic community model</span>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheck className="w-6 h-6" />
                  <span className="text-lg">Clinical + spiritual integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheck className="w-6 h-6" />
                  <span className="text-lg">Leadership development focus</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-[#A92FFA] hover:bg-[#A92FFA]/90 text-lg">
              <Link href="/ldi">
                Explore the LDI Program
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section 
        ref={differentiatorRef}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${
            differentiatorVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-4 bg-[#F28C28] hover:bg-[#F28C28]/90">
              <Award className="w-4 h-4 mr-2" />
              Our Unique Approach
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6">
              What Sets the
              <br />
              <span className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] bg-clip-text text-transparent">
                LDI Apart
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The LDI isn't just another recovery program—it's a comprehensive leadership development institute that transforms participants into change-makers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {ldiDifferentiators.map((diff, index) => (
              <Card 
                key={index}
                className={`hover-lift transition-all duration-700 ${
                  differentiatorVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center">
                      <diff.icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="bg-[#F28C28] hover:bg-[#F28C28]/90">{diff.stats}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{diff.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg">{diff.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Impact */}
      <section 
        ref={visionRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 overlay-gradient transition-all duration-700 ${
          visionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90">
                <Compass className="w-4 h-4 mr-2" />
                Looking Forward
              </Badge>
              <h2 className="text-5xl font-bold mb-6">
                Our Vision for
                <br />
                <span className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] bg-clip-text text-transparent">
                  Lasting Impact
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                We envision a future where individuals impacted by the justice system, addiction, and homelessness are not defined by their past, but empowered by their purpose.
              </p>
              <p className="text-lg text-muted-foreground">
                Through the LDI and our comprehensive three-track model, we're building a movement of transformed leaders who will create systemic change in communities across Colorado and beyond.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-[#A92FFA] to-purple-700 text-white hover-lift">
                <CardContent className="pt-6">
                  <div className="text-5xl font-bold mb-2">1000+</div>
                  <div className="text-white/80">Lives Transformed</div>
                  <div className="text-sm text-white/60 mt-2">Target Impact</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#F28C28] to-orange-700 text-white hover-lift">
                <CardContent className="pt-6">
                  <div className="text-5xl font-bold mb-2">100+</div>
                  <div className="text-white/80">Leaders Developed</div>
                  <div className="text-sm text-white/60 mt-2">Annual Goal</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-[#A92FFA] text-white hover-lift">
                <CardContent className="pt-6">
                  <div className="text-5xl font-bold mb-2">50+</div>
                  <div className="text-white/80">Partner Organizations</div>
                  <div className="text-sm text-white/60 mt-2">Community Network</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-[#F28C28] text-white hover-lift">
                <CardContent className="pt-6">
                  <div className="text-5xl font-bold mb-2">24/7</div>
                  <div className="text-white/80">Support Available</div>
                  <div className="text-sm text-white/60 mt-2">Always Here</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Three-Track Model Overview */}
      <section 
        ref={impactRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
          impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#F28C28] hover:bg-[#F28C28]/90">
              <Users className="w-4 h-4 mr-2" />
              Comprehensive Care
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6">Three-Track Model</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meeting individuals at every stage of their journey—from immediate crisis to long-term leadership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-[#A92FFA]/10 to-purple-500/10 border-[#A92FFA]/20 hover-lift">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#A92FFA] flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <CardTitle className="text-2xl">Leadership Development Institute</CardTitle>
                <CardDescription className="text-base">Commitment-Based Program</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Intensive 64-week program developing authentic leaders through four progressive tiers.
                </p>
                <Button asChild variant="outline" className="w-full border-[#A92FFA] hover:bg-[#A92FFA] hover:text-white">
                  <Link href="/ldi">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#F28C28]/10 to-orange-500/10 border-[#F28C28]/20 hover-lift">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#F28C28] flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <CardTitle className="text-2xl">Open Ministry Services</CardTitle>
                <CardDescription className="text-base">No Commitment Required</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Workshops, Bible studies, pastoral services, and peer support for spiritual formation.
                </p>
                <Button asChild variant="outline" className="w-full border-[#F28C28] hover:bg-[#F28C28] hover:text-white">
                  <Link href="/services">Explore Services</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-[#A92FFA]/10 border-purple-500/20 hover-lift">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <CardTitle className="text-2xl">Outreach & Advocacy</CardTitle>
                <CardDescription className="text-base">First Responders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Direct engagement with immediate needs: food, shelter, transportation, and advocacy.
                </p>
                <Button asChild variant="outline" className="w-full border-purple-500 hover:bg-purple-500 hover:text-white">
                  <Link href="/outreach">See Outreach</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Staff Team Section - ENHANCED with Departments */}
      <section 
        ref={staffRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 overlay-gradient transition-all duration-700 ${
          staffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90">
              <Users className="w-4 h-4 mr-2" />
              Our Team
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6">Meet Our Staff</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Dedicated leaders united by personal transformation and a shared calling to serve.
            </p>
          </div>

          {/* Leadership Team */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Building2 className="w-8 h-8 text-[#A92FFA]" />
              <h3 className="text-3xl font-bold">Leadership Team</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {staffByDepartment.leadership.map((staff, index) => (
                <Card 
                  key={staff.id}
                  className="hover-lift cursor-pointer transition-all duration-700"
                  onClick={() => handleStaffClick(staff)}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    opacity: staffVisible ? 1 : 0,
                    transform: staffVisible ? 'translateY(0)' : 'translateY(2rem)'
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-6 p-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={staff.image}
                        alt={staff.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{staff.name}</CardTitle>
                      <CardDescription className="mb-3">{staff.role}</CardDescription>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {staff.bio}
                      </p>
                      <Button variant="outline" size="sm">
                        View Full Profile
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ministry Team */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Church className="w-8 h-8 text-[#F28C28]" />
              <h3 className="text-3xl font-bold">Ministry & Programs</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {staffByDepartment.ministry.map((staff, index) => (
                <Card 
                  key={staff.id}
                  className="hover-lift cursor-pointer transition-all duration-700"
                  onClick={() => handleStaffClick(staff)}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    opacity: staffVisible ? 1 : 0,
                    transform: staffVisible ? 'translateY(0)' : 'translateY(2rem)'
                  }}
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={staff.image}
                      alt={staff.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{staff.name}</CardTitle>
                    <CardDescription>{staff.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" size="sm">
                      View Profile
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Outreach Team */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <HandHeart className="w-8 h-8 text-[#A92FFA]" />
              <h3 className="text-3xl font-bold">Outreach & Advocacy</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {staffByDepartment.outreach.map((staff, index) => (
                <Card 
                  key={staff.id}
                  className="hover-lift cursor-pointer transition-all duration-700"
                  onClick={() => handleStaffClick(staff)}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    opacity: staffVisible ? 1 : 0,
                    transform: staffVisible ? 'translateY(0)' : 'translateY(2rem)'
                  }}
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={staff.image}
                      alt={staff.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{staff.name}</CardTitle>
                    <CardDescription>{staff.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" size="sm">
                      View Profile
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Worship Team */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Music className="w-8 h-8 text-[#F28C28]" />
              <h3 className="text-3xl font-bold">Worship & Creative Arts</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {staffByDepartment.worship.map((staff, index) => (
                <Card 
                  key={staff.id}
                  className="hover-lift cursor-pointer transition-all duration-700"
                  onClick={() => handleStaffClick(staff)}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    opacity: staffVisible ? 1 : 0,
                    transform: staffVisible ? 'translateY(0)' : 'translateY(2rem)'
                  }}
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={staff.image}
                      alt={staff.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{staff.name}</CardTitle>
                    <CardDescription>{staff.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" size="sm">
                      View Profile
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Volunteers & Community - Our Best People */}
      <section 
        ref={volunteerRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
          volunteerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Hero Card */}
          <Card className="bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white mb-16 hover-glow">
            <CardContent className="p-12 text-center">
              <Star className="w-20 h-20 mx-auto mb-6" fill="currentColor" />
              <h2 className="text-5xl sm:text-6xl font-bold mb-6">
                Our Best People Are
                <br />
                <span className="text-7xl">The Volunteers & Community</span>
              </h2>
              <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                Every transformation story at UCon Ministries is made possible by extraordinary volunteers and community partners who give their time, talents, and hearts to serve others.
              </p>
            </CardContent>
          </Card>

          {/* Statistics Grid */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <Card className="text-center hover-lift">
              <CardContent className="pt-8">
                <div className="text-6xl font-bold text-[#A92FFA] mb-2">{volunteerStats.activeVolunteers}</div>
                <div className="text-xl font-semibold mb-2">Active Volunteers</div>
                <p className="text-sm text-muted-foreground">Serving weekly across all tracks</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift">
              <CardContent className="pt-8">
                <div className="text-6xl font-bold text-[#F28C28] mb-2">{volunteerStats.hoursDonated}</div>
                <div className="text-xl font-semibold mb-2">Hours Donated</div>
                <p className="text-sm text-muted-foreground">Every month in service</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift">
              <CardContent className="pt-8">
                <div className="text-6xl font-bold text-[#A92FFA] mb-2">{volunteerStats.partnerChurches}</div>
                <div className="text-xl font-semibold mb-2">Partner Churches</div>
                <p className="text-sm text-muted-foreground">United in mission</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift">
              <CardContent className="pt-8">
                <div className="text-6xl font-bold text-[#F28C28] mb-2">100%</div>
                <div className="text-xl font-semibold mb-2">Heart-Led Service</div>
                <p className="text-sm text-muted-foreground">Love in action daily</p>
              </CardContent>
            </Card>
          </div>

          {/* Volunteer Roles */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="hover-lift border-2 border-[#A92FFA]/20">
              <CardHeader>
                <HandHeart className="w-12 h-12 text-[#A92FFA] mb-4" />
                <CardTitle className="text-2xl">Outreach Volunteers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The heartbeat of Track 3—serving on the front lines with food distribution, transportation, shelter support, and crisis response.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                    <span>Food pantry coordinators</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                    <span>Transportation drivers</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                    <span>Crisis hotline operators</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                    <span>Shelter support staff</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-[#F28C28]/20">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-[#F28C28] mb-4" />
                <CardTitle className="text-2xl">Ministry Volunteers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Facilitating Track 2 services—leading workshops, Bible studies, mentorship groups, and providing pastoral support.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                    <span>Workshop facilitators</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                    <span>Bible study leaders</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                    <span>Peer mentors</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                    <span>Prayer partners</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-[#A92FFA]/20">
              <CardHeader>
                <Users className="w-12 h-12 text-[#A92FFA] mb-4" />
                <CardTitle className="text-2xl">LDI Support Volunteers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Supporting Track 1—providing administrative help, mentorship, life skills coaching, and community connection for LDI participants.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                    <span>Life skills coaches</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                    <span>Career advisors</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                    <span>Administrative support</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                    <span>Community connectors</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Community Partner Spotlights */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4">Community Champions</h3>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Local organizations and individuals making extraordinary impact through partnership
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-[#A92FFA]/10 to-transparent hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Building2 className="w-10 h-10 text-[#A92FFA]" />
                    <Badge className="bg-[#A92FFA]">Partner Church</Badge>
                  </div>
                  <CardTitle className="text-2xl">Faith Community Alliance</CardTitle>
                  <CardDescription>12 Churches United in Service</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    A coalition of local churches providing volunteers, resources, and spiritual support. They host monthly outreach events and supply our food pantry with hundreds of meals weekly.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">600+ Meals/Week</Badge>
                    <Badge variant="outline">80+ Volunteers</Badge>
                    <Badge variant="outline">Prayer Support</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#F28C28]/10 to-transparent hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Megaphone className="w-10 h-10 text-[#F28C28]" />
                    <Badge className="bg-[#F28C28]">Business Partner</Badge>
                  </div>
                  <CardTitle className="text-2xl">Denver Works Initiative</CardTitle>
                  <CardDescription>Employment Partnership Network</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    A network of 25+ local businesses committed to hiring LDI graduates and providing job training, mentorship, and career pathways for those in recovery.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">25+ Employers</Badge>
                    <Badge variant="outline">100+ Jobs Created</Badge>
                    <Badge variant="outline">Career Training</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Join */}
          <Card className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] text-white hover-glow">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-4xl font-bold mb-4">Become Part of Something Bigger</h3>
                  <p className="text-xl text-white/90 mb-6">
                    Every volunteer brings unique gifts that transform lives. Whether you have 2 hours a month or 20 hours a week, there's a place for you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" variant="outline" className="bg-white text-[#A92FFA] hover:bg-white/90 border-white">
                      <Link href="/volunteer">
                        Volunteer Today
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white">
                      <Link href="/contact">
                        Partner With Us
                        <HandHeart className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Phone className="w-8 h-8" />
                      <div>
                        <div className="font-semibold">Volunteer Hotline</div>
                        <div className="text-white/80">720.663.9243</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Mail className="w-8 h-8" />
                      <div>
                        <div className="font-semibold">Volunteer Coordinator</div>
                        <div className="text-white/80">volunteers@uconministries.org</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Clock className="w-8 h-8" />
                      <div>
                        <div className="font-semibold">Flexible Scheduling</div>
                        <div className="text-white/80">Opportunities for every schedule</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white hover-glow">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-6" fill="currentColor" />
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">Join Our Mission</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Whether you're seeking transformation, want to volunteer, or support our mission—there's a place for you at UCon Ministries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="outline" className="bg-white text-[#A92FFA] hover:bg-white/90 border-white text-lg">
                  <Link href="/contact">
                    Get Involved
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white text-[#F28C28] hover:bg-white/90 border-white text-lg">
                  <Link href="/prayer-wall">
                    Prayer Wall
                    <Heart className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Staff Detail Dialog */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedStaff && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-6 mb-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedStaff.image}
                      alt={selectedStaff.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl mb-2">{selectedStaff.name}</DialogTitle>
                    <DialogDescription className="text-lg">
                      {selectedStaff.role}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <div className="max-h-20 overflow-y-auto border rounded-md p-2 bg-muted/30">
                    <p className="text-muted-foreground leading-relaxed text-sm">{selectedStaff.bio}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStaff.expertise.map((item: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4 border-t">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`mailto:${selectedStaff.email}`}>
                      <Mail className="mr-2 w-4 h-4" />
                      Email
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={selectedStaff.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 w-4 h-4" />
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}