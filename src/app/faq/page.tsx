"use client"

import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, HelpCircle, MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

interface FAQItem {
  id: string;
  category: string;
  question: string;
  briefAnswer: string;
  detailedAnswer: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    category: "About UCon",
    question: "What is UCon Ministries?",
    briefAnswer: "A faith-based organization transforming lives through purpose and community support.",
    detailedAnswer: "UCon Ministries exists to meet individuals at their point of need, offering immediate practical assistance and guiding them through a comprehensive journey of healing and transformation. Our mission is to transform feelings of worthlessness and mental health struggles into enduring purpose and dignity for those deeply impacted by the justice system, addiction, homelessness, and personal brokenness. Through unconditional connection, consistent presence, and the redemptive love of Christ, we empower individuals to discover their inherent dignity and God-given purpose. Our slogan is 'Where Your Past Becomes Your Purpose.'"
  },
  {
    id: "2",
    category: "About UCon",
    question: "Where are you located?",
    briefAnswer: "UCon Ministries is based in Colorado.",
    detailedAnswer: "UCon Ministries is proudly based in Colorado, serving communities throughout the state. We operate multiple program locations and outreach centers to ensure accessibility for those in need. Our main offices coordinate services across the region, including our Leadership Development Institute, outreach programs, and support services. Contact us for specific location information for the service you're interested in."
  },
  {
    id: "3",
    category: "LDI Program",
    question: "What is the Leadership Development Institute (LDI)?",
    briefAnswer: "A 64-week, four-tier intensive program for personal transformation and leadership development.",
    detailedAnswer: "The Leadership Development Institute (LDI) is our flagship program—a comprehensive, 64-week, four-tier journey designed to transform lives and develop authentic leaders. The program includes Tier 1: Ascension (foundational healing and life skills), Tier 2: Pinnacle (mentoring others), Tier 3: Apex (systems leadership and community mobilization), and Tier 4: Ucon (national/international movement building). The LDI requires a signed commitment agreement and provides housing, meals, counseling, and comprehensive support. It fuses clinical psychology, systematic theology, and lived re-entry experience to create lasting transformation."
  },
  {
    id: "4",
    category: "LDI Program",
    question: "How do I apply for the LDI program?",
    briefAnswer: "Visit our LDI waiting list page to submit your application.",
    detailedAnswer: "The LDI program is currently in development. To apply, visit our LDI Waiting List page and complete the comprehensive application form. You'll need to provide personal information, background details, your motivation for joining, and emergency contact information. Our team reviews applications on a rolling basis and will contact you within 5-7 business days to schedule an initial interview. Upon acceptance, we guide you through the onboarding process. The program requires full commitment and participants receive housing and full support throughout the 64 weeks."
  },
  {
    id: "5",
    category: "LDI Program",
    question: "Is housing provided during the LDI program?",
    briefAnswer: "Yes, housing and full support are provided throughout the program.",
    detailedAnswer: "All LDI participants receive comprehensive support including secure housing, meals, counseling services, and program materials throughout the entire 64-week program. This ensures participants can focus fully on their transformation journey without worrying about basic needs. Our residential approach creates a therapeutic community environment essential for deep, lasting change. Housing includes shared living spaces that foster community and accountability, which are crucial elements of the LDI methodology."
  },
  {
    id: "6",
    category: "Services",
    question: "What services do you offer besides the LDI program?",
    briefAnswer: "We operate on a three-track model: LDI, Open Services, and Outreach.",
    detailedAnswer: "UCon Ministries operates three integrated tracks: Track 1 - LDI (intensive leadership development), Track 2 - Open Services (workshops, Bible studies, pastoral counseling, mentoring—no commitment required), and Track 3 - Outreach & Community Advocacy (transportation assistance, food drives, shelter support, rehabilitation referrals, and advocacy for systemic change). This comprehensive approach ensures we can meet people wherever they are in their journey, from immediate crisis support to long-term transformation."
  },
  {
    id: "7",
    category: "Services",
    question: "Do I need to be religious to participate?",
    briefAnswer: "All are welcome regardless of faith background.",
    detailedAnswer: "While UCon Ministries is a faith-based organization grounded in Christian principles, we welcome individuals from all backgrounds and belief systems. We believe in meeting people where they are and respecting each person's journey. Our programs integrate spiritual formation with evidence-based practices, and while we incorporate biblical principles, we focus on practical life transformation that benefits everyone. You don't need to identify as religious to participate in our services, though an openness to spiritual growth is encouraged for the LDI program."
  },
  {
    id: "8",
    category: "Getting Involved",
    question: "How can I volunteer with UCon Ministries?",
    briefAnswer: "Contact us through our Contact page to learn about volunteer opportunities.",
    detailedAnswer: "We welcome volunteers in various capacities! Opportunities include serving in outreach programs, assisting with food drives and distribution, mentoring LDI participants, helping with administrative tasks, and joining our prayer team. Each role plays a vital part in our mission. To volunteer, visit our Contact page and express your interest. We'll connect you with our volunteer coordinator who will discuss available opportunities, required training, and time commitments. We value every contribution, whether it's a few hours a month or regular weekly service."
  },
  {
    id: "9",
    category: "Getting Involved",
    question: "Can I make a donation?",
    briefAnswer: "Yes, visit our Donations page to contribute.",
    detailedAnswer: "Absolutely! Your donations directly support life transformation. We accept one-time donations, monthly recurring support, and in-kind donations (food, clothing, supplies). All financial donations are tax-deductible. Visit our Donations page to contribute securely online. Your support helps provide housing for LDI participants, fund outreach programs, supply food and resources for those in crisis, and sustain our comprehensive support services. Every contribution, large or small, makes a tangible difference in someone's journey from brokenness to purpose."
  },
  {
    id: "10",
    category: "Prayer Wall",
    question: "How does the Prayer Wall work?",
    briefAnswer: "Submit prayer requests and pray for others in our community.",
    detailedAnswer: "Our Interactive Prayer Wall is a digital space where community members can share prayer requests and lift up prayers for one another. You can submit requests anonymously or with your name, choose from various categories (healing, strength, guidance, family, provision, ministry, breakthrough), and see how many people have prayed for each request. Simply click the 'Pray' button to add your prayer to the count. After submitting a prayer request, you'll have the option to join our newsletter for continued encouragement and updates. The Prayer Wall embodies our belief in the power of unified prayer and community support."
  },
  {
    id: "11",
    category: "Support",
    question: "What if I need immediate help?",
    briefAnswer: "Contact our 24/7 prayer support line or visit our Outreach services.",
    detailedAnswer: "If you're facing an immediate crisis or urgent need, we're here to help. Our pastoral team is available 24/7 for confidential prayer support and spiritual guidance. You can also access our Outreach & Community Advocacy services (Track 3), which provide immediate assistance including transportation to essential services, emergency shelter referrals, food assistance, and connections to rehabilitation facilities. Visit our Contact page for phone numbers and email, or come to our main office during business hours. We're committed to meeting you at your point of need."
  },
  {
    id: "12",
    category: "Support",
    question: "Is my information kept confidential?",
    briefAnswer: "Yes, all personal information is strictly confidential.",
    detailedAnswer: "Absolutely. UCon Ministries takes privacy and confidentiality very seriously. All personal information, prayer requests (when shared with counselors), application details, and interactions with our staff are kept strictly confidential. We only share information when legally required or with your explicit permission. Prayer requests submitted anonymously on the Prayer Wall are never traced back to individuals. Our staff and volunteers are trained in confidentiality protocols, and we maintain secure systems for storing sensitive information. Your trust is paramount to us."
  },
  {
    id: "13",
    category: "Resources",
    question: "What resources do you provide?",
    briefAnswer: "We offer a comprehensive Resource Hub with local and statewide Colorado resources.",
    detailedAnswer: "Our Resource Hub provides extensive information and connections to Colorado resources including housing assistance programs (local and statewide), food banks and pantries, domestic violence shelters and support services, addiction recovery and rehabilitation programs, mental health providers accepting Medicaid, employment assistance, legal aid services, and other community support organizations. We continually update these resources to ensure accuracy and relevance. The hub also includes downloadable guides and materials to help you navigate available support systems in Colorado."
  },
  {
    id: "14",
    category: "Community",
    question: "What is the Community Coalition?",
    briefAnswer: "Recognition of individuals and organizations making community impact in Colorado.",
    detailedAnswer: "Our Community Coalition page celebrates and recognizes individuals, organizations, and ministries throughout Colorado who are making a tangible difference in their communities. These partners share our commitment to transformation, restoration, and dignity for all people. The Coalition includes churches, nonprofits, recovery centers, advocacy groups, and community leaders working in areas like homelessness prevention, addiction recovery, mental health support, criminal justice reform, and family restoration. We believe in collaborative impact and highlight these changemakers to foster connection and inspire others to get involved."
  },
  {
    id: "15",
    category: "General",
    question: "How is UCon Ministries funded?",
    briefAnswer: "Through donations, grants, and partnerships with like-minded organizations.",
    detailedAnswer: "UCon Ministries is primarily funded through individual donations, church partnerships, foundation grants, and corporate sponsorships. We're a registered nonprofit organization, and all financial contributions are tax-deductible. We're committed to financial transparency and steward all resources with integrity to maximize impact for those we serve. Our funding supports program operations, housing for LDI participants, outreach services, staff salaries, and facility maintenance. We regularly seek partnerships with organizations that share our vision of transforming lives and communities through purpose-driven restoration."
  }
];

