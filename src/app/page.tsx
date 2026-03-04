"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ServiceModal, { ServiceModalData } from "@/components/ServiceModal";
import { outreachServices, openServices } from "@/lib/serviceData";
import { motion, AnimatePresence } from "framer-motion";
import WordShuffleHero from "@/components/WordShuffleHero";
import CookieBanner from "@/components/CookieBanner";
import NewsletterPopupModal from "@/components/NewsletterPopupModal";
import { ConvictCoverageCinematic } from "@/components/ConvictCoverageCinematic";
import LandingGate from "@/components/landing/LandingGate";
import { toast } from "sonner";
import {
  Heart, Users, Target, Compass, BookOpen, HandHeart,
  Home, Truck, Utensils, MessageSquare, Shield, Stethoscope,
  TrendingUp, Award, CircleCheck, ArrowRight, Star,
  ChevronRight, MapPin, Calendar, Phone,
  Sparkles, Crown, Mountain, Rocket, GraduationCap, Building2,
  Lightbulb, Mail, RotateCcw, Clock
} from "lucide-react";

// Intersection Observer Hook for animations - OPTIMIZED with center viewport trigger
function useIntersectionObserver(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const checkViewport = () => {
      if (typeof window === 'undefined') return { isLandscape: false, isMobileTablet: false };
      const width = window.innerWidth;
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isLandscapeTablet = width >= 768 && width <= 1024 && isLandscape;
      const isMobileTablet = width <= 1024;
      return { isLandscape: isLandscape, isMobileTablet };
    };

    const { isLandscape } = checkViewport();
    setIsLandscapeTablet(isLandscape);

    const handleViewportChange = () => {
      const { isLandscape: newLandscape } = checkViewport();
      setIsLandscapeTablet(newLandscape);
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);

    // FIXED: Use very low threshold to trigger visibility immediately
    const threshold = 0.05; // Lower threshold for immediate visibility
    const rootMargin = '0px 0px 0px 0px'; // No margin, trigger immediately

    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }
    }, { threshold, rootMargin, ...options });

    if (ref.current) {
      observer.observe(ref.current);
      
      // CRITICAL FIX: Check if element is already visible on mount
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Element is already in viewport on initial load - make it visible immediately
      if (rect.top < viewportHeight && rect.bottom > 0) {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  return [ref, isVisible, isLandscapeTablet] as const;
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const [heroRef, heroVisible, heroLandscape] = useIntersectionObserver();
  const [missionRef, missionVisible, missionLandscape] = useIntersectionObserver();
  const [foundationRef, foundationVisible, foundationLandscape] = useIntersectionObserver();
  const [valuesRef, valuesVisible, valuesLandscape] = useIntersectionObserver();
  const [tracksRef, tracksVisible, tracksLandscape] = useIntersectionObserver();
  const [ldiRef, ldiVisible, ldiLandscape] = useIntersectionObserver();
  const [outreachRef, outreachVisible, outreachLandscape] = useIntersectionObserver();
  const [servicesRef, servicesVisible, servicesLandscape] = useIntersectionObserver();
  const [testimonialsRef, testimonialsVisible, testimonialsLandscape] = useIntersectionObserver();
  const [founderRef, founderVisible, founderLandscape] = useIntersectionObserver();
  const [staffRef, staffVisible, staffLandscape] = useIntersectionObserver();
  const [impactRef, impactVisible, impactLandscape] = useIntersectionObserver();
  const [communityRef, communityVisible, communityLandscape] = useIntersectionObserver();
  const [ctaRef, ctaVisible, ctaLandscape] = useIntersectionObserver();

  // NEW: Live stats state
  const [liveStats, setLiveStats] = useState({
    livesTransformed: 500,
    ldiApplicants: 150,
    communityTouchPoints: 25000,
    prayersCount: 0,
    communityPrayers: 0,
    messageCount: 0,
    activeMentors: 0,
    weekProgram: "64",
    leadershipTiers: "4",
    supportAvailability: "24/7",
    unconditionalAcceptance: "100%",
    daysOfSupport: "365",
    communityUnited: "1",
    serviceCompletionRate: "94%",
    sobrietyRate: "87%",
    employmentRate: "78%",
    stableHousingRate: "92%",
    satisfactionRate: "98%",
    visionaryExperienceYears: "8",
    sobrietyFollowupMonths: "12+",
    employmentTimelineDays: "90",
    housingRetentionMonths: "6+"
  });

  // NEW: Live partner counts state
  const [partnerCounts, setPartnerCounts] = useState({
    faith: 12,
    socialServices: 8,
    business: 15,
    healthcare: 6,
    justice: 4,
    educational: 5,
    total: 50
  });

  // Staff animation state
  const [staffAnimationPhase, setStaffAnimationPhase] = useState<'idle' | 'stacking' | 'spreading' | 'pulsing'>('idle');
  const [startStaffAnimation, setStartStaffAnimation] = useState(false);
  const [releasedCards, setReleasedCards] = useState<Set<number>>(new Set());
  const [pulsingCard, setPulsingCard] = useState<number | null>(null);
  const [allCardsPulsing, setAllCardsPulsing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isViewportReady, setIsViewportReady] = useState(false);
  
  // NEW: State for cinematic hero image fade
  const [showHeroImage, setShowHeroImage] = useState(false);
  const [fadeOutFinal, setFadeOutFinal] = useState(false);
  
  // NEW: State to block homepage until hero animation completes
  const [heroAnimationComplete, setHeroAnimationComplete] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  
  // Check localStorage on mount for SSR hydration - skip animation if already seen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenAnimation = localStorage.getItem('hero-animation-seen') === 'true';
      if (hasSeenAnimation) {
        setHeroAnimationComplete(true);
        setShowHeroImage(true);
      }
      setIsInitialized(true);
    }
  }, []);

  // ── LANDING GATE ──────────────────────────────────────────────────────────
  // null = SSR not yet resolved (prevents flash), true = show gate, false = skip
  const [showLandingGate, setShowLandingGate] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const committed = localStorage.getItem('ucon-committed') === 'true';
      if (committed) {
        // Already committed — skip gate AND skip homepage WordShuffle
        setShowLandingGate(false);
        setHeroAnimationComplete(true);
        setShowHeroImage(true);
      } else {
        setShowLandingGate(true);
      }
    }
  }, []);

  const handleLandingComplete = () => {
    // LandingGate already wrote both localStorage keys before calling this.
    setShowLandingGate(false);
    setHeroAnimationComplete(true);
    setShowHeroImage(true);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleReplay = () => {
    setHeroAnimationComplete(false);
    setShowHeroImage(false);
    setFadeOutFinal(false);
    setAnimationStarted(false);
    setIsAnimationPlaying(false);
    setReplayKey(prev => prev + 1);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modal state for service details
  const [selectedService, setSelectedService] = useState<ServiceModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);



  // NEW: Handle openService query param to re-open modal after login
  useEffect(() => {
    const serviceId = searchParams.get("openService");
    if (serviceId) {
      const service = (outreachServices as any)[serviceId] || (openServices as any)[serviceId];
      if (service) {
        setSelectedService(service);
        setIsModalOpen(true);
      }
    }
  }, [searchParams]);

  // Newsletter popup modal state
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  // Scroll lock until hero animation is complete (only after initialization)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      if (!heroAnimationComplete) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
    };
  }, [heroAnimationComplete, isInitialized]);

  // NEW: State for dynamic testimonials from database
  const [testimonials, setTestimonials] = useState([
    {
      name: "Marcus T.",
      role: "Outreach Recipient",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762834895212-1rziiuwy9se.jpg",
      quote: "When I was living on the streets, Ucon's outreach team found me. They didn't just give me a meal—they sat with me, listened to my story, and treated me like I mattered. Now I'm on the waitlist for the LDI program, and for the first time in years, I have real hope.",
      badge: "Seen. Heard. Valued.",
    },
  ]);

  // NEW: State for dynamic staff members
  const [teamMembers, setTeamMembers] = useState([
  {
    name: "Founding Visionary Lead",
    role: "Founder & Executive Director",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/20250713_161156-1-1763993852854.jpg?width=1358&height=1393&resize=cover",
    description: `Founded Ucon Ministries after personal transformation from addiction and justice system involvement. Leads strategic vision and ministry direction with ${liveStats.visionaryExperienceYears} years of biblical experience and lived recovery journey.`,
    badges: ["Ministry Founder", "LDI Developer", "Peer Equal"]
  },
  {
    name: "Spiritual Formation Director",
    role: "Biblical Integration",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/fa7b7dbc-def8-458e-aabd-02beac5635b9/6b075e61-7fb2-42f5-b40e-e051550064ff-resized-1770374310990.webp",
    description: "Leads spiritual formation curriculum design and biblical integration across all ministry programs. Specializes in contemplative practices, theological education, and creating sacred spaces for authentic spiritual growth and transformation.",
    badges: ["M.Div. Theology", "Biblical Counselor", "SME"]
  },
  {
    name: "Clinical Formation Director",
    role: "Mental Health & Clinical Excellence",
    image: "https://i.ibb.co/PzPd8K3Y/Screenshot-20260304-084924-Gallery.jpg?width=1358&height=1393&resize=cover",
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
    name: "Frontline Director",
    role: "Lived Experience",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_072456_Gallery-1763994324892.jpg?width=1358&height=1393&resize=cover",
    description: `Leads Track 3 outreach initiatives, coordinating volunteers and ensuring immediate crisis response to community needs ${liveStats.supportAvailability}. Social Work Community Organizer`,
    badges: ["Outreach Director", "Community Bridge", "Lived Experience"]
  },
  {
    name: "Ucon Ambassador",
    role: "Convict Commit",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251124_072323_Gallery-1763994456744.jpg?width=1358&height=1393&resize=cover",
    description: "As Brand Ambassador and lived-experience leader, I embody the transformative power of hope and connection. I bridge the gap between our mission and the community, showing that through radical love and persistent effort, every 'convict' can become a catalyst for profound change.",
    badges: ["Brand Ambassador", "Community Relations", "Lived Experience"]
  }]);

  const openServiceModal = (service: ServiceModalData) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Fetch live staff on mount and merge with static defaults
  // NOTE: Only show staff up to and including "Ucon Ambassador" on homepage
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('/api/staff');
        if (response.ok) {
          const liveStaff = await response.json();
          
          // Map staff to match homepage format
          const mappedStaff = liveStaff.map((staff: any) => ({
            name: staff.name,
            role: staff.role,
            image: staff.image,
            description: staff.bio,
            badges: staff.expertise || []
          }));
          
          // Merge: Use live staff first, then fill with static if needed
          if (mappedStaff.length > 0) {
            setTeamMembers(prev => {
              const merged = [...prev];
              mappedStaff.forEach((staff: any) => {
                const index = merged.findIndex(m => m.name.toLowerCase() === staff.name.toLowerCase());
                if (index !== -1) {
                  merged[index] = { ...merged[index], ...staff };
                }
                // Don't add new staff members - only show the predefined 6
              });
              return merged;
            });
          }
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    fetchStaff();
  }, []);

  // NEW: Fetch testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials?featured=true&limit=6');
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setTestimonials(data);
          }
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

    // NEW: Fetch live stats on mount only - OPTIMIZED (no polling)
    useEffect(() => {
      const fetchStats = async () => {
        try {
          const response = await fetch('/api/stats');
          if (response.ok) {
            const data = await response.json();
            setLiveStats(data);
            // Update partner counts if available
            if (data.partners) {
              setPartnerCounts(data.partners);
            }
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      };

      fetchStats();
    }, []);

  // Newsletter popup - show when user reaches middle of page if not subscribed/dismissed recently
  useEffect(() => {
    const subscribed = localStorage.getItem("newsletter-subscribed");
    const dismissed = localStorage.getItem("newsletter-dismissed");
    
    // Early exit: If subscribed or recently dismissed, don't set up scroll listener
    if (subscribed) return;
    
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollPosition + windowHeight) / documentHeight;
      
      // Show modal when user reaches 50% of page
      if (scrollPercentage >= 0.5 && !showNewsletterModal) {
        setShowNewsletterModal(true);
        // Remove listener after showing once
        window.removeEventListener('scroll', handleScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showNewsletterModal]);

  // NEW: Detect mobile/tablet viewport
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') {
        setIsMobile(false);
        setIsViewportReady(false);
        return;
      }
      const width = window.innerWidth;
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;

      // Show animation on: Desktop (width >= 1024) OR Landscape tablet (width >= 768 AND landscape)
      // Hide animation on: Phone (width < 768) OR Portrait tablet (width >= 768 AND portrait)
      const shouldHideAnimation = width < 768 || width < 1024 && isPortrait;
      setIsMobile(shouldHideAnimation);
      setIsViewportReady(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

    // NEW: Listen for animation events to hide/show surrounding elements AND trigger hero image fade
    useEffect(() => {
      const handleAnimationStart = () => {
        setIsAnimationPlaying(true);
        setAnimationStarted(true);
        setShowHeroImage(false); // Hide image when animation starts
      };

    const handleAnimationComplete = () => {
          setIsAnimationPlaying(false);
          // Start fading out final words first
          setTimeout(() => {
            setFadeOutFinal(true); // Start letter fade-out (3000ms duration)
          }, 100);
          
          // Wait for words to COMPLETELY fade out (3000ms), THEN start hero image fade-in
          setTimeout(() => {
            setShowHeroImage(true); // Start hero background fade-in AFTER words are completely gone
            // Mark hero animation as complete - unlock the rest of the page
            setHeroAnimationComplete(true);
            // Save to localStorage so user doesn't have to watch again on return
            if (typeof window !== 'undefined') {
              localStorage.setItem('hero-animation-seen', 'true');
            }
          }, 3600); // 100ms delay + 3000ms word fade + 500ms buffer for clean separation
        };

      window.addEventListener('animationStarted', handleAnimationStart);
      window.addEventListener('wordShuffleComplete', handleAnimationComplete);

      return () => {
        window.removeEventListener('animationStarted', handleAnimationStart);
        window.removeEventListener('wordShuffleComplete', handleAnimationComplete);
      };
    }, []);

  // Staff animation - MODIFIED for mobile
  useEffect(() => {
    if (staffVisible && !startStaffAnimation && isViewportReady) {
      setStartStaffAnimation(true);

      if (isMobile) {
        setStaffAnimationPhase('pulsing');
        setReleasedCards(new Set([0, 1, 2, 3, 4, 5]));
        return;
      }

      setStaffAnimationPhase('stacking');

      setTimeout(() => {
        setStaffAnimationPhase('spreading');
        const cornerOrder = [0, 2, 3, 5, 1, 4];

        cornerOrder.forEach((cardIndex, orderIndex) => {
          setTimeout(() => {
            setReleasedCards((prev) => new Set([...prev, cardIndex]));
            setPulsingCard(cardIndex);
            setTimeout(() => {
              setPulsingCard(null);
            }, 600);
          }, orderIndex * 300);
        });

        setTimeout(() => {
          setAllCardsPulsing(true);
          setTimeout(() => {
            setAllCardsPulsing(false);
          }, 1000);
        }, cornerOrder.length * 300 + 600);
      }, 12000);
    }
  }, [staffVisible, startStaffAnimation, isMobile, isViewportReady]);

  // Calculate positions for stacking animation
  const getCardPosition = (index: number, phase: 'idle' | 'stacking' | 'spreading' | 'pulsing') => {
    if (phase === 'idle') {
      // Start off-screen: alternating left and right
      const isEven = index % 2 === 0;
      return {
        x: isEven ? -800 : 800,
        y: 0,
        rotate: 0,
        opacity: 0
      };
    } else if (phase === 'stacking') {
      // Stack in center
      return { x: 0, y: 0, rotate: 0, opacity: 1 };
    } else if (phase === 'spreading') {
      // Check if this card has been released
      if (releasedCards.has(index)) {
        // Use responsive positioning based on viewport
        const row = Math.floor(index / 3);
        const col = index % 3;

        // Responsive horizontal spread based on viewport width
        let horizontalSpread = 400; // Default for desktop
        if (typeof window !== 'undefined') {
          const width = window.innerWidth;
          if (width >= 1280) {
            horizontalSpread = 420;
          } else if (width >= 1024) {
            horizontalSpread = 400;
          } else if (width >= 768) {
            horizontalSpread = 380;
          }
        }

        const verticalSpread = 650;
        const colOffset = (col - 1) * horizontalSpread;
        const rowOffset = (row - 0.5) * verticalSpread;

        return { x: colOffset, y: rowOffset, rotate: 0, opacity: 1 };
      } else {
        return { x: 0, y: 0, rotate: 0, opacity: 1 };
      }
    } else {
      if (releasedCards.has(index)) {
        const row = Math.floor(index / 3);
        const col = index % 3;

        let horizontalSpread = 400;
        if (typeof window !== 'undefined') {
          const width = window.innerWidth;
          if (width >= 1280) {
            horizontalSpread = 420;
          } else if (width >= 1024) {
            horizontalSpread = 400;
          } else if (width >= 768) {
            horizontalSpread = 380;
          }
        }

        const verticalSpread = 650;
        const colOffset = (col - 1) * horizontalSpread;
        const rowOffset = (row - 0.5) * verticalSpread;

        return { x: colOffset, y: rowOffset, rotate: 0, opacity: 1 };
      }
      return { x: 0, y: 0, rotate: 0, opacity: 1 };
    }
  };

  const getCardDelay = (index: number, phase: 'idle' | 'stacking' | 'spreading' | 'pulsing') => {
    if (phase === 'stacking') {
      return index * 2;
    }
    return 0;
  };

  // Main render
  return (
    <div className={`min-h-screen w-full bg-background relative ${!heroAnimationComplete ? "overflow-hidden max-h-screen" : ""}`}>
      {/* Landing Gate — fullscreen z-[200], first visit only */}
      {showLandingGate === true && (
        <LandingGate onComplete={handleLandingComplete} />
      )}

      {!heroAnimationComplete && (
        <div className="fixed inset-0 z-[100] pointer-events-none" />
      )}
      
      <Navigation />
      
        <section
          ref={heroRef}
          className="relative min-h-[90vh] flex items-center justify-center overflow-hidden w-full"
          >

          {/* Hero Background Image - CINEMATIC FADE IN */}
          <div className={`absolute inset-0 z-0 transition-opacity duration-[3000ms] ease-in-out ${
          showHeroImage && heroVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
          }>
            <Image
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
              alt="Cinematic atmosphere of hope and transformation"
              fill
              sizes="100vw"
              className="object-cover brightness-[0.3]"
              quality={90}
              priority />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/90" />
          </div>
          
          <div className="w-full h-full relative z-10">
            {!heroAnimationComplete && (
              <motion.div
                className="w-full h-full flex items-center justify-center transition-all duration-1000"
                initial={{ opacity: 1 }}
                animate={{
                  opacity: fadeOutFinal ? 0 : 1,
                  scale: 1
                }}
                transition={{
                  opacity: { duration: 3, ease: "easeInOut" }
                }}
              >
                <WordShuffleHero key={replayKey} />
              </motion.div>
            )}
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 flex flex-col items-center">
              {/* CTA Buttons and Replay Button */}
              <div className={`flex flex-col items-center gap-6 transition-all duration-1000 delay-[300ms] ${
              heroAnimationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`
              }>
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  <Button size="lg" className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 bg-[#F28C28] hover:bg-[#F28C28]/90 text-white font-bold h-14" asChild>
                    <Link href="/contact">
                      Start Your Journey
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 border-[#A92FFA] hover:bg-[#A92FFA] hover:text-white font-bold h-14" asChild>
                    <Link href="/ldi">
                      The LDI Program
                    </Link>
                  </Button>
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={handleReplay} 
                    className="text-muted-foreground hover:text-[#A92FFA] hover:bg-[#A92FFA]/10 transition-all rounded-full h-14 w-14"
                  >
                    <RotateCcw className="w-7 h-7" />
                  </Button>
                </div>
              </div>

              {/* YCON LOGO TRANSITION - Fits full between Hero and Mission */}
              <motion.div 
                className="w-full relative z-20 py-8 flex justify-center items-center overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: heroAnimationComplete ? 1 : 0,
                  scale: heroAnimationComplete ? 1 : 0.95
                }}
                transition={{ duration: 3.5, delay: 0.5, ease: "easeOut" }}
              >
                <div className="w-full px-0 sm:px-0 lg:px-0">
                  <div 
                    className="relative w-full h-[250px] sm:h-[400px] md:h-[550px] lg:h-[700px] cursor-pointer group"
                    onClick={handleReplay}
                  >
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png"
                      alt="Ucon Ministries Logo"
                      fill
                      className="object-contain drop-shadow-[0_0_100px_rgba(169,47,250,0.5)] transition-all duration-1000 group-hover:scale-[1.02]"
                      priority />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="bg-background/40 backdrop-blur-lg p-8 rounded-full border border-white/20 shadow-2xl">
                        <RotateCcw className="w-12 h-12 text-white animate-spin-slow" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
                
                {/* Hero Stats Grid */}
                <div className={`mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full transition-all duration-1000 delay-[500ms] ${
                heroAnimationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`
                }>
                  <Card className={`bg-[#A92FFA] text-white hover-lift transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
                    <CardHeader className="p-3 sm:p-4">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white !whitespace-pre-line">{liveStats.livesTransformed}</CardTitle>
                      <CardDescription className="text-white/80 text-center text-xs sm:text-sm">Lives Transformed</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className={`bg-[#F28C28] text-white hover-lift transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '700ms' }}>
                    <CardHeader className="p-3 sm:p-4">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white">{liveStats.weekProgram}</CardTitle>
                      <CardDescription className="text-white/80 text-center text-xs sm:text-sm">Week Program</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className={`bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white hover-lift transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
                    <CardHeader className="p-3 sm:p-4">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white">{liveStats.leadershipTiers}</CardTitle>
                      <CardDescription className="text-white/80 text-center text-xs sm:text-sm">Leadership Tiers</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className={`hover-lift transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '900ms' }}>
                    <CardHeader className="p-3 sm:p-4">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center">{liveStats.supportAvailability}</CardTitle>
                      <CardDescription className="text-center text-xs sm:text-sm">Support Available</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
            </div>
          </div>
        </section>


      <div className={`transition-opacity duration-1000 ${
        heroAnimationComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
      
      <section
        ref={missionRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 overlay-gradient transition-all duration-1000 mb-12 sm:mb-16 ${
        missionLandscape ? 'opacity-100 translate-y-0' : missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>

        <div className="w-full max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge className={`mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90 text-xs sm:text-sm transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>ABOUT US</Badge>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>UCON MINISTRIES</h2>
          </div>
          
          <div className={`mb-6 sm:mb-8 rounded-xl overflow-hidden transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
            <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7e1174a2-cad7-4c9f-b66b-c4d256539749/generated_images/warm-and-uplifting-community-gathering-i-11afb1ee-20251119042802.jpg"
                alt="Community gathering in prayer and fellowship"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover"
                loading="lazy"
                quality={85} />

              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>
          
          <Card className={`mb-8 border-2 border-[#A92FFA]/20 hover-lift transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Mission Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground !whitespace-pre-line">
                Ucon Ministries exists to meet individuals at their point of need, offering immediate practical assistance and guiding them through a comprehensive journey of healing and transformation. Our mission is to <span className="font-semibold text-[#A92FFA]">transform feelings of worthlessness and mental health struggles into enduring purpose and dignity</span> for those deeply impacted by the justice system, addiction, homelessness, and personal brokenness.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground mt-4">
                Through unconditional connection, consistent presence, and the redemptive love of Christ, we empower individuals to discover their inherent dignity and God-given purpose, cultivating them into authentic servant leaders who drive systemic change and build a legacy of hope in their communities.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground mt-4">
                <span className="font-semibold text-[#F28C28]">We are all-inclusive and proudly welcome everyone</span>—including LGBTQ+ individuals—without exception. Every person carries sacred worth and belongs in our community of transformation.
              </p>
            </CardContent>
          </Card>
          
          <div className={`grid md:grid-cols-2 gap-8 mb-8 transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
            <Card className={`hover-lift transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#A92FFA]" />
                  Vision Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Our vision is to establish Ucon Ministries as a globally recognized, faith-integrated holistic outreach ministry, building a world where the most profound brokenness becomes the most powerful qualification for leadership. We see a global network of purpose-driven communities where leaders, forged through our intensive, three-track model of outreach, spiritual formation, and leadership development, are actively dismantling cycles of poverty, addiction, and injustice. We envision a society that affirms the inherent dignity of every person and where redemption is not just a possibility, but a tangible, lived reality that transforms families, communities, and cultures.
                </p>
              </CardContent>
            </Card>
            <Card className={`hover-lift transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#F28C28]" />
                  Faith Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  We believe in one God, revealed as the Holy Trinity: Father, Son, and Holy Spirit. We affirm the Bible as the divinely inspired, authoritative Word of God, and we hold to the lordship of Jesus Christ, who is the Way, the Truth, and the Life. We believe every person is created in God's image, possessing immeasurable worth and dignity regardless of their past or present circumstances. We believe that through the redemptive work of Christ, a new creation is possible, offering freedom from sin, addiction, and shame. Our ministry is an act of worship, driven by the Holy Spirit, committed to sharing the unconditional love of God, and dedicated to living out the call to social justice and compassionate service. We believe in the power of authentic community to facilitate healing and spiritual growth, and we are committed to biblical truth as the foundation for all our work.
                </p>
              </CardContent>
            </Card>
          </div>

          <div ref={foundationRef} className={`mt-20 mb-20 transition-all duration-1000 ${foundationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90 text-xs sm:text-sm">THE BEDROCK</Badge>
              <h3 className="text-3xl sm:text-4xl font-bold mb-6">Biblical Foundation for UCon Ministries</h3>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                Our ministry is built upon foundational biblical truths that speak to the inherent value of every individual, God's redemptive plan, and the limitless power of transformation:
              </p>
            </div>

            <div className="grid gap-6">
              {[
                {
                  verse: "Psalm 139:13-14",
                  text: "For you created my inmost being; you knit me together in my mother's womb. I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.",
                  description: "This scripture affirms the inherent worth and unique, intricate design of every individual, a cornerstone of our belief in their unassailable dignity, regardless of their past."
                },
                {
                  verse: "Jeremiah 29:11",
                  text: "'For I know the plans I have for you,' declares the LORD, 'plans to prosper you and not to harm you, plans to give you hope and a future.'",
                  description: "This verse provides the bedrock for our purpose-driven approach, reminding us that God has a hopeful and purposeful future meticulously planned for everyone, even in the deepest valleys of addiction, incarceration, or despair."
                },
                {
                  verse: "Ephesians 2:10",
                  text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
                  description: "This reinforces our focus on purpose and meaningful contribution, highlighting that individuals are not only intrinsically valued but also uniquely designed with specific gifts and callings to impact the world positively, reflecting God's artistry."
                },
                {
                  verse: "Romans 8:28",
                  text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
                  description: "This scripture offers immense comfort and profound hope, assuring us that even in the midst of adversity, suffering, and mental health struggles, God can redeem and transform all circumstances for ultimate good, meticulously shaping individuals for His divine purpose."
                },
                {
                  verse: "2 Corinthians 5:17",
                  text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
                  description: "This powerful verse underpins our belief in redemptive identity and radical transformation, signifying that a truly new beginning is always possible through Christ, irrespective of past failures or current struggles, including those deeply intertwined with mental health conditions."
                }
              ].map((item, index) => (
                <Card key={item.verse} className={`border-l-4 border-l-[#A92FFA] transition-all duration-1000 ${foundationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${index * 150}ms` }}>
                  <CardContent className="pt-6">
                    <p className="text-xl font-bold text-[#A92FFA] mb-2">{item.verse}</p>
                    <p className="text-lg italic mb-4 font-medium text-foreground">\"{item.text}\"</p>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
            <div className={`p-6 bg-card rounded-lg border border-border !border-indigo-500 !shadow-[0_2px_4px_0_rgba(241,245,249,0.15)] !shadow-[0_16px_24px_-4px_rgba(241,245,249,0.25),0_8px_16px_-4px_rgba(241,245,249,0.15)] transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
              <CircleCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#A92FFA] mb-3" />
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Immediate Support</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">24/7 crisis intervention and practical assistance</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border !border-violet-600 !shadow-[0_16px_24px_-4px_rgba(248,250,252,0.25),0_8px_16px_-4px_rgba(248,250,252,0.15)] transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1800ms' }}>
              <CircleCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#F28C28] mb-3" />
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Long-term Healing</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Comprehensive 64-week transformation program</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border !border-violet-600 transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
              <CircleCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#A92FFA] mb-3" />
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Leadership Development</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Training next-generation servant leaders</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border !border-violet-600 !shadow-[0_16px_24px_-4px_rgba(226,232,240,0.25),0_8px_16px_-4px_rgba(226,232,240,0.15)] transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2200ms' }}>
              <CircleCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#A92FFA] mb-3" />
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Community Integration</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Building lasting connections and support networks</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border !border-violet-600 transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2400ms' }}>
              <CircleCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#F28C28] mb-3" />
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Systemic Change</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Advocating for justice and policy reform</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border !border-violet-600 transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2600ms' }}>
              <CircleCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#A92FFA] mb-3" />
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Generational Impact</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Creating legacy of hope for future generations</p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={valuesRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 mb-16 transition-all duration-1000 ${
        valuesLandscape ? 'opacity-100 translate-y-0' : valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        <div className="w-full">
          <div className="text-center mb-16">
            <Badge className={`mb-4 transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>OUR CORE VALUES</Badge>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>What Drives Our Ministry</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              Six foundational principles that guide every aspect of our work and shape our approach to transformation.
            </p>
          </div>
          
          <div className={`mb-8 rounded-xl overflow-hidden transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7e1174a2-cad7-4c9f-b66b-c4d256539749/generated_images/powerful-hands-reaching-out-to-help-some-d0a19c34-20251114190901.jpg"
                alt="Hands reaching out in support and solidarity"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover"
                loading="lazy"
                quality={85} />

              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className={`hover:shadow-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle>Inherent Dignity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upholding the intrinsic worth of every individual, irrespective of background or circumstance, is central to our service delivery.
                </p>
              </CardContent>
            </Card>
            
            <Card className={`hover:shadow-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-[#F28C28]/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[#F28C28]" />
                </div>
                <CardTitle>Purpose-Driven Recovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We anchor sustainable healing in the discovery and cultivation of individual and communal purpose.
                </p>
              </CardContent>
            </Card>
            
            <Card className={`hover:shadow-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle>Unconditional Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We demonstrate radical empathy and consistent, non-judgmental presence as the foundation of engagement.
                </p>
              </CardContent>
            </Card>
            
            <Card className={`hover:shadow-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle>Community Transformation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We foster systemic change through empowered individuals who serve and inspire their communities.
                </p>
              </CardContent>
            </Card>
            
            <Card className={`hover:shadow-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-[#F28C28]/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-[#F28C28]" />
                </div>
                <CardTitle>Biblical Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We seamlessly weave spiritual truth and principles with clinically sound, evidence-based practices.
                </p>
              </CardContent>
            </Card>
            
            <Card className={`hover:shadow-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1800ms' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <HandHeart className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle>Outreach & Accessibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We proactively engage marginalized populations and eliminate barriers to access for essential services.
                </p>
              </CardContent>
            </Card>
          </div>
          
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className={`text-center p-6 bg-card rounded-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
                <p className="text-4xl font-bold text-[#A92FFA] mb-2">{liveStats.unconditionalAcceptance}</p>
                <p className="text-sm text-muted-foreground">Unconditional Acceptance</p>
              </div>
              <div className={`text-center p-6 bg-card rounded-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2200ms' }}>
                <p className="text-4xl font-bold text-[#F28C28] mb-2">{liveStats.daysOfSupport}</p>
                <p className="text-sm text-muted-foreground">Days of Support</p>
              </div>
              <div className={`text-center p-6 bg-card rounded-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2400ms' }}>
                <p className="text-4xl font-bold text-[#A92FFA] mb-2">∞</p>
                <p className="text-sm text-muted-foreground">Potential in Every Person</p>
              </div>
              <div className={`text-center p-6 bg-card rounded-lg transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2600ms' }}>
                <p className="text-4xl font-bold text-[#A92FFA] mb-2">{liveStats.communityUnited}</p>
                <p className="text-sm text-muted-foreground">Community United</p>
              </div>
            </div>
        </div>
      </section>

      <section
        ref={tracksRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5 double-exposure mb-16 transition-all duration-1000 ${
        tracksLandscape ? 'opacity-100 translate-y-0' : tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>
        <div className="w-full !text-left">
          <div className="text-center mb-16">
            <Badge className={`mb-4 !whitespace-pre-line !tracking-[10px] !whitespace-pre-line transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>More Than Ministry</Badge>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Three-Track Model</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              Meeting individuals at every stage of their journey—from immediate crisis to long-term leadership development.
            </p>
          </div>
          
          <div className={`mb-12 p-8 bg-card rounded-xl border-2 border-[#A92FFA]/20 text-center w-full max-w-2xl mx-auto transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
            <h3 className="text-2xl font-bold mb-4">An Interlocking Ecosystem</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Our three tracks are not separate silos—they form an interconnected ecosystem designed to provide comprehensive support from first contact to transformational leadership.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="outline" className="text-sm py-2 px-4">Crisis to Stability</Badge>
              <Badge variant="outline" className="text-sm py-2 px-4">Healing to Growth</Badge>
              <Badge variant="outline" className="text-sm py-2 px-4">Leadership to Legacy</Badge>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <Card className={`border-2 border-[#A92FFA] hover:shadow-xl transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-[#A92FFA] rounded-xl flex items-center justify-center mb-4">
                  <Crown className="!w-[60.9%] !h-[35px] !text-white" />
                </div>
                <Badge className="w-fit mb-2 !tracking-[10px] !whitespace-pre-line">TRACK 1</Badge>
                <CardTitle className="text-2xl !whitespace-pre-line">The Leadership Development Institute</CardTitle>
                <CardDescription className="text-base !whitespace-pre-line">Our Commitment-Based Program</CardDescription>
              </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 !whitespace-pre-line !whitespace-pre-line">The LDI will be a rigorous {liveStats.weekProgram}-week, {liveStats.leadershipTiers}-tier program that will transform profound brokenness into authentic, purpose-driven leadership through clinical psychology and systematic theology.

                  </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Requires signed commitment agreement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span className="text-sm !whitespace-pre-line">Four progressive tiers: Ascension, Pinnacle, Apex, Ucon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Clinical psychology + Systematic theology</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Develops authentic servant leaders</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/ldi" className="!whitespace-pre-line">Explore The LDI

                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className={`border-2 border-[#F28C28] hover:shadow-xl transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-[#F28C28] rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 !text-white" />
                </div>
                <Badge className="mb-2 bg-[#F28C28] !tracking-[10px] !text-[37px] !w-[33.3%] !h-5 !gap-px" />
                <CardTitle className="text-2xl">Open Ministry Services</CardTitle>
                <CardDescription className="text-base">No Commitment Required</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Accessible pathway for spiritual formation and community connection—the front door to our ministry.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Workshops: Financial literacy, communication skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Bible Studies: Fellowship and theological exploration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Pastoral Services: Counseling and prayer support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Mentoring: Peer support and guidance</span>
                  </li>
                </ul>
                <Button className="w-full" variant="secondary" asChild>
                  <Link href="/services">
                    View All Services
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className={`border-2 border-[#A92FFA] hover:shadow-xl transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-[#A92FFA] rounded-xl flex items-center justify-center mb-4">
                  <HandHeart className="w-8 h-8 !text-white" />
                </div>
                <Badge className="w-fit mb-2 bg-[#A92FFA] !whitespace-pre-line !text-white !tracking-[10px] !whitespace-pre-line">TRACK 3</Badge>
                <CardTitle className="text-2xl">Outreach & Advocacy</CardTitle>
                <CardDescription>First Responders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Direct engagement with immediate community needs—the heartbeat of our ministry's compassion.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Transportation: Access to essential services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Food Distribution: Addressing food insecurity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Shelter & Housing: Immediate and transitional</span>
                  </li>
                    <li className="flex items-start gap-2">
                      <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                      <span>{liveStats.supportAvailability} prayer support hotline</span>
                    </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/outreach" className="!whitespace-pre-line">Learn About our Outreach

                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-6 bg-card rounded-lg border border-border transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#A92FFA]/10 flex items-center justify-center text-[#A92FFA] font-bold">1</div>
                <h4 className="font-semibold !tracking-[10px]">First Contact</h4>
              </div>
              <p className="text-sm text-muted-foreground">Outreach provides immediate help—food, shelter, crisis support</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1800ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#F28C28]/10 flex items-center justify-center text-[#F28C28] font-bold">2</div>
                <h4 className="font-semibold !tracking-[10px]">Building Trust</h4>
              </div>
              <p className="text-sm text-muted-foreground">Open Services offer workshops, Bible studies, pastoral care</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#A92FFA]/10 flex items-center justify-center text-[#A92FFA] font-bold">3</div>
                <h4 className="font-semibold !tracking-[10px]">Deep Transformation</h4>
              </div>
              <p className="text-sm text-muted-foreground">LDI commitment leads to leadership and systemic change</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2200ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#A92FFA]/10 flex items-center justify-center text-[#A92FFA] font-bold">4</div>
                <h4 className="font-semibold !tracking-[10px]">Mentorship</h4>
              </div>
              <p className="text-sm text-muted-foreground">Graduates mentor new members, giving back to community</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2400ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#F28C28]/10 flex items-center justify-center text-[#F28C28] font-bold">5</div>
                <h4 className="font-semibold !tracking-[10px]">Systemic Impact</h4>
              </div>
              <p className="text-sm text-muted-foreground">Leaders influence organizations, policy, and culture</p>
            </div>
            <div className={`p-6 bg-card rounded-lg border border-border transition-all duration-1000 ${tracksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2600ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#A92FFA]/10 flex items-center justify-center text-[#A92FFA] font-bold">6</div>
                <h4 className="font-semibold !tracking-[10px]">Legacy Building</h4>
              </div>
              <p className="text-sm text-muted-foreground">Generational change through movement-building</p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={ldiRef}
        className={`w-full px-0 py-0 mb-16 transition-all duration-1000 ${
        ldiLandscape ? 'opacity-100 translate-y-0' : ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>
        <div className="w-full">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            <div className="relative min-h-[400px] lg:min-h-[600px]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7e1174a2-cad7-4c9f-b66b-c4d256539749/generated_images/warm-and-uplifting-community-gathering-i-11afb1ee-20251119042802.jpg"
                alt="Leadership Development Institute"
                fill
                className="object-cover"
                quality={85}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F28C28]/20 to-transparent" />
            </div>

            <div className="bg-white dark:bg-background px-8 sm:px-12 lg:px-16 py-12 lg:py-16 flex flex-col justify-center">
              <div className={`mb-6 transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#F28C28] flex items-center justify-center">
                    <Crown className="w-5 h-5 text-[#F28C28]" />
                  </div>
                  <span className="text-sm font-medium tracking-[3px] text-muted-foreground">WHY CHOOSE US</span>
                </div>
              </div>

              <h2 className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
                <span className="text-[#F28C28]">Leadership Development</span> <span className="text-foreground">Institute</span>
              </h2>

              <div className={`mb-8 transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F28C28]/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-[#F28C28]" />
                  </div>
                  <h3 className="text-xl font-semibold">64-Week Transformation</h3>
                </div>
                <div className="w-20 h-1 bg-[#F28C28] mb-3" />
                <p className="text-muted-foreground leading-relaxed">
                  The LDI will be a rigorous 64-week, four-tier program that will transform profound brokenness into authentic, purpose-driven leadership through clinical psychology and systematic theology.
                </p>
              </div>

              <div className={`transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F28C28]/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#F28C28]" />
                  </div>
                  <h3 className="text-xl font-semibold">Comprehensive Support</h3>
                </div>
                <div className="w-20 h-1 bg-[#F28C28] mb-3" />
                <p className="text-muted-foreground leading-relaxed">
                  Intensive mental health restoration, sobriety skills mastery, leadership development, and biblical integration in a safe, challenging, and supportive therapeutic community environment.
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-[#F28C28]/5 to-[#F28C28]/10">
            <div className="max-w-7xl mx-auto mb-16">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className={`border-2 border-[#F28C28]/20 transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#F28C28]">The Engine of Transformation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      The LDI will be our intensive, commitment-based program designed to dismantle a lifetime, or immediate sense of worthlessness and trauma through a safe, challenging, fun environment.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Requires signed commitment agreement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Therapeutic community model</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Clinical psychology + systematic theology</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className={`bg-[#F28C28] text-white transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl">Program Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Graduates will emerge as authentic servant leaders equipped to serve their communities and drive systemic change.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CircleCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Mental health restoration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CircleCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Leadership and mentoring skills</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CircleCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Systemic change capacity</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

              <div className="max-w-7xl mx-auto mb-16">
                <div className="text-center mb-12">
                  <Badge className="mb-4 bg-[#F28C28] text-white uppercase">{liveStats.leadershipTiers} PROGRESSIVE TIERS</Badge>
                  <h3 className="text-3xl sm:text-4xl font-bold">Your Journey to Leadership</h3>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card className={`border-l-4 border-l-[#F28C28] transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
                  <CardHeader>
                    <Badge className="mb-2 w-fit">Tier 1</Badge>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-[#F28C28]" />
                      Ascension
                    </CardTitle>
                    <CardDescription>Foundation & Deconstruction | The Rise</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      We use intensive mental health restoration, sobriety skills mastery, and foundational life skills with biblical systematic theology that goes moving from identity disorder to sacred worth affirmation.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Mental Health</Badge>
                      <Badge variant="outline" className="text-xs">Sobriety Skills</Badge>
                      <Badge variant="outline" className="text-xs">Life Skills</Badge>
                      <Badge variant="outline" className="text-xs">Identity</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-l-4 border-l-[#F28C28] transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
                  <CardHeader>
                    <Badge className="mb-2 w-fit bg-[#F28C28] text-white">Tier 2</Badge>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Mountain className="w-6 h-6 text-[#F28C28]" />
                      Pinnacle
                    </CardTitle>
                    <CardDescription>Mentorship Development | The Climb</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Moving from personal transformation to mentoring others. Training in advanced mental health principles, peer counseling mastery, and group facilitation. Transition from follower to mentor.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Advanced MH</Badge>
                      <Badge variant="outline" className="text-xs">Peer Counseling</Badge>
                      <Badge variant="outline" className="text-xs">Facilitation</Badge>
                      <Badge variant="outline" className="text-xs">Mentorship</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-l-4 border-l-[#F28C28] transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1800ms' }}>
                  <CardHeader>
                    <Badge className="mb-2 w-fit">Tier 3</Badge>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-[#F28C28]" />
                      Apex
                    </CardTitle>
                    <CardDescription>Systemic Leadership | Pathway</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Beyond mentoring to influencing entire systems. Learning to design and manage organizational systems, community mobilization, advocacy, and executive administration. Becoming catalysts for systemic change.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">System Design</Badge>
                      <Badge variant="outline" className="text-xs">Mobilization</Badge>
                      <Badge variant="outline" className="text-xs">Advocacy</Badge>
                      <Badge variant="outline" className="text-xs">Executive</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-l-4 border-l-[#F28C28] bg-gradient-to-br from-[#F28C28]/5 to-[#F28C28]/10 transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
                  <CardHeader>
                    <Badge className="mb-2 w-fit bg-[#F28C28] text-white">Tier 4</Badge>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Rocket className="w-6 h-6 text-[#F28C28]" />
                      UCON
                    </CardTitle>
                    <CardDescription>Visionary Leadership | Finding Purpose</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Becoming visionaries operating on national and international scale. Focus on movement-building, policy development, and cultural transformation. Prepared for executive roles with board governance, stakeholder relations, and succession planning.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Movement</Badge>
                      <Badge variant="outline" className="text-xs">Policy</Badge>
                      <Badge variant="outline" className="text-xs">Governance</Badge>
                      <Badge variant="outline" className="text-xs">Legacy</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4">YOUR PATH TO THE LDI</Badge>
                <h3 className="text-3xl sm:text-4xl font-bold">Application Process</h3>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className={`text-center p-6 bg-white dark:bg-card rounded-lg border border-border transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2200ms' }}>
                  <div className="w-12 h-12 bg-[#F28C28]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-[#F28C28]" />
                  </div>
                  <h4 className="font-semibold mb-2">1. Initial Contact</h4>
                  <p className="text-sm text-muted-foreground">Reach out through outreach or open services</p>
                </div>
                <div className={`text-center p-6 bg-white dark:bg-card rounded-lg border border-border transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2400ms' }}>
                  <div className="w-12 h-12 bg-[#F28C28]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-[#F28C28]" />
                  </div>
                  <h4 className="font-semibold mb-2">2. Assessment</h4>
                  <p className="text-sm text-muted-foreground">Comprehensive evaluation of needs and readiness</p>
                </div>
                <div className={`text-center p-6 bg-white dark:bg-card rounded-lg border border-border transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2600ms' }}>
                  <div className="w-12 h-12 bg-[#F28C28]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-6 h-6 text-[#F28C28]" />
                  </div>
                  <h4 className="font-semibold mb-2">3. Commitment</h4>
                  <p className="text-sm text-muted-foreground">Complete intake and begin Tier 1</p>
                </div>
                <div className={`text-center p-6 bg-white dark:bg-card rounded-lg border border-border transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2800ms' }}>
                  <div className="w-12 h-12 bg-[#F28C28]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-6 h-6 text-[#F28C28]" />
                  </div>
                  <h4 className="font-semibold mb-2">4. Journey</h4>
                  <p className="text-sm text-muted-foreground">Progress through 64-week transformation</p>
                </div>
              </div>
              
              <div className={`text-center transition-all duration-1000 ${ldiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '3000ms' }}>
                <Button size="lg" className="bg-[#F28C28] hover:bg-[#F28C28]/90 text-white" asChild>
                  <Link href="/ldi">
                    Learn More About LDI
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={servicesRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 bg-muted/50 overlay-gradient mb-16 transition-all duration-1000 ${
        servicesLandscape ? 'opacity-100 translate-y-0' : servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>
        <div className="w-full">
          <div className="text-center mb-16">
            <Badge className={`mb-4 bg-[#F28C28] transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }} />
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Open Ministry Services</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>Accessible programs for spiritual formation and community connection—no commitment required
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className={`hover-shadow-lg transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/warm-photojournalistic-scene-of-a-divers-d16e7dd0-20251124144451.jpg"
                  alt="Workshops background"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className={`relative z-10 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
                <div className="w-12 h-12 bg-[#F28C28]/10 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-[#F28C28]" />
                </div>
                <CardTitle className="text-xl !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !tracking-[10px] !text-center">UCON EQUIP</CardTitle>
                <CardDescription className="!whitespace-pre-line !font-bold">Workshops</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">
                  Comprehensive workshops covering spiritual foundations, practical life skills, sobriety support, creative arts, and career development. Empowering participants to achieve stability and become contributing members of the community.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Financial literacy and budgeting</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Communication and conflict resolution</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Creative expression and arts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Job readiness and career development</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className={`hover-shadow-lg transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/uplifting-small-group-bible-study-open-b-8bf54410-20251124144450.jpg"
                  alt="Spiritual growth background"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className={`relative z-10 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
                <div className="w-12 h-12 bg-[#F28C28]/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-[#F28C28]" />
                </div>
                <CardTitle className="text-xl !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !tracking-[10px] !text-center">UCON AWAKEN</CardTitle>
                <CardDescription>Spiritual Growth</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">
                  Engaging Bible studies and faith-strengthening courses designed to deepen your relationship with God. From scriptural exploration to prayer workshops, grow in understanding and strengthen bonds with others in a welcoming environment.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Weekly Bible study groups</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Topical scripture exploration</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Fellowship and community building</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Theological discussions and Q&A</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className={`hover-shadow-lg transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/compassionate-pastoral-care-session-two--45e54051-20251124144451.jpg"
                  alt="Spiritual care background"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className={`relative z-10 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
                <div className="w-12 h-12 bg-[#F28C28]/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-[#F28C28]" />
                </div>
                <CardTitle className="text-xl !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !tracking-[10px] !text-center">UCON SHEPHERD</CardTitle>
                <CardDescription>Spiritual Care & Support</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">
                  Compassionate spiritual care and personalized guidance for life's challenges. Our pastoral team walks alongside you with empathy, biblical insight, and practical care to help you find hope and renewed strength.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Individual pastoral counseling</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>24/7 prayer support hotline</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Crisis intervention and support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Spiritual guidance and direction</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className={`hover-shadow-lg transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/mentorship-and-peer-support-moment-two-a-b5b07c3a-20251124144451.jpg"
                  alt="Mentorship background"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className={`relative z-10 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
                <div className="w-12 h-12 bg-[#F28C28]/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#F28C28]" />
                </div>
                <CardTitle className="text-xl !whitespace-pre-line !whitespace-pre-line !tracking-[10px] !text-center">UCON BRIDGE</CardTitle>
                <CardDescription>Mentorship and Peer Support</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">
                  Connect with experienced guides who understand transformation and recovery. Through one-on-one relationships and group support, develop the resilience and community bonds essential for lasting change.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>One-on-one mentorship matching</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Peer support groups</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Accountability partnerships</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <span>Bridge to deeper engagement</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className={`transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
              <CardHeader>
                <Calendar className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle className="!whitespace-pre-line !whitespace-pre-line !whitespace-pre-line">Ucon Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Monday</span>
                    <span className="font-medium !whitespace-pre-line">Refer to Calandar </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Wednesday</span>
                    <span className="font-medium !whitespace-pre-line">Refer to Calandar</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Friday</span>
                    <span className="font-medium !whitespace-pre-line">Refer to Calandar</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">Worship 10AM</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className={`transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1800ms' }}>
              <CardHeader>
                <MapPin className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground mb-2">UCon Ministries Center</p>
                <p className="mb-2 !whitespace-pre-line">2000 S Colorado Blvd T1 Ste 2</p>
                <p className="mb-4 !whitespace-pre-line">Denver, CO 80210</p>
                <Button variant="outline" size="sm" className="w-full">
                  Get Directions
                </Button>
              </CardContent>
            </Card>
            <Card className={`transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
              <CardHeader>
                <Phone className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle>Get Connected</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <p className="text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium !whitespace-pre-line">720.663.9243</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Email</p>
                  <p className="font-medium !whitespace-pre-line">services@uconministries.org</p>
                </div>
              </CardContent>
            </Card>
            <Card className={`md:col-span-3 bg-[#F28C28] text-[#F28C28]/90 transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2200ms' }}>
              <CardContent className="pt-6 !text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 !whitespace-pre-line">Convict Commit?</h3>
                    <p className="!text-white !whitespace-pre-line">We are all 'Convicts' to Christd—no coommitment except to come as you are and find your place.</p>
                  </div>
                  <Button size="lg" variant="outline" className="bg-white text-[#F28C28] hover:bg-white/90" asChild>
                    <Link href="/services" className="!text-white !text-center">
                      View All Services
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        ref={outreachRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 mb-16 transition-all duration-1000 ${
        outreachLandscape ? 'opacity-100 translate-y-0' : outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>
        <div className="w-full">
          <div className="text-center mb-16">
            <Badge className={`mb-4 bg-[#A92FFA] !tracking-[10.5px] !text-white !whitespace-pre-line transition-all duration-1000 ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>TRACK 3</Badge>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-1000 ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Outreach & Community Advocacy</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              The heartbeat of our ministry's compassion—extending practical help to those experiencing immediate crisis and systemic hardship.
            </p>
          </div>
          
          <div className={`mb-12 rounded-xl overflow-hidden transition-all duration-1000 ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7e1174a2-cad7-4c9f-b66b-c4d256539749/generated_images/community-service-volunteers-distributin-326fc9c3-20251114190859.jpg"
                alt="Volunteers serving community with food distribution"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover"
                loading="lazy"
                quality={85} />

              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card 
              className={`hover:shadow-lg transition-all duration-1000 relative overflow-hidden cursor-pointer hover:border-[#A92FFA] ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: '1000ms' }}
              onClick={() => openServiceModal(outreachServices.transit)}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/professional-photograph-of-a-modern-comm-c9ea36e2-20251124143645.jpg"
                  alt="Community transportation services"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle className="!whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !tracking-[10px] !text-center">UCON TRANSIT</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-muted-foreground mb-4">
                  Removing barriers to stability by providing transportation to essential services.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Job interviews</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Medical appointments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Court dates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Housing connections</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card 
              className={`hover:shadow-lg transition-all duration-1000 relative overflow-hidden cursor-pointer hover:border-[#A92FFA] ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: '1200ms' }}
              onClick={() => openServiceModal(outreachServices.nourish)}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/warm-photograph-of-community-food-distri-c574229f-20251124143645.jpg"
                  alt="Food distribution services"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <Utensils className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle className="!whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !tracking-[10px] !whitespace-pre-line !text-center">UCON NOURISH</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-muted-foreground mb-4">
                  Addressing food insecurity as a primary step toward stability and recovery.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Weekly food drives</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Community pantry</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span className="!whitespace-pre-line">upcoming Hot meal service</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Food bank partnerships</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card 
              className={`hover:shadow-lg transition-all duration-1000 relative overflow-hidden cursor-pointer hover:border-[#A92FFA] ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: '1400ms' }}
              onClick={() => openServiceModal(outreachServices.neighbors)}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/community-members-working-together-on-ne-9c2d6c9e-20251124143645.jpg"
                  alt="Community engagement and collaboration"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle className="!whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !tracking-[10px] !text-center">UCON NEIGHBORS</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-muted-foreground mb-4">
                  Active presence building trust and creating organic relationship opportunities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Community clean-ups</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Non-profit collaborations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Community festivals</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Partnership initiatives</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card 
              className={`hover:shadow-lg transition-all duration-1000 relative overflow-hidden cursor-pointer hover:border-[#A92FFA] ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: '1600ms' }}
              onClick={() => openServiceModal(outreachServices.voice)}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/advocacy-and-community-organizing-scene--ae64f934-20251124143645.jpg"
                  alt="Community advocacy and justice work"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle className="!whitespace-pre-line !whitespace-pre-line !tracking-[10px] !whitespace-pre-line !text-center">UCON VOICE</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-muted-foreground mb-4">
                  Giving voice to the voiceless and addressing root causes of brokenness.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Fair housing advocacy</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Criminal justice reform</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Policy engagement</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Systemic justice work</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card 
              className={`hover:shadow-lg transition-all duration-1000 relative overflow-hidden cursor-pointer hover:border-[#A92FFA] ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: '1800ms' }}
              onClick={() => openServiceModal(outreachServices.haven)}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/safe-and-welcoming-transitional-housing--71246d73-20251124143644.jpg"
                  alt="Safe housing and shelter services"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle className="!whitespace-pre-line !tracking-[10px] !text-center">UCON HAVEN</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-muted-foreground mb-4">
                  Providing safe, stable environments as foundation for recovery journey.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Emergency shelter</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Transitional housing</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Housing vouchers</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Long-term solutions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card 
              className={`hover:shadow-lg transition-all duration-1000 relative overflow-hidden cursor-pointer hover:border-[#A92FFA] ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: '2000ms' }}
              onClick={() => openServiceModal(outreachServices.steps)}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/compassionate-support-for-recovery-journ-60f3b1af-20251124143645.jpg"
                  alt="Recovery support and rehabilitation services"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 text-[#A92FFA]" />
                </div>
                <CardTitle className="!tracking-[10px] !text-center">UCON STEPS</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-muted-foreground mb-4">
                  Building a community of recovery from drugs, alcohol, and substances through traditional 12-step meetings and comprehensive support.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Traditional 12-step meetings (virtual & physical)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Recovery community support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Sobriety skills & accountability</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Medical care connections</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className={`bg-[#A92FFA] text-[#A92FFA]/90 transition-all duration-1000 ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2200ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl !text-white">Need Immediate Help?</CardTitle>
                <CardDescription className="!text-white">We're here 24/7 for crisis support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 !text-white">
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6" />
                    <div>
                      <p className="font-semibold text-lg !text-white !whitespace-pre-line">720.663.9243</p>
                      <p className="text-sm !text-white">Crisis Hotline</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6" />
                    <div>
                      <p className="font-semibold !whitespace-pre-line">outreach@uconministries.org</p>
                      <p className="text-sm !text-white">Emergency Email</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-white text-[#A92FFA] hover:bg-white/90">
                    Request Immediate Assistance
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className={`transition-all duration-1000 relative overflow-hidden ${outreachVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2400ms' }}>
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a2ceb8f1-eb2e-4645-91c6-07d3566aa8ca/generated_images/community-volunteers-in-action-serving-o-e2dd81e8-20251124143646.jpg"
                  alt="Volunteers serving in community outreach"
                  fill
                  className="object-cover opacity-10"
                  loading="lazy"
                  quality={75} />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl !whitespace-pre-line !whitespace-pre-line !tracking-[10px] !text-center">UCON FRONTLINE</CardTitle>
                <CardDescription>Volunteer in our outreach. Join us in serving the community</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">
                  Be part of our first responder team. Whether you can give a few hours a week or want to make a deeper commitment, there's a place for you.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Food distribution volunteers</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Transportation drivers</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CircleCheck className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span>Shelter support staff</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/outreach">Learn More About Outreach</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        ref={testimonialsRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5 double-exposure mb-5 transition-all duration-1000 ${
        testimonialsLandscape ? 'opacity-100 translate-y-0' : testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>
        <div className="w-full">
          <div className="text-center mb-16">
            <Badge className={`mb-4 !tracking-[10px] transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>Stories of Hope</Badge>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Lives Being Transformed</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              Real stories from real people experiencing hope, community, and the beginning of transformation through UCon Ministries.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className={`hover-lift h-full bg-card transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${800 + index * 200}ms` }}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                      <Image
                        src={testimonial.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop"}
                        alt={testimonial.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                        loading="lazy"
                        quality={75} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#A92FFA] text-[#A92FFA]" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic mb-3">"{testimonial.quote}"</p>
                  {testimonial.badge && (
                    <Badge variant="outline">{testimonial.badge}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className={`text-center p-6 bg-card rounded-lg transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
              <p className="text-4xl font-bold text-[#A92FFA] mb-2">150+</p>
              <p className="text-sm text-muted-foreground">People Served Monthly</p>
            </div>
            <div className={`text-center p-6 bg-card rounded-lg transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2200ms' }}>
              <p className="text-4xl font-bold text-[#F28C28] mb-2">200+</p>
              <p className="text-sm text-muted-foreground">Meals Distributed Weekly</p>
            </div>
            <div className={`text-center p-6 bg-card rounded-lg transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2400ms' }}>
              <p className="text-4xl font-bold text-[#A92FFA] mb-2">45</p>
              <p className="text-sm text-muted-foreground">LDI Applicants</p>
            </div>
            <div className={`text-center p-6 bg-card rounded-lg transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2600ms' }}>
              <p className="text-4xl font-bold text-[#A92FFA] mb-2">100%</p>
              <p className="text-sm text-muted-foreground">Commitment to Transform</p>
            </div>
          </div>
        </div>
      </section>

      <ConvictCoverageCinematic />

      <section
        ref={founderRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 overlay-gradient transition-all duration-1000 mb-16 ${
        founderLandscape ? 'opacity-100 translate-y-0' : founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>

        <div className="w-full">
          <div className={`text-center mb-16 transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
            <Badge className={`mb-4 bg-[#A92FFA] !tracking-[10px] !whitespace-pre-line transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>OUR STORY</Badge>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 glow-text transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>Founded on Transformation</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
              From rock bottom to redemptive purpose—the journey that built Ucon Ministries.
            </p>
          </div>
          
          <div className={`mb-12 transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
            <Card className="border-2 border-[#A92FFA]/30 hover-lift">
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="md:w-48 flex-shrink-0 relative rounded-lg overflow-hidden !w-48 aspect-[1358/1393]">
                      <Image
                        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/20251123_213802-1763959096601.jpg?width=1358&height=1393&resize=cover"
                        alt="Ministry Founder - Visionary Lead"
                        fill
                        sizes="(max-width: 768px) 192px, 192px"
                        className="object-cover object-center !mx-0 !px-0 !w-full !h-full !max-w-full !text-center"
                        loading="lazy"
                        quality={75} />

                    </div>

                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2 !text-justify !whitespace-pre-line">What If Your Darkest Moment Became Your Greatest Purpose?</CardTitle>
                    <CardDescription className="text-lg !text-justify">The Journey Nobody Expected to Change Everything</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 text-lg">
                <p className="text-muted-foreground leading-relaxed !text-justify">
                  Ucon Ministries was founded in 2024 by one man and other individuals who never imagined their darkest moments would become their greatest mission. Our founder spent years trapped in a cycle of worthlessness—broken by the justice system, consumed by addiction, crushed by homelessness, and drowning in mental health struggles that seemed impossible to overcome.
                </p>
                <p className="text-muted-foreground leading-relaxed !text-justify">
                  Rock bottom felt permanent. Hope felt like a cruel joke. Purpose felt like something meant for other people.
                </p>
                <p className="text-muted-foreground leading-relaxed !text-justify">
                  But then came the choice nobody saw coming—the decision to do the work. Not just any work, but the brutal, honest work of facing the truth. Our founder recognized they couldn't do it alone, but also couldn't be saved by someone else's effort. They chose to show up. Chose the right people who wouldn't enable but would empower. Chose therapy that demanded honesty. Chose to open the Bible and actually wrestle with God. Chose to let Jesus into the mess. Chose community even when isolation felt safer.
                </p>
                <p className="text-muted-foreground leading-relaxed !text-justify">
                  Through Christ's redemptive power—accepted and pursued—combined with professional therapy, biblical truth, personal accountability, and a community that walked alongside without carrying the load, transformation became possible. Not handed down from above. Not magically fixed. But fought for. Chosen. Built one hard decision at a time.
                </p>
                <p className="text-muted-foreground leading-relaxed !text-justify">
                  This hard-won journey revealed a profound truth: real transformation requires more than temporary fixes. It demands comprehensive support, biblical integration, clinical excellence, personal commitment to do the work, and most importantly—choosing the right people who believe in your potential while you build your own.
                </p>
                <p className="text-muted-foreground leading-relaxed !text-justify">
                  Ucon Ministries was born from that revelation. We became the ministry our founder desperately needed but couldn't find—one that meets people at their point of deepest need and provides the tools, truth, and support while they do the transformative work themselves. We walk with them through every step: from crisis stabilization to discovering dignity, from learning practical skills to finding lasting purpose, from being served to becoming servant leaders who transform entire communities.
                </p>
                <p className="text-muted-foreground leading-relaxed font-semibold !text-justify">
                  What started as one person's choice to fight for their own life has become a movement of restoration. That's the journey nobody expected to change everything—but it did.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className={`hover-lift transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
              <CardHeader>
                <Lightbulb className="w-10 h-10 text-[#A92FFA] mb-3" />
                <CardTitle className="!tracking-[10px] !text-left">The Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground !text-left">
                  To create a ministry that doesn't just offer services, but builds a comprehensive ecosystem of transformation 
                  from immediate crisis response to international leadership development.
                </p>
              </CardContent>
            </Card>
            <Card className={`hover-lift transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
              <CardHeader>
                <Heart className="w-10 h-10 text-[#F28C28] mb-3" fill="currentColor" />
                <CardTitle className="!tracking-[10px]">The Heart</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every person carries infinite worth and God-given purpose. Our calling is to help people discover their 
                  sacred dignity and become the servant leaders they were created to be.
                </p>
              </CardContent>
            </Card>
            <Card className={`hover-lift transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
              <CardHeader>
                <Target className="w-10 h-10 text-[#A92FFA] mb-3" />
                <CardTitle className="!tracking-[10px]">The Method</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Combining clinical psychology, systematic theology, and lived experience into a proven model that produces 
                  authentic transformation and equips leaders for systemic change.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className={`bg-gradient-to-br from-[#A92FFA]/10 to-[#A92FFA]/5 border-2 border-[#A92FFA]/20 transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1800ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl !text-center !text-orange-400">What Sets Us Apart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Lived Experience Leadership</p>
                    <p className="text-sm text-muted-foreground">Led by those who've walked the journey from brokenness to purpose</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Comprehensive Care Ecosystem</p>
                    <p className="text-sm text-muted-foreground">Three tracks meeting every need from crisis to leadership</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Clinical Excellence + Biblical Integration</p>
                    <p className="text-sm text-muted-foreground">Evidence-based practices infused with Christ's transforming love</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`bg-gradient-to-br from-[#F28C28]/10 to-[#F28C28]/5 border-2 border-[#F28C28]/20 transition-all duration-1000 ${founderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl !text-center !text-purple-600">Our Commitment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-[#F28C28] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Unconditional Acceptance</p>
                    <p className="text-sm text-muted-foreground">Meeting people exactly where they are, no prerequisites</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-[#F28C28] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Long-term Partnership</p>
                    <p className="text-sm text-muted-foreground">Walking with individuals for years, not just weeks</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-[#F28C28] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Generational Impact</p>
                    <p className="text-sm text-muted-foreground">Building leaders who transform families and communities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        ref={staffRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 mb-32 ${
        isMobile || !isViewportReady ? 'min-h-0' : 'min-h-[1600px]'} bg-white dark:bg-background transition-all duration-1000 ${
        staffLandscape ? 'opacity-100 translate-y-0' : staffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>

        <div className="w-full">
          <div className={`text-center mb-16 transition-all duration-1000 ${staffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge className={`mb-4 bg-[#F28C28] text-white transition-all duration-1000 ${staffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>Our Team</Badge>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 text-foreground transition-all duration-1000 sm:!text-violet-600 ${staffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Meet Our Leadership</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${staffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              A diverse team united by personal transformation stories and a shared calling to serve those seeking hope and purpose.
            </p>
          </div>
          
          {isMobile || !isViewportReady ?
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {teamMembers.slice(0, 6).map((member, index) =>
            <Card key={member.name} className={`hover-lift h-full bg-card transition-all duration-1000 ${staffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${800 + index * 200}ms` }}>
                    <CardHeader className="transition-opacity duration-700">
                      <div className="w-full aspect-[1358/1393] rounded-lg overflow-hidden mb-4 relative bg-muted">
                        <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      style={member.name === "Frontline Director" ? { objectPosition: "center 100%" } : member.name === "Spiritual Formation Director" ? { objectPosition: "center 15%" } : undefined} />
                      </div>
                      <CardTitle className="text-center text-xl">{member.name}</CardTitle>
                      <CardDescription className="text-center">{member.role}</CardDescription>
                    </CardHeader>

                  <CardContent className="text-center transition-opacity duration-700">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-4 max-h-20 overflow-y-auto text-left px-2 !font-normal">{member.description}</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {member.badges.map((badge) =>
                    <Badge key={badge} variant="outline">
                            {badge}
                          </Badge>
                    )}
                      </div>
                    </CardContent>
                  </Card>
            )}
            </div> :

          <div className="relative min-h-[1400px] flex items-center justify-center mb-16">
              <div className="relative w-full max-w-5xl h-[1400px] flex items-center justify-center">
                <AnimatePresence>
                  {teamMembers.slice(0, 6).map((member, index) => {
                  const position = getCardPosition(index, staffAnimationPhase);
                  const delay = getCardDelay(index, staffAnimationPhase);
                  const isPulsing = pulsingCard === index;
                  const isEven = index % 2 === 0;

                  return (
                    <motion.div
                      key={member.name}
                      className="absolute w-80"
                      initial={{ x: isEven ? -800 : 800, y: 0, rotate: 0, opacity: 0 }}
                      animate={{
                        x: position.x,
                        y: position.y,
                        rotate: position.rotate,
                        opacity: position.opacity,
                        scale: isPulsing || allCardsPulsing ? 1.05 : 1
                      }}
                      transition={{
                        duration: allCardsPulsing ? 1.2 : staffAnimationPhase === 'stacking' ? 3 : 1.5,
                        delay: delay,
                        ease: "easeInOut"
                      }}
                      style={{ zIndex: isPulsing || allCardsPulsing ? 100 : 10 + index }}>

                          <Card className={`hover-lift h-full ${
                      isPulsing ? 'ring-4 ring-[#A92FFA] shadow-2xl' : ''} ${

                      allCardsPulsing ? 'ring-4 ring-[#A92FFA] shadow-[0_0_30px_rgba(169,47,250,0.6),0_0_60px_rgba(242,140,40,0.4)]' : ''}`
                      }>
                          <CardHeader>
                            <div className="w-full aspect-[1358/1393] rounded-lg overflow-hidden mb-4 relative">
                              <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              className="object-cover"
                              style={member.name === "Frontline Director" ? { objectPosition: "center 100%" } : member.name === "Spiritual Formation Director" ? { objectPosition: "center 15%" } : undefined} />
                            </div>
                            <CardTitle className="text-center text-xl !text-orange-400 !font-bold !not-italic">{member.name}</CardTitle>
                            <CardDescription className="text-center !text-purple-400 !font-bold !whitespace-pre-line">{member.role}</CardDescription>
                          </CardHeader>

                          <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground mb-3 !font-normal">{member.description}</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {member.badges.map((badge) =>
                            <Badge key={badge} variant="outline" className="!text-violet-300">
                                  {badge}
                                </Badge>
                            )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>);

                })}
                </AnimatePresence>
              </div>
            </div>
          }
          
          <div className="grid md:grid-cols-2 gap-8 mt-32">
            <Card className={`border-2 border-[#A92FFA]/30 transition-all duration-1000 ${staffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2600ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl !text-center !text-orange-400">Our Team Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-[#A92FFA] mt-1 flex-shrink-0" fill="currentColor" />
                  <div>
                    <p className="font-semibold mb-1">Lived Experience</p>
                    <p className="text-sm text-muted-foreground">
                      Many team members are LDI graduates who understand the journey from brokenness to purpose
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 mt-1 flex-shrink-0 !text-orange-400" />
                  <div>
                    <p className="font-semibold mb-1">Diverse Expertise</p>
                    <p className="text-sm text-muted-foreground">
                      Clinical psychology, theology, social work, and community organizing unified in mission
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-[#A92FFA] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Continuous Learning</p>
                    <p className="text-sm text-muted-foreground">
                      Conmited to ongoing professional development and evidence-based practice excellence
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`bg-gradient-to-br from-[#F28C28]/10 to-[#A92FFA]/10 border-2 border-[#F28C28]/30 transition-all duration-1000 ${staffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2800ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl !text-center !text-purple-400">Join Our Team</CardTitle>
                <CardDescription className="!text-center">Make a Difference Through Service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Whether you're seeking employment, internship opportunities, or volunteer positions, 
                  there's a place for you at UCon Ministries.
                </p>
                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/careers">View Career Opportunities</Link>
                  </Button>
                  <Button className="w-full" size="lg" variant="outline" asChild>
                    <Link href="/volunteer">Become a Volunteer</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Join a team that's transforming lives and communities through unconditional love and purpose-driven service
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        ref={impactRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 overlay-gradient mb-16 transition-all duration-1000 ${
        impactLandscape ? 'opacity-100 translate-y-0' : impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>
        <div className="w-full">
          <div className={`text-center mb-16 transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge className={`mb-4 transition-all duration-1000 !px-2 !tracking-[10px] !py-0.5 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>Our Impact</Badge>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-1000 sm:!text-orange-400 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Measuring Transformation</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              Live milestones tracking our impact and transformational journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className={`text-center bg-gradient-to-br from-[#A92FFA]/10 to-[#A92FFA]/5 border-2 border-[#A92FFA]/20 transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-[#A92FFA] mx-auto mb-4" />
                <CardTitle className="text-5xl font-bold text-[#A92FFA] mb-2">{liveStats.livesTransformed}+</CardTitle>
                <CardDescription className="text-lg">Lives Transformed Since 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  From crisis to stability to leadership—each person represents a ripple of hope in their community.
                </p>
              </CardContent>
            </Card>
            <Card className={`text-center bg-gradient-to-br from-[#F28C28]/10 to-[#F28C28]/5 border-2 border-[#F28C28]/20 transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
              <CardHeader>
                <Users className="w-12 h-12 text-[#F28C28] mx-auto mb-4" />
                <CardTitle className="text-5xl font-bold text-[#F28C28] mb-2">{liveStats.ldiApplicants}</CardTitle>
                <CardDescription className="text-lg">LDI Applicants</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Future servant leaders equipped to mentor others, manage programs, and advocate for systemic change.
                </p>
              </CardContent>
            </Card>
            <Card className={`text-center bg-gradient-to-br from-[#A92FFA]/10 to-[#A92FFA]/5 border-2 border-[#A92FFA]/20 transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
              <CardHeader>
                <HandHeart className="w-12 h-12 text-[#A92FFA] mx-auto mb-4" />
                <CardTitle className="text-5xl font-bold text-[#A92FFA] mb-2">{liveStats.communityPrayers.toLocaleString()}+</CardTitle>
                <CardDescription className="text-lg">Community Prayers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Times our community has prayed together, supporting each other through faith and connection.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className={`mb-12 transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
            <Card className="bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5 border-2 border-[#A92FFA]/20 hover-lift">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#A92FFA] rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white" fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Active Prayer Wall</h3>
                      <p className="text-muted-foreground">Our community united in prayer</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[#A92FFA]">{liveStats.prayersCount}</p>
                      <p className="text-sm text-muted-foreground">Active Prayers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[#F28C28]">{liveStats.messageCount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Messages</p>
                    </div>
                  </div>
                  <Button size="lg" asChild className="bg-[#F28C28] hover:bg-[#F28C28]/90">
                    <Link href="/prayer-wall">
                      Visit Prayer Wall
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className={`transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
                <CardHeader>
                  <Award className="w-8 h-8 text-[#A92FFA] mb-2" />
                  <CardTitle className="text-3xl font-bold">{liveStats.serviceCompletionRate}</CardTitle>
                  <CardDescription className="!whitespace-pre-line">Service and Workshop Completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Industry-leading retention through unconditional support and purpose discovery.
                  </p>
                </CardContent>
              </Card>
              <Card className={`transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1800ms' }}>
                <CardHeader>
                  <Shield className="w-8 h-8 text-[#F28C28] mb-2" />
                  <CardTitle className="text-3xl font-bold">{liveStats.sobrietyRate}</CardTitle>
                  <CardDescription>Long-term Sobriety</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sustained recovery rates at {liveStats.sobrietyFollowupMonths} post-program graduation.
                  </p>
                </CardContent>
              </Card>
              <Card className={`transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
                <CardHeader>
                  <TrendingUp className="w-8 h-8 text-[#A92FFA] mb-2" />
                  <CardTitle className="text-3xl font-bold">{liveStats.employmentRate}</CardTitle>
                  <CardDescription>Employment Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Graduates securing meaningful employment within {liveStats.employmentTimelineDays} days.
                  </p>
                </CardContent>
              </Card>
              <Card className={`transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2200ms' }}>
                <CardHeader>
                  <Home className="w-8 h-8 text-[#A92FFA] mb-2" />
                  <CardTitle className="text-3xl font-bold">{liveStats.stableHousingRate}</CardTitle>
                  <CardDescription>Stable Housing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Permanent housing secured and maintained for {liveStats.housingRetentionMonths}.
                  </p>
                </CardContent>
              </Card>
              <Card className={`transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2400ms' }}>
                <CardHeader>
                  <Users className="w-8 h-8 text-[#F28C28] mb-2" />
                  <CardTitle className="text-3xl font-bold">{liveStats.activeMentors}</CardTitle>
                  <CardDescription>Active Mentors</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    LDI graduates currently mentoring Tier 1 and 2 participants.
                  </p>
                </CardContent>
              </Card>
              <Card className={`transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2600ms' }}>
                <CardHeader>
                  <Heart className="w-8 h-8 text-[#A92FFA] mb-2" />
                  <CardTitle className="text-3xl font-bold">{liveStats.satisfactionRate}</CardTitle>
                  <CardDescription>Satisfaction Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Participants reporting positive experience and growth.
                  </p>
                </CardContent>
              </Card>
              <Card className={`transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2800ms' }}>
                <CardHeader>
                  <Target className="w-8 h-8 text-[#A92FFA] mb-2" />
                  <CardTitle className="text-3xl font-bold">{partnerCounts.total}</CardTitle>
                  <CardDescription>Partner Organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Collaborative relationships amplifying community impact.
                  </p>
                </CardContent>
              </Card>
            <Card className={`transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '3000ms' }}>
              <CardHeader>
                <Sparkles className="w-8 h-8 text-[#F28C28] mb-2" />
                <CardTitle className="text-3xl font-bold">∞</CardTitle>
                <CardDescription>Potential Unlocked</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every person carries infinite worth and purpose waiting to be discovered.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        ref={communityRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 bg-muted/50 double-exposure mb-16 transition-all duration-1000 ${
        communityLandscape ? 'opacity-100 translate-y-0' : communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>
        <div className="w-full">
          <div className={`text-center mb-16 transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge className={`mb-4 !tracking-[10px] transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>Together We Rise</Badge>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-1000 sm:!text-orange-500 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Community & Partners</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              Transformation happens in community. We're grateful for our partners, volunteers, and supporters who make this work possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className={`transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl !text-center">Building Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We believe lasting change happens when individuals are connected to a supportive community. Through partnerships with local organizations, businesses, and faith communities, we create a network of hope.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Faith community partnerships for spiritual support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Business collaborations for employment opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Non-profit networks for comprehensive services</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className={`bg-[#A92FFA] text-[#A92FFA]/90 transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl !text-white !text-center">Volunteer Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 !text-white">
                  Whether you have an hour a week or want to make a deeper commitment, there's a place for you in our ministry.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 !text-white">
                    <CircleCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm !text-white">Outreach team volunteers</span>
                  </li>
                  <li className="flex items-start gap-2 !text-white">
                    <CircleCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm !text-white">Workshop facilitators</span>
                  </li>
                  <li className="flex items-start gap-2 !text-white">
                    <CircleCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Administrative support</span>
                  </li>
                  <li className="flex items-start gap-2 !text-white">
                    <CircleCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Prayer partners</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className={`hover-lg transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
              <CardHeader>
                <div className="w-20 h-20 mx-auto mb-4 relative rounded-full overflow-hidden">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-2a728e5b-20251114060310.jpg"
                    alt="Faith Partners Logo"
                    fill
                    className="object-cover"
                    loading="lazy"
                    quality={75} />

                </div>
                <CardTitle>Faith Partners</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Local churches and faith communities providing spiritual support, volunteers, and resources.
                  </p>
                  <Badge variant="outline" className="!whitespace-pre-line">{partnerCounts.faith} Religious Partners</Badge>
                </CardContent>
              </Card>
              <Card className={`hover-lg transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
                <CardHeader>
                  <div className="w-20 h-20 mx-auto mb-4 relative rounded-full overflow-hidden">
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-denver-s-1532aae8-20251114060310.jpg"
                      alt="Social Services Logo"
                      fill
                      className="object-cover"
                      loading="lazy"
                      quality={75} />

                  </div>
                  <CardTitle>Social Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Non-profit organizations collaborating to provide comprehensive wraparound services.
                  </p>
                  <Badge variant="outline">{partnerCounts.socialServices} Service Partners</Badge>
                </CardContent>
              </Card>
              <Card className={`hover-lg transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
                <CardHeader>
                  <div className="w-20 h-20 mx-auto mb-4 relative rounded-full overflow-hidden">
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-1ac4716c-20251114060310.jpg"
                      alt="Business Partners Logo"
                      fill
                      className="object-cover"
                      loading="lazy"
                      quality={75} />

                  </div>
                  <CardTitle>Business Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Local businesses offering employment opportunities and skills training for graduates.
                  </p>
                  <Badge variant="outline">{partnerCounts.business} Employers</Badge>
                </CardContent>
              </Card>
              <Card className={`hover-lg transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1800ms' }}>
                <CardHeader>
                  <div className="w-20 h-20 mx-auto mb-4 relative rounded-full overflow-hidden">
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-a483b373-20251114060310.jpg"
                      alt="Healthcare Partners Logo"
                      fill
                      className="object-cover"
                      loading="lazy"
                      quality={75} />

                  </div>
                  <CardTitle>Healthcare Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Medical and mental health professionals providing clinical support and referrals.
                  </p>
                  <Badge variant="outline">{partnerCounts.healthcare} Healthcare Providers</Badge>
                </CardContent>
              </Card>
              <Card className={`hover-lg transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
                <CardHeader>
                  <div className="w-20 h-20 mx-auto mb-4 relative rounded-full overflow-hidden">
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-37949567-20251114060310.jpg"
                      alt="Justice Partners Logo"
                      fill
                      className="object-cover"
                      loading="lazy"
                      quality={75} />

                  </div>
                  <CardTitle>Justice Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Legal aid organizations and reentry programs supporting those impacted by the justice system.
                  </p>
                  <Badge variant="outline">{partnerCounts.justice} Legal Partners</Badge>
              </CardContent>
            </Card>
            <Card className={`hover-lg transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2200ms' }}>
              <CardHeader>
                <div className="w-20 h-20 mx-auto mb-4 relative rounded-full overflow-hidden">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-b7a95e50-20251114060310.jpg"
                    alt="Educational Partners Logo"
                    fill
                    className="object-cover"
                    loading="lazy"
                    quality={75} />

                </div>
                <CardTitle>Educational Partners</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Schools and training programs offering education and vocational development.
                  </p>
                  <Badge variant="outline">{partnerCounts.educational} Education Partners</Badge>
                </CardContent>
            </Card>
          </div>
          <Card className={`bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 border-2 border-[#A92FFA]/20 transition-all duration-1000 ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2400ms' }}>
            <CardContent className="pt-8">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 !whitespace-pre-line">Become a Convict</h3>
                <p className="text-muted-foreground mb-6">
                  Together, we can multiply our impact and reach more people who need hope, healing, and purpose. Let's explore how your organization can join this transformational work.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/get-involved">Partner With Us</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/volunteer">Volunteer Today</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        ref={ctaRef}
        className={`w-full px-4 sm:px-6 lg:px-8 py-20 mb-16 transition-all duration-1000 ${
        ctaLandscape ? 'opacity-100 translate-y-0' : ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
        }>
        <div className="w-full">
          <div className={`text-center mb-16 transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge className={`mb-4 !tracking-[10px] transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>GET INVOLVED</Badge>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Be Part of the Transformation</h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              Every person has a role to play in building a community of hope. Choose your path to get involved.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className={`hover-xl transition-shadow border-2 hover:border-[#A92FFA] transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-[#A92FFA] rounded-xl flex items-center justify-center mb-4">
                  <ProjectGraduationCap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Apply to LDI</CardTitle>
                <CardDescription>Begin Your Journey</CardDescription>
              </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ready to commit to transformation? Apply for our intensive {liveStats.weekProgram}-week Leadership Development Institute.
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/ldi-waitlist">Apply Now</Link>
                  </Button>
                </CardContent>
            </Card>
            
            <Card className={`hover-xl transition-shadow border-2 hover:border-[#F28C28] transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-[#F28C28] rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Donate</CardTitle>
                <CardDescription>Fuel Transformation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your financial support directly impacts lives, providing resources for healing.
                </p>
                <Button className="w-full" asChild>
                  <Link href="/donations">Give Now</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className={`hover-xl transition-shadow border-2 hover:border-[#A92FFA] transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-[#A92FFA] rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Volunteer</CardTitle>
                <CardDescription>Serve Your Community</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our team of volunteers making a difference in people's lives every day.
                </p>
                <Button className="w-full" asChild>
                  <Link href="/volunteer">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
      
      </div>
      
      <ServiceModal 
        data={selectedService}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      
      <NewsletterPopupModal 
        isOpen={showNewsletterModal}
        onClose={() => setShowNewsletterModal(false)}
      />
      
      {heroAnimationComplete && <CookieBanner />}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Clock className="w-8 h-8 animate-spin text-[#A92FFA]" /></div>}>
      <HomePageContent />
    </Suspense>
  );
}

// Rename GraduationCap to avoid conflict if any (though lucide-react should be fine)
const ProjectGraduationCap = GraduationCap;