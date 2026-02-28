"use client"

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Crown, Mountain, Building2, Rocket, Sparkles, Heart, Users, Target,
  BookOpen, Brain, Shield, TrendingUp, Award, Clock, Calendar, CircleCheck,
  ArrowRight, ChevronRight, GraduationCap, MessageSquare, FileText, Star,
  Lightbulb, Zap, Compass, CircleDot, Phone, Mail, MapPin, Play, Pause, Volume2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

// Background Music Player Component
function BackgroundMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/background-music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Button
        onClick={togglePlay}
        size="lg"
        className="rounded-full w-16 h-16 bg-gradient-to-br from-[#A92FFA] to-[#F28C28] hover:opacity-90 shadow-lg hover-glow"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white ml-1" />
        )}
      </Button>
    </div>
  );
}

export default function LDIPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const [heroRef, heroVisible] = useIntersectionObserver();
  const [overviewRef, overviewVisible] = useIntersectionObserver();
  const [tier1Ref, tier1Visible] = useIntersectionObserver();
  const [tier2Ref, tier2Visible] = useIntersectionObserver();
  const [tier3Ref, tier3Visible] = useIntersectionObserver();
  const [tier4Ref, tier4Visible] = useIntersectionObserver();
  const [applicationRef, applicationVisible] = useIntersectionObserver();
  const [ctaRef, ctaVisible] = useIntersectionObserver();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BackgroundMusicPlayer />
      
      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden double-exposure">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Container 1-2: Main Content */}
            <div className="lg:col-span-7 space-y-6">
              <Badge className={`inline-flex items-center gap-2 bg-[#A92FFA] transition-all duration-700 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <Crown className="w-4 h-4" />
                Track 1 - Commitment-Based Program
              </Badge>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 glow-text">
                Leadership Development <span className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] bg-clip-text text-transparent">Institute</span>
              </h1>
              <p className={`text-xl text-muted-foreground transition-all duration-700 delay-200 ${
                heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}>
                A rigorous 64-week, four-tier program transforming profound brokenness into authentic, purpose-driven leadership through the integration of clinical psychology, systematic theology, and lived experience.
              </p>
              
              {/* Container 3-4: Key Features */}
              <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-300 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <Badge variant="outline" className="text-sm py-2 px-4 border-[#A92FFA]">64-Week Program</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-[#F28C28]">4 Progressive Tiers</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-[#A92FFA]">Evidence-Based</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-[#F28C28]">Housing Provided</Badge>
              </div>
              
              {/* Container 5-6: CTAs */}
              <div className={`flex flex-wrap gap-4 pt-4 transition-all duration-700 delay-400 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <Button size="lg" className="text-lg px-8 bg-[#F28C28] hover:bg-[#F28C28]/90" asChild>
                  <Link href="/ldi-waitlist">
                    Apply to LDI
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 border-[#A92FFA] hover:bg-[#A92FFA] hover:text-white" asChild>
                  <a href="/ldi-brochure.pdf" download>
                    Download Brochure
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Container 7-12: Stats & Quick Info */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <Card className={`bg-[#A92FFA] text-white hover-lift transition-all duration-700 delay-200 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">64</CardTitle>
                  <CardDescription className="text-white/80">Weeks</CardDescription>
                </CardHeader>
              </Card>
              <Card className={`bg-[#F28C28] text-white hover-lift transition-all duration-700 delay-300 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">4</CardTitle>
                  <CardDescription className="text-white/80">Tiers</CardDescription>
                </CardHeader>
              </Card>
              <Card className={`bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white hover-lift transition-all duration-700 delay-400 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">94%</CardTitle>
                  <CardDescription className="text-white/80">Completion</CardDescription>
                </CardHeader>
              </Card>
              <Card className={`hover-lift transition-all duration-700 delay-500 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">150+</CardTitle>
                  <CardDescription>Graduates</CardDescription>
                </CardHeader>
              </Card>
              <Card className={`col-span-2 bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5 transition-all duration-700 delay-600 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA]" />
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Full housing and meals
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Professional counseling
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Leadership training
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Job placement support
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROGRAM OVERVIEW - 12 Containers */}
      <section 
        ref={overviewRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
          overviewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 glow-text">
              The Engine of Transformation
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The LDI is designed to dismantle a lifetime of worthlessness and trauma through a safe, challenging therapeutic community that integrates evidence-based practices with biblical truth.
            </p>
          </div>

          {/* Add Image */}
          <div className="mb-12 relative h-96 rounded-lg overflow-hidden">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/generated_images/professional-diverse-group-of-people-in--d203b69c-20251025022142.jpg"
              alt="Therapeutic community in discussion"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Container 3-6: Core Principles */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle className="text-lg">Therapeutic Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A safe, structured environment where healing happens through authentic relationships and mutual accountability.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-[#F28C28]/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-[#F28C28]" />
                </div>
                <CardTitle className="text-lg">Clinical Psychology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Evidence-based mental health treatment addressing trauma, addiction, and identity reconstruction.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle className="text-lg">Systematic Theology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Biblical integration that provides spiritual foundation and eternal perspective on identity and purpose.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-[#F28C28]/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[#F28C28]" />
                </div>
                <CardTitle className="text-lg">Lived Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-world reentry wisdom from staff and mentors who have walked the same journey.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Container 7-8: Commitment Requirement */}
          <Card className="mb-8 border-2 border-[#A92FFA] bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5 hover-lift">
            <CardHeader>
              <CardTitle className="text-2xl">The Commitment Agreement</CardTitle>
              <CardDescription className="text-base">Foundation for Deep Transformation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-muted-foreground mb-4">
                    The LDI requires a signed commitment agreement. This isn't about control—it's about creating the stable environment necessary for profound healing. Deep transformation requires dedication, accountability, and time.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">64-week commitment to complete program</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Active participation in all program activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Adherence to community standards and structure</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-muted-foreground mb-4">
                    <strong>What You Receive:</strong>
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Safe housing for entire program duration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Three meals daily plus nutritional support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Professional counseling and mental health care</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Skills training and leadership development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Employment placement and ongoing support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Container 9-12: Program Outcomes */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center hover-lift">
              <CardHeader>
                <Shield className="w-10 h-10 text-[#A92FFA] mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">87%</CardTitle>
                <CardDescription>Long-term Sobriety</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center hover-lift">
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-[#F28C28] mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">78%</CardTitle>
                <CardDescription>Secure Employment</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center hover-lift">
              <CardHeader>
                <Award className="w-10 h-10 text-[#A92FFA] mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">92%</CardTitle>
                <CardDescription>Stable Housing</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center hover-lift">
              <CardHeader>
                <Users className="w-10 h-10 text-[#A92FFA] mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">94%</CardTitle>
                <CardDescription>Completion Rate</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 3: TIER 1 - ASCENSION - 12 Containers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#A92FFA] rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-[#A92FFA]">Tier 1 | Weeks 1-16</Badge>
              <h2 className="text-4xl font-bold glow-text">Ascension</h2>
              <p className="text-lg text-muted-foreground">Foundation Demolition & Reconstruction</p>
            </div>
          </div>
          
          {/* Add Image */}
          <div className="mb-8 relative h-80 rounded-lg overflow-hidden">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/generated_images/individual-person-climbing-ascending-ste-ac964634-20251025022141.jpg"
              alt="Ascending journey of transformation"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Container 3-4: Overview */}
          <Card className="mb-8 border-2 border-[#A92FFA]">
            <CardHeader>
              <CardTitle className="text-2xl">The Great Deconstruction: From Independence Illusion to Interdependent Truth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Tier 1 is the most intensive foundational phase, designed to dismantle a lifetime of worthlessness and trauma. Participants move from "identity disorder" to an affirmation of their sacred worth through a safe yet challenging environment.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Primary Goal</h4>
                  <p className="text-sm text-muted-foreground">Establish stable mental health foundation and affirm inherent dignity</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Core Focus</h4>
                  <p className="text-sm text-muted-foreground">Trauma healing, sobriety mastery, life skills development</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Outcome</h4>
                  <p className="text-sm text-muted-foreground">Identity rebuilt from worthlessness to sacred worth</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Container 5-10: Curriculum Components */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Brain className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Mental Health Restoration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Trauma-informed therapy sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>PTSD and trauma processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Depression and anxiety management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Emotional regulation skills</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Sobriety Skills Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Addiction education and awareness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Relapse prevention strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>12-step integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Accountability partnerships</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Foundational Life Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Personal hygiene and self-care</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Time management basics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Communication fundamentals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Conflict resolution</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <BookOpen className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Spiritual Formation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Identity in Christ theology</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Daily devotional practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Biblical literacy foundations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Prayer and meditation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Heart className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Community Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Therapeutic community norms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Peer accountability structures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Trust-building exercises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Authentic vulnerability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Compass className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Purpose Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Personal strengths assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Values clarification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Vision development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Goal-setting foundations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Container 11-12: Milestones */}
          <Card className="bg-gradient-to-br from-[#A92FFA]/10 to-[#A92FFA]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#A92FFA]" />
                Tier 1 Milestones & Advancement Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Key Milestones</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      30+ days continuous sobriety
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Trauma processing progress
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Stable daily routine established
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Community trust demonstrated
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Advancement to Tier 2</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Completion of 16-week curriculum
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Mental health stability demonstrated
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Staff and peer recommendation
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Personal purpose statement drafted
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 4: TIER 2 - PINNACLE - 12 Containers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#F28C28] rounded-xl flex items-center justify-center">
              <Mountain className="w-8 h-8 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-[#F28C28]">Tier 2 | Weeks 17-32</Badge>
              <h2 className="text-4xl font-bold glow-text">Pinnacle</h2>
              <p className="text-lg text-muted-foreground">Mentorship Development</p>
            </div>
          </div>
          
          {/* Add Image */}
          <div className="mb-8 relative h-80 rounded-lg overflow-hidden">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/generated_images/mentor-and-mentee-sitting-together-in-co-e425843d-20251025022141.jpg"
              alt="Mentor and mentee in consultation"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Container 3-4: Overview */}
          <Card className="mb-8 border-2 border-[#F28C28]">
            <CardHeader>
              <CardTitle className="text-2xl">From Follower to Mentor: The Leadership Transition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Having established a stable foundation in their new identity, Tier 2 participants transition from personal transformation to mentoring others. This tier focuses on developing the skills needed to guide new members through their own journeys.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Primary Goal</h4>
                  <p className="text-sm text-muted-foreground">Develop mentoring capacity and peer leadership skills</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Core Focus</h4>
                  <p className="text-sm text-muted-foreground">Advanced mental health, peer counseling, group facilitation</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Outcome</h4>
                  <p className="text-sm text-muted-foreground">Effective peer mentor serving Tier 1 participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Container 5-10: Curriculum Components */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Brain className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle className="text-lg">Advanced Mental Health</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Deeper trauma work and integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Attachment theory application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Mental health first aid certification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Co-occurring disorders awareness</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle className="text-lg">Peer Counseling Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Active listening techniques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Empathy and validation skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Boundaries in mentoring relationships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Crisis intervention basics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <MessageSquare className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle className="text-lg">Group Facilitation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Small group dynamics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Meeting facilitation skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Conflict mediation in groups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Creating safe discussion spaces</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <BookOpen className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle className="text-lg">Advanced Theology</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Discipleship principles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Spiritual mentoring practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Biblical counseling integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Teaching methodology</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle className="text-lg">Leadership Foundations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Servant leadership principles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Personal leadership style development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Team building basics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Decision-making frameworks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Lightbulb className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle className="text-lg">Practical Mentoring</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Assigned Tier 1 mentees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Weekly supervision sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Mentoring case studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Reflective practice development</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Container 11-12: Milestones */}
          <Card className="bg-gradient-to-br from-[#F28C28]/10 to-[#F28C28]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#F28C28]" />
                Tier 2 Milestones & Advancement Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Key Milestones</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                      Successfully mentoring 2+ Tier 1 participants
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                      Leading small group discussions
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                      Mental health first aid certified
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                      Personal leadership vision developed
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Advancement to Tier 3</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                      16 weeks of effective peer mentoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                      Demonstrated group facilitation skills
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                      Ready for organizational responsibility
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#F28C28]" />
                      Community endorsement
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 5: TIER 3 - APEX - 12 Containers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent/5 to-accent/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#A92FFA] rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-[#A92FFA]">Tier 3 | Weeks 33-48</Badge>
              <h2 className="text-4xl font-bold glow-text">Apex</h2>
              <p className="text-lg text-muted-foreground">Systemic Leadership</p>
            </div>
          </div>
          
          {/* Add Image */}
          <div className="mb-8 relative h-80 rounded-lg overflow-hidden">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/generated_images/group-of-leaders-in-a-professional-meeti-6232f22b-20251025022141.jpg"
              alt="Leaders planning community programs"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Container 3-4: Overview */}
          <Card className="mb-8 border-2 border-[#A92FFA]">
            <CardHeader>
              <CardTitle className="text-2xl">From Individual Mentoring to Systemic Influence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Tier 3 leaders move beyond mentoring individuals to influencing entire systems. They learn to design and manage organizational systems related to mental health and recovery programs, becoming catalysts for systemic change within communities.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Primary Goal</h4>
                  <p className="text-sm text-muted-foreground">Develop organizational leadership and system design skills</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Core Focus</h4>
                  <p className="text-sm text-muted-foreground">Program management, community mobilization, advocacy</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Outcome</h4>
                  <p className="text-sm text-muted-foreground">Organizational leader driving systemic change</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Container 5-10: Curriculum Components */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Building2 className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">System Design & Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Program design principles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Operational systems development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Quality assurance frameworks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Data-driven decision making</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Community Mobilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Community organizing strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Partnership development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Coalition building</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Grassroots movement principles</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <MessageSquare className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Advocacy & Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Policy analysis and development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Legislative advocacy strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Public speaking and testimony</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Media relations basics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Executive Administration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Budget management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Grant writing fundamentals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Human resource basics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Strategic planning</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Leadership Development</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Team leadership and delegation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Conflict resolution at scale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Organizational culture development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Change management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Practical Application</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Program leadership assignment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Community project management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Advocacy campaign participation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Real-world leadership experience</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Container 11-12: Milestones */}
          <Card className="bg-gradient-to-br from-[#A92FFA]/10 to-[#A92FFA]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#A92FFA]" />
                Tier 3 Milestones & Advancement Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Key Milestones</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Managing program component or team
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Leading community advocacy initiative
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Developed organizational system or policy
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      External community recognition
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Advancement to Tier 4</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      16 weeks of organizational leadership
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Demonstrated systemic impact
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Vision for movement-level change
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Leadership council recommendation
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 6: TIER 4 - UCON - 12 Containers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A92FFA] to-[#F28C28] rounded-xl flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-gradient-to-r from-[#A92FFA] to-[#F28C28]">Tier 4 | Weeks 49-64</Badge>
              <h2 className="text-4xl font-bold glow-text">UCon</h2>
              <p className="text-lg text-muted-foreground">Visionary Leadership & National Impact</p>
            </div>
          </div>
          
          {/* Add Image */}
          <div className="mb-8 relative h-80 rounded-lg overflow-hidden">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/generated_images/executive-leader-presenting-at-national--28ce3f8b-20251025022141.jpg"
              alt="Executive leader presenting at conference"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Container 3-4: Overview */}
          <Card className="mb-8 border-2 border-[#A92FFA] bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5 hover-lift">
            <CardHeader>
              <CardTitle className="text-2xl">From Regional Impact to National Movement Building</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The pinnacle tier where leaders become visionaries operating on national and international scales. Focus shifts to movement-building, policy development, cultural transformation, and creating generational legacy. Graduates are prepared for executive roles with expertise in board governance, stakeholder relations, and succession planning.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Primary Goal</h4>
                  <p className="text-sm text-muted-foreground">Develop visionary leadership for national impact</p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Core Focus</h4>
                  <p className="text-sm text-muted-foreground">Movement building, policy, culture transformation</p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Outcome</h4>
                  <p className="text-sm text-muted-foreground">Executive-level change agent and movement builder</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Container 5-10: Curriculum Components */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Rocket className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Movement Building</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Social movement theory and practice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>National network development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Scaling organizations nationally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Multi-site leadership</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <FileText className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Policy Development</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Federal and state policy analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Legislative strategy development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Capitol Hill advocacy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Policy white paper development</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Crown className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Executive Leadership</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Executive decision-making</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Board governance and relations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Stakeholder management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Organizational sustainability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Cultural Transformation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Cultural change strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Public narrative development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Media and communications mastery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Narrative framing for justice</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Star className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Succession & Legacy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Succession planning frameworks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Next-generation leader development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Organizational legacy building</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Generational impact strategies</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Compass className="w-8 h-8 text-[#A92FFA] mb-2" />
                <CardTitle className="text-lg">Visionary Application</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>National expansion project leadership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Policy advocacy campaign</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Executive internship placement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDot className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Capstone legacy project</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Container 11-12: Graduation & Beyond */}
          <Card className="bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 border-2 border-[#A92FFA]/20 hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-[#A92FFA]" />
                Tier 4 Completion & Graduation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Graduation Requirements</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Complete all 64 weeks of curriculum
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Successfully lead national-level project
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Present capstone legacy vision
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-[#A92FFA]" />
                      Secure post-graduation executive role
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Post-Graduation Opportunities</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#A92FFA]" />
                      Executive leadership at UCon Ministries
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#A92FFA]" />
                      Site director for expansion locations
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#A92FFA]" />
                      National advocacy and policy roles
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#A92FFA]" />
                      Movement builder and consultant
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 7: APPLICATION PROCESS - 12 Containers */}
      <section 
        ref={applicationRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 transition-all duration-700 ${
          applicationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 glow-text">
              Application Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to commit to transformation? Here's how to apply to the Leadership Development Institute.
            </p>
          </div>
          
          {/* Add Image */}
          <div className="mb-12 relative h-80 rounded-lg overflow-hidden">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/generated_images/diverse-group-of-people-filling-out-appl-51822d05-20251025022140.jpg"
              alt="Applicants during intake assessment"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Container 3-8: Application Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-[#A92FFA]">1</span>
                </div>
                <CardTitle className="text-center">Initial Contact</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with us through outreach services, open ministry programs, or direct inquiry. Build initial relationship with our team.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/contact">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Us
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-[#A92FFA]">2</span>
                </div>
                <CardTitle className="text-center">Initial Assessment</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Meet with intake coordinator for comprehensive assessment of needs, readiness, and goals. Honest conversation about commitment.
                </p>
                <Badge variant="outline">2-3 Sessions</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-[#A92FFA]">3</span>
                </div>
                <CardTitle className="text-center">Formal Application</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Complete written application including personal history, goals, references, and essay on motivation for transformation.
                </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/ldi-application.pdf">
                      <FileText className="w-4 h-4 mr-2" />
                      Download Form
                    </Link>
                  </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-[#A92FFA]">4</span>
                </div>
                <CardTitle className="text-center">Panel Interview</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Meet with leadership team and program graduates. Opportunity to ask questions and demonstrate commitment readiness.
                </p>
                <Badge variant="outline">60-90 Minutes</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-[#A92FFA]">5</span>
                </div>
                <CardTitle className="text-center">Acceptance Decision</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Leadership team reviews application. Decision typically within 2 weeks. Personalized feedback provided regardless of outcome.
                </p>
                <Badge variant="outline">2 Week Timeline</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-[#A92FFA]">6</span>
                </div>
                <CardTitle className="text-center">Commitment & Start</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Sign commitment agreement, complete pre-program orientation, and begin your 64-week transformation journey!
                </p>
                <Badge className="bg-[#A92FFA]">Your Journey Begins</Badge>
              </CardContent>
            </Card>
          </div>
          
          {/* Container 9-12: Eligibility & FAQs */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Eligibility Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Age 18+</p>
                      <p className="text-sm text-muted-foreground">Adult participants only</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Commitment Readiness</p>
                      <p className="text-sm text-muted-foreground">Willing to commit to full 64 weeks</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Sobriety Motivation</p>
                      <p className="text-sm text-muted-foreground">Desire for lasting recovery and transformation</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Open to Faith Integration</p>
                      <p className="text-sm text-muted-foreground">Willing to explore Christian spiritual formation</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">No Active Warrants</p>
                      <p className="text-sm text-muted-foreground">Legal issues must be resolved or managed</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Common Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm">Is there a cost for the program?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      No. The LDI program is completely free including housing, meals, counseling, and all training. We believe financial barriers should never prevent transformation.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm">What if I have medical needs?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      We work with healthcare partners to ensure all medical needs are met. This includes mental health medication management, chronic condition care, and emergency services.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm">Can I work during the program?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      In Tiers 1-2, focus is entirely on program participation. In Tiers 3-4, part-time employment or internships may be integrated as part of leadership development.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-sm">What about family contact?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Family contact is encouraged and supported throughout the program. We also offer family counseling and restoration services as part of healing process.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA - Final Apply Section */}
      <section 
        ref={ctaRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 transition-all duration-700 ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white border-0 shadow-2xl hover-glow">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Crown className="w-16 h-16 mx-auto mb-6" />
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 glow-text">
                  Ready to Begin Your Transformation?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  The journey from worthlessness to purpose starts with a single step. Our team is ready to walk with you through every stage of transformation.
                </p>
                
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button size="lg" variant="outline" className="bg-white text-[#A92FFA] hover:bg-white/90 border-white text-lg px-8" asChild>
                      <Link href="/ldi-waitlist">
                        <FileText className="w-5 h-5 mr-2" />
                        Apply Now
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-white text-[#F28C28] hover:bg-white/90 border-white text-lg px-8" asChild>
                      <Link href="/contact">
                        <Phone className="w-5 h-5 mr-2" />
                        Schedule Visit
                      </Link>
                    </Button>
                  </div>
                
                <div className="pt-8 border-t border-white/20">
                  <h3 className="text-xl font-semibold mb-4 glow-text">Contact Our Admissions Team</h3>
                  <div className="grid md:grid-cols-3 gap-6 text-left">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 mt-1" />
                      <div>
                        <p className="font-semibold mb-1">Phone</p>
                        <p className="text-white/80">720.663.9243</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 mt-1" />
                      <div>
                        <p className="font-semibold mb-1">Email</p>
                        <p className="text-white/80">ldi@uconministries.org</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-1" />
                      <div>
                          <p className="font-semibold mb-1">Location</p>
                          <p className="text-white/80">2000 S Colorado Blvd T1 Ste 2</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    );
  }
