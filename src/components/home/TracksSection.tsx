"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck, Crown, BookOpen, HandHeart, ChevronRight } from "lucide-react";

interface TracksSectionProps {
  isVisible: boolean;
  isLandscape: boolean;
}

const journeySteps = [
  { num: "1", title: "First Contact", desc: "Outreach provides immediate help—food, shelter, crisis support", delay: '1600ms' },
  { num: "2", title: "Building Trust", desc: "Open Services offer workshops, Bible studies, pastoral care", delay: '1800ms' },
  { num: "3", title: "Deep Transformation", desc: "LDI commitment leads to leadership and systemic change", delay: '2000ms' },
  { num: "4", title: "Mentorship", desc: "Graduates mentor new members, giving back to community", delay: '2200ms' },
  { num: "5", title: "Systemic Impact", desc: "Leaders influence organizations, policy, and culture", delay: '2400ms' },
  { num: "6", title: "Legacy Building", desc: "Generational change through movement-building", delay: '2600ms' }
];

export default function TracksSection({ isVisible, isLandscape }: TracksSectionProps) {
  const visible = isLandscape ? true : isVisible;

  return (
    <section className={`w-full px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5 double-exposure mb-16 transition-all duration-1000 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="w-full !text-left">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className={`mb-4 !whitespace-pre-line !tracking-[10px] transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>More Than Ministry</Badge>
          <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Three-Track Model</h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
            Meeting individuals at every stage of their journey—from immediate crisis to long-term leadership development.
          </p>
        </div>
        
        {/* Model Overview */}
        <div className={`mb-12 p-8 bg-card rounded-xl border-2 border-[#A92FFA]/20 text-center w-full max-w-2xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
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
        
        {/* Three Track Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card className={`border-2 border-[#A92FFA] hover:shadow-xl transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
            <CardHeader>
              <div className="w-16 h-16 bg-[#A92FFA] rounded-xl flex items-center justify-center mb-4">
                <Crown className="!w-[60.9%] !h-[35px] !text-white" />
              </div>
              <Badge className="w-fit mb-2 !tracking-[10px]">TRACK 1</Badge>
              <CardTitle className="text-2xl !whitespace-pre-line">The Leadership Development Institute</CardTitle>
              <CardDescription className="text-base !whitespace-pre-line">Our Commitment-Based Program</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 !whitespace-pre-line">
                The LDI will be a rigorous 64-week, four-tier program that will transform profound brokenness into authentic, purpose-driven leadership through clinical psychology and systematic theology.
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
                <Link href="/ldi">
                  Explore The LDI
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className={`border-2 border-[#F28C28] hover:shadow-xl transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
            <CardHeader>
              <div className="w-16 h-16 bg-[#F28C28] rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 !text-white" />
              </div>
              <Badge className="mb-2 bg-[#F28C28] !tracking-[10px]">TRACK 2</Badge>
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

          <Card className={`border-2 border-[#A92FFA] hover:shadow-xl transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
            <CardHeader>
              <div className="w-16 h-16 bg-[#A92FFA] rounded-xl flex items-center justify-center mb-4">
                <HandHeart className="w-8 h-8 !text-white" />
              </div>
              <Badge className="w-fit mb-2 bg-[#A92FFA] !text-white !tracking-[10px]">TRACK 3</Badge>
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
                  <span>Advocacy: Voice for the voiceless</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/outreach">
                  Learn About our Outreach
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Journey Flow */}
        <div className="grid md:grid-cols-3 gap-4">
          {journeySteps.map((step, index) => (
            <div 
              key={step.num}
              className={`p-6 bg-card rounded-lg border border-border transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: step.delay }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full ${index % 2 === 0 ? 'bg-[#A92FFA]/10 text-[#A92FFA]' : 'bg-[#F28C28]/10 text-[#F28C28]'} flex items-center justify-center font-bold`}>
                  {step.num}
                </div>
                <h4 className="font-semibold !tracking-[10px]">{step.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