const categories = ["All", "About UCon", "LDI Program", "Services", "Getting Involved", "Prayer Wall", "Support", "Resources", "Community", "General"];

export default function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [heroRef, heroVisible] = useIntersectionObserver();
  const [contentRef, contentVisible] = useIntersectionObserver();

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.briefAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.detailedAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
    setSelectedFAQ(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden overlay-gradient"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8 transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Badge>
            <h1 className={`text-5xl sm:text-6xl font-bold mb-6 transition-all duration-1000 delay-100 ${
              heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              Frequently Asked Questions
            </h1>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto mb-8 transition-all duration-1000 delay-200 ${
              heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              Find answers to common questions about UCon Ministries, our programs, and how to get involved.
            </p>
            
            {/* Search Bar */}
            <div className={`max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedCategory === cat ? "bg-[#A92FFA]" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div 
          ref={contentRef}
          className={`max-w-7xl mx-auto transition-all duration-1000 ${
            contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No questions found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or category filter</p>
              <Button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Questions List */}
              <div className="lg:col-span-1 space-y-2">
                {filteredFAQs.map((faq, index) => {
                  const isFromLeft = index % 2 === 0;
                  return (
                    <button
                      key={faq.id}
                      onClick={() => toggleExpand(faq.id)}
                      className={`w-full text-left transition-all duration-700 ${
                        isFromLeft ? 'animate-slide-in-left' : 'animate-slide-in-right'
                      }`}
                      style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
                    >
                      <Card className={`hover-lift ${
                        expandedItems.has(faq.id) ? 'border-[#A92FFA] bg-[#A92FFA]/5' : ''
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs text-[#F28C28] font-semibold mb-1">{faq.category}</p>
                              <p className="font-semibold text-sm mb-2">{faq.question}</p>
                              <p className="text-xs text-muted-foreground">{faq.briefAnswer}</p>
                            </div>
                            <ChevronDown 
                              className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                                expandedItems.has(faq.id) ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
              </div>

              {/* Right Column - Detailed Answer */}
              <div className="lg:col-span-2">
                {selectedFAQ ? (
                  <Card className="sticky top-24 animate-fade-in">
                    <CardContent className="p-6">
                      {(() => {
                        const faq = faqs.find(f => f.id === selectedFAQ);
                        if (!faq) return null;
                        return (
                          <>
                            <Badge className="mb-4 bg-[#F28C28]">{faq.category}</Badge>
                            <h2 className="text-2xl font-bold mb-4">{faq.question}</h2>
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                              <p className="leading-relaxed">{faq.detailedAnswer}</p>
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Select a Question</h3>
                      <p className="text-muted-foreground">
                        Click on any question to view the detailed answer here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 overlay-gradient">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white hover-glow">
            <CardContent className="pt-8">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Our team is here to help. Reach out to us directly or use our AI chatbot for immediate assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="outline" className="bg-white text-[#A92FFA] hover:bg-white/90 border-white">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Us
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white text-[#F28C28] hover:bg-white/90 border-white">
                    Visit Prayer Wall
                  </Button>
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
