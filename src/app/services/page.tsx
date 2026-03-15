"use client";

import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen, GraduationCap, Heart, Users, Calendar, Clock, MapPin,
  Phone, Mail, CircleCheck, ArrowRight, Star, MessageSquare,
  DollarSign, Briefcase, PenTool, Music, Utensils, Home,
  ChevronRight, Send, User, Sparkles, Target, Award, HandHeart,
  Lightbulb, TrendingUp, Shield, Play, Quote } from
"lucide-react";
import { toast } from "sonner";

export default function ServicesPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "workshop",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Section refs for scroll animations
  const heroRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const workshopsRef = useRef<HTMLElement>(null);
  const bibleRef = useRef<HTMLElement>(null);
  const pastoralRef = useRef<HTMLElement>(null);
  const mentoringRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const pathwayRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const locationRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // Visibility states for animations
  const [heroVisible, setHeroVisible] = useState(false);
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [workshopsVisible, setWorkshopsVisible] = useState(false);
  const [bibleVisible, setBibleVisible] = useState(false);
  const [pastoralVisible, setPastoralVisible] = useState(false);
  const [mentoringVisible, setMentoringVisible] = useState(false);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  const [pathwayVisible, setPathwayVisible] = useState(false);
  const [faqVisible, setFaqVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [locationVisible, setLocationVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === heroRef.current) setHeroVisible(true);
          if (entry.target === categoriesRef.current) setCategoriesVisible(true);
          if (entry.target === workshopsRef.current) setWorkshopsVisible(true);
          if (entry.target === bibleRef.current) setBibleVisible(true);
          if (entry.target === pastoralRef.current) setPastoralVisible(true);
          if (entry.target === mentoringRef.current) setMentoringVisible(true);
          if (entry.target === testimonialsRef.current) setTestimonialsVisible(true);
          if (entry.target === pathwayRef.current) setPathwayVisible(true);
          if (entry.target === faqRef.current) setFaqVisible(true);
          if (entry.target === contactRef.current) setContactVisible(true);
          if (entry.target === locationRef.current) setLocationVisible(true);
          if (entry.target === ctaRef.current) setCtaVisible(true);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    const refs = [heroRef, categoriesRef, workshopsRef, bibleRef, pastoralRef, mentoringRef, 
                  testimonialsRef, pathwayRef, faqRef, contactRef, locationRef, ctaRef];
    refs.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    // Check initial visibility
    refs.forEach(ref => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          if (ref === heroRef) setHeroVisible(true);
          if (ref === categoriesRef) setCategoriesVisible(true);
          if (ref === workshopsRef) setWorkshopsVisible(true);
          if (ref === bibleRef) setBibleVisible(true);
          if (ref === pastoralRef) setPastoralVisible(true);
          if (ref === mentoringRef) setMentoringVisible(true);
          if (ref === testimonialsRef) setTestimonialsVisible(true);
          if (ref === pathwayRef) setPathwayVisible(true);
          if (ref === faqRef) setFaqVisible(true);
          if (ref === contactRef) setContactVisible(true);
          if (ref === locationRef) setLocationVisible(true);
          if (ref === ctaRef) setCtaVisible(true);
        }
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Thank you for your interest! We'll contact you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "workshop",
      message: ""
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* SECTION 1: HERO */}
      <section 
        ref={heroRef}
        className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden double-exposure transition-all duration-1000 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <Badge className="inline-flex items-center gap-2 bg-secondary">
                <BookOpen className="w-4 h-4" />
                Track 2 - No Commitment Required
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 glow-text">
                Open Ministry <span className="text-secondary">Services</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Accessible programs for spiritual formation and community connection. Come as you are, stay as long as you need—no long-term commitment required.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="text-sm py-2 px-4">Free Access</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4">All Welcome</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4">No Commitment</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4">Weekly Events</Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="text-lg px-8 bg-secondary" asChild>
                  <a href="#contact">
                    Get Connected
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                  <a href="#workshops">View Programs</a>
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <Card className="bg-secondary text-secondary-foreground">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">20+</CardTitle>
                  <CardDescription className="text-secondary-foreground/80">Weekly Events</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">Free</CardTitle>
                  <CardDescription>All Services</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">4</CardTitle>
                  <CardDescription>Service Types</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-accent text-accent-foreground">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">∞</CardTitle>
                  <CardDescription className="text-accent-foreground/80">All Welcome</CardDescription>
                </CardHeader>
              </Card>
              <Card className="col-span-2 bg-gradient-to-br from-secondary/5 to-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    The Front Door to UCon Ministries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track 2 services provide a welcoming entry point to our community. Experience our programs risk-free and discover the support you need.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SERVICE CATEGORIES */}
      <section 
        ref={categoriesRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Programs</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 glow-text">
              Four Pathways to Growth
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the path that fits your current needs. All services are free, open to everyone, and designed to support your journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-secondary hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/warm-photojournalistic-scene-of-a-divers-d16e7dd0-20251124144451.jpg"
                  alt="Workshops background"
                  fill
                  className="object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  loading="lazy"
                  quality={75}
                />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl tracking-widest">UCON EQUIP</CardTitle>
                <CardDescription className="text-base">Skill-Based Learning & Development</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">
                  Short-term seminars designed to build practical life skills and empower you for success.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-secondary" />
                    <span>Financial literacy and budgeting</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-secondary" />
                    <span>Communication skills</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-secondary" />
                    <span>Job readiness training</span>
                  </div>
                </div>
                <Button className="w-full bg-secondary" asChild>
                  <a href="#workshops">
                    Explore Workshops
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/uplifting-small-group-bible-study-open-b-8bf54410-20251124144450.jpg"
                  alt="Bible studies background"
                  fill
                  className="object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  loading="lazy"
                  quality={75}
                />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl tracking-widest">UCON AWAKEN</CardTitle>
                <CardDescription className="text-base">Spiritual Growth & Fellowship</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">
                  Open-access gatherings for biblical literacy, fellowship, and theological exploration.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-primary" />
                    <span>Weekly Bible study groups</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-primary" />
                    <span>Topical scripture exploration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-primary" />
                    <span>Community worship</span>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <a href="#bible-studies">
                    Join Bible Study
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-accent hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/compassionate-pastoral-care-session-two--45e54051-20251124144451.jpg"
                  alt="Pastoral services background"
                  fill
                  className="object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  loading="lazy"
                  quality={75}
                />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl tracking-widest">UCON SHEPHERD</CardTitle>
                <CardDescription className="text-base">Spiritual Care & Support</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">
                  One-on-one pastoral counseling, prayer support, and crisis intervention.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-accent" />
                    <span>Individual pastoral counseling</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-accent" />
                    <span>24/7 prayer support hotline</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-accent" />
                    <span>Crisis intervention</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <a href="#pastoral">
                    Contact Pastor
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-secondary hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/mentorship-and-peer-support-moment-two-a-b5b07c3a-20251124144451.jpg"
                  alt="Mentoring background"
                  fill
                  className="object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  loading="lazy"
                  quality={75}
                />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl tracking-widest">UCON BRIDGE</CardTitle>
                <CardDescription className="text-base">Mentorship & Peer Support</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">
                  Connections matching LDI graduates with community members seeking guidance.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-secondary" />
                    <span>One-on-one mentorship</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-secondary" />
                    <span>Peer support groups</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-secondary" />
                    <span>Accountability partnerships</span>
                  </div>
                </div>
                <Button className="w-full bg-secondary" asChild>
                  <a href="#mentoring">
                    Find a Mentor
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardHeader>
                <Target className="w-10 h-10 text-secondary mb-3" />
                <CardTitle>No Barriers to Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All services are completely free and open to anyone. No application, no prerequisites—just show up.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <Heart className="w-10 h-10 text-primary mb-3" />
                <CardTitle>Safe & Welcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Experience unconditional acceptance and non-judgmental presence. We welcome you exactly as you are.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
              <CardHeader>
                <Award className="w-10 h-10 text-accent mb-3" />
                <CardTitle>Pathway to More</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track 2 serves as the front door to UCon Ministries. Discover if deeper engagement is right for you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 3: WORKSHOPS DETAIL */}
      <section
        ref={workshopsRef}
        id="workshops"
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 transition-all duration-1000 ${
          workshopsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-4xl font-bold glow-text">UCON EQUIP Workshops</h2>
                <p className="text-lg text-muted-foreground">Building Practical Life Skills</p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: DollarSign, title: "Financial Literacy", items: ["Budgeting basics", "Debt management", "Savings strategies", "Credit building"] },
              { icon: MessageSquare, title: "Communication", items: ["Active listening", "Conflict resolution", "Public speaking", "Assertiveness"] },
              { icon: Briefcase, title: "Job Readiness", items: ["Resume writing", "Interview skills", "Career planning", "Workplace etiquette"] },
              { icon: PenTool, title: "Creative Expression", items: ["Art therapy", "Creative writing", "Music and rhythm", "Drama and storytelling"] },
              { icon: Home, title: "Life Skills", items: ["Time management", "Household management", "Cooking basics", "Organization skills"] },
              { icon: Heart, title: "Relationships", items: ["Healthy boundaries", "Family dynamics", "Parenting skills", "Building trust"] },
              { icon: Target, title: "Personal Development", items: ["Goal setting", "Self-esteem building", "Stress management", "Mindfulness practices"] },
              { icon: Users, title: "Community Skills", items: ["Volunteering", "Civic engagement", "Networking", "Social responsibility"] }
            ].map((workshop, index) => (
              <Card key={workshop.title} className="hover:shadow-lg transition-all duration-500" style={{ transitionDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <workshop.icon className="w-8 h-8 text-secondary mb-2" />
                  <CardTitle className="text-lg">{workshop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {workshop.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CircleCheck className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-secondary text-secondary-foreground">
              <CardHeader>
                <CardTitle className="text-2xl">Workshop Format</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Duration:</p>
                      <p className="text-secondary-foreground/80">2-4 weeks per workshop series</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Schedule:</p>
                      <p className="text-secondary-foreground/80">Wednesdays 6:00 PM - 8:00 PM</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Group Size:</p>
                      <p className="text-secondary-foreground/80">15-20 participants for interactive learning</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {["Hands-on, practical exercises and activities", "Small group discussions and peer learning", "Take-home materials and resources", "Certificate of completion (optional)", "Light refreshments provided"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CircleCheck className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 4: BIBLE STUDIES */}
      <section
        ref={bibleRef}
        id="bible-studies"
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          bibleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-4xl font-bold glow-text">UCON AWAKEN Bible Studies</h2>
                <p className="text-lg text-muted-foreground">Growing Together in Faith</p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { title: "Monday Evening Study", desc: "Foundational Christianity", time: "7:00 PM - 8:30 PM", audience: "All levels welcome" },
              { title: "Tuesday Morning Group", desc: "Women's Bible Study", time: "10:00 AM - 11:30 AM", audience: "Women only" },
              { title: "Thursday Men's Study", desc: "Men of Purpose", time: "6:30 PM - 8:00 PM", audience: "Men only" },
              { title: "Friday Fellowship", desc: "Topical Studies", time: "7:00 PM - 9:00 PM", audience: "Intermediate+" },
              { title: "Sunday Morning", desc: "Community Worship & Study", time: "10:00 AM - 12:00 PM", audience: "Families welcome" },
              { title: "Saturday Youth Study", desc: "Young Adults (18-30)", time: "5:00 PM - 6:30 PM", audience: "Ages 18-30" }
            ].map((study) => (
              <Card key={study.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{study.title}</CardTitle>
                  <CardDescription>{study.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{study.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{study.audience}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <BookOpen className="w-10 h-10 text-primary mb-3" />
                <CardTitle>What We Study</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {["Biblical books and passages", "Christian life and discipleship", "Theology and doctrine", "Contemporary faith issues"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardHeader>
                <Users className="w-10 h-10 text-secondary mb-3" />
                <CardTitle>Study Format</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {["Open discussion encouraged", "Questions always welcome", "No prior knowledge needed", "Free study materials provided"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
              <CardHeader>
                <Heart className="w-10 h-10 text-accent mb-3" />
                <CardTitle>Why Join?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {["Deepen your faith journey", "Build authentic community", "Find spiritual guidance", "Experience God's love"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 5: PASTORAL SERVICES */}
      <section
        ref={pastoralRef}
        id="pastoral"
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 transition-all duration-1000 ${
          pastoralVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-4xl font-bold glow-text">UCON SHEPHERD Pastoral Services</h2>
                <p className="text-lg text-muted-foreground">Spiritual Care When You Need It</p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: User, title: "Individual Counseling", desc: "One-on-one pastoral counseling sessions for personal spiritual guidance and life challenges.", features: ["Confidential sessions", "Flexible scheduling", "Faith-integrated care"] },
              { icon: Phone, title: "24/7 Prayer Hotline", desc: "Round-the-clock prayer support for urgent spiritual needs or when you need someone to pray with.", features: ["Always available", "Trained listeners", "Immediate support"] },
              { icon: MessageSquare, title: "Crisis Intervention", desc: "Immediate spiritual and emotional support during life crises and emergencies.", features: ["Immediate response", "Compassionate care", "Resource connections"] },
              { icon: Heart, title: "Spiritual Direction", desc: "Ongoing guidance for deepening your spiritual life and discerning God's call.", features: ["Regular meetings", "Prayer practices", "Discernment support"] },
              { icon: Users, title: "Family Counseling", desc: "Faith-based family counseling to address relationship issues and family dynamics.", features: ["Couple sessions", "Family meetings", "Restoration focus"] },
              { icon: BookOpen, title: "Life Transitions", desc: "Support during major life changes: grief, career shifts, health challenges.", features: ["Grief support", "Change navigation", "Hope restoration"] }
            ].map((service) => (
              <Card key={service.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <service.icon className="w-8 h-8 text-accent mb-2" />
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{service.desc}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CircleCheck className="w-4 h-4 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-accent text-accent-foreground">
              <CardHeader>
                <CardTitle className="text-2xl">How to Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Call or Email", desc: "Contact our pastoral care team to request a session" },
                    { step: "2", title: "Brief Screening", desc: "Quick conversation to understand your needs" },
                    { step: "3", title: "Meet Your Pastor", desc: "First session typically within 48 hours" }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-accent-foreground/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold">{item.step}</span>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">{item.title}</p>
                        <p className="text-sm text-accent-foreground/80">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Contact Pastoral Care</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-accent" />
                    <div>
                      <p className="font-semibold">Office Phone</p>
                      <p className="text-muted-foreground">720.663.9243</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-accent" />
                    <div>
                      <p className="font-semibold">24/7 Prayer Hotline</p>
                      <p className="text-muted-foreground">(720) 370-6549</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-accent" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-muted-foreground">pastoral@uconministries.org</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <a href="#contact">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Appointment
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 6: MENTORING */}
      <section
        ref={mentoringRef}
        id="mentoring"
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          mentoringVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-4xl font-bold glow-text">UCON BRIDGE Mentorship</h2>
                <p className="text-lg text-muted-foreground">Connect with Experienced Guides</p>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-secondary">
              <CardHeader>
                <CardTitle className="text-2xl">Why Mentorship Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Our mentors are LDI graduates who have walked the journey from brokenness to purpose. They understand the challenges you face because they've overcome them. Through one-on-one relationships, you'll develop the resilience and community bonds essential for lasting change.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <p className="text-3xl font-bold text-secondary mb-1">65+</p>
                    <p className="text-sm text-muted-foreground">Active Mentors</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <p className="text-3xl font-bold text-secondary mb-1">94%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Types of Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    { title: "One-on-One Mentorship", desc: "Regular meetings with a dedicated mentor matched to your needs" },
                    { title: "Peer Support Groups", desc: "Weekly group sessions with others on similar journeys" },
                    { title: "Accountability Partnership", desc: "Daily check-ins and goal tracking for lasting change" },
                    { title: "Bridge to LDI", desc: "Guidance for those considering deeper engagement" }
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <CircleCheck className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-2 border-secondary/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <HandHeart className="w-12 h-12 text-secondary" />
                  <div>
                    <h3 className="text-xl font-bold">Ready to Connect?</h3>
                    <p className="text-muted-foreground">Let us match you with the perfect mentor for your journey</p>
                  </div>
                </div>
                <Button size="lg" className="bg-secondary" asChild>
                  <a href="#contact">
                    Request a Mentor
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS */}
      <section
        ref={testimonialsRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5 transition-all duration-1000 ${
          testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 glow-text">Lives Changed</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real stories from real people who found hope and transformation through our open services.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah L.", service: "UCON EQUIP Workshop", quote: "The financial literacy workshop changed my life. I went from living paycheck to paycheck to actually having savings. The facilitators were so patient and understanding.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762834895212-1rziiuwy9se.jpg" },
              { name: "Marcus T.", service: "UCON AWAKEN Bible Study", quote: "I came skeptical, but the Monday evening study welcomed me with open arms. No judgment, just genuine community. It's become the highlight of my week.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762834483420-v9zvsw6ymh.png" },
              { name: "James K.", service: "UCON BRIDGE Mentoring", quote: "My mentor has been through what I'm going through. Having someone who truly understands makes all the difference. I'm not alone anymore.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762835614164-pdcorjjmyp.png" }
            ].map((testimonial) => (
              <Card key={testimonial.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                      <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" loading="lazy" quality={75} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.service}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F28C28] text-[#F28C28]" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <Quote className="w-8 h-8 text-primary/20 mb-2" />
                  <p className="text-muted-foreground italic">{testimonial.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: PATHWAY TO LDI */}
      <section
        ref={pathwayRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          pathwayVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary">Next Steps</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 glow-text">Your Journey Continues</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Track 2 services are designed as a pathway to deeper transformation. When you're ready, the LDI program awaits.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { step: "1", title: "Attend Services", desc: "Experience our workshops, Bible studies, and pastoral care" },
              { step: "2", title: "Build Community", desc: "Connect with mentors and form supportive relationships" },
              { step: "3", title: "Discover Purpose", desc: "Begin to understand your unique calling and potential" },
              { step: "4", title: "Consider LDI", desc: "When ready, apply for the 64-week transformation program" }
            ].map((item) => (
              <Card key={item.step} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary-foreground">{item.step}</span>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="bg-gradient-to-r from-primary to-secondary text-white">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready for Deeper Transformation?</h3>
                  <p className="text-white/80">The Leadership Development Institute (LDI) is our 64-week commitment-based program for those ready to transform their lives completely.</p>
                </div>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/ldi">
                    Learn About LDI
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 9: FAQ */}
      <section
        ref={faqRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 transition-all duration-1000 ${
          faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-4xl font-bold mb-6 glow-text">Common Questions</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "Do I need to sign up or register for services?", a: "No registration required for most services! Just show up. For pastoral counseling, we ask that you call ahead to schedule an appointment." },
              { q: "Are there any costs for attending?", a: "All Track 2 services are completely free. We never want finances to be a barrier to your growth and healing." },
              { q: "What if I've never been to church or read the Bible?", a: "You're exactly who we're here for! Our services are designed for all backgrounds and experience levels. No prior knowledge needed." },
              { q: "Can I bring my family or children?", a: "Absolutely! Sunday services and some workshops welcome families. Childcare is available for certain events—just ask when you arrive." },
              { q: "What's the difference between Track 2 and the LDI program?", a: "Track 2 services require no commitment and you can attend as often or as little as you like. The LDI is a 64-week residential program with a signed commitment for those ready for intensive transformation." },
              { q: "How do I know if I'm ready for the LDI program?", a: "Talk to our pastoral team or a mentor. They can help you discern if the LDI is right for you. Many people spend months or years in Track 2 before making that decision." }
            ].map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    {faq.q}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground pl-8">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: CONTACT FORM */}
      <section
        ref={contactRef}
        id="contact"
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          contactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-secondary">Get Connected</Badge>
            <h2 className="text-4xl font-bold mb-6 glow-text">Ready to Join Us?</h2>
            <p className="text-xl text-muted-foreground">
              Fill out this form and we'll help you find the right service for your needs.
            </p>
          </div>
          
          <Card className="border-2 border-secondary">
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name *</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="720.663.9243"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Service Interest *</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full p-2 border border-border rounded-md bg-background"
                      required
                    >
                      <option value="workshop">UCON EQUIP - Workshops</option>
                      <option value="bible-study">UCON AWAKEN - Bible Studies</option>
                      <option value="pastoral">UCON SHEPHERD - Pastoral Services</option>
                      <option value="mentoring">UCON BRIDGE - Mentoring</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Tell us a bit about yourself and what you're looking for..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" size="lg" className="flex-1 bg-secondary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Inquiry
                      </>
                    )}
                  </Button>
                  <Button type="button" size="lg" variant="outline" className="flex-1" asChild>
                    <a href="tel:+17206639243">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Instead
                    </a>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 11: SCHEDULE & LOCATION */}
      <section
        ref={locationRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary/10 to-primary/10 transition-all duration-1000 ${
          locationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 glow-text">Visit Us</h2>
            <p className="text-xl text-muted-foreground">All are welcome at UCon Ministries</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <MapPin className="w-10 h-10 text-secondary mb-3" />
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">UCon Ministries Center</p>
                  <p className="mb-1">2000 S Colorado Blvd T1 Ste 2</p>
                <p className="mb-4">Denver, CO 80210</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Clock className="w-10 h-10 text-primary mb-3" />
                <CardTitle>Office Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday:</span>
                    <span className="font-medium">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday:</span>
                    <span className="font-medium">10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday:</span>
                    <span className="font-medium">Services Only</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Phone className="w-10 h-10 text-accent mb-3" />
                <CardTitle>Contact Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Main Office</p>
                    <p className="font-medium">720.663.9243</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">services@uconministries.org</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24/7 Prayer</p>
                    <p className="font-medium">(720) 370-6549</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 12: FINAL CTA */}
      <section
        ref={ctaRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-16 h-16 text-secondary mx-auto mb-6" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 glow-text">Your Journey Starts Today</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            No commitment, no judgment, no barriers. Just show up and discover the community that's been waiting to welcome you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 bg-secondary" asChild>
              <a href="#contact">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/prayer-wall">
                Visit Prayer Wall
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}