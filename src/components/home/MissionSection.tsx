"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck, Compass, Target } from "lucide-react";

interface MissionSectionProps {
  isVisible: boolean;
  isLandscape: boolean;
}

export default function MissionSection({ isVisible, isLandscape }: MissionSectionProps) {
  const visible = isLandscape ? true : isVisible;

  return (
    <section className={`w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 overlay-gradient transition-all duration-1000 mb-12 sm:mb-16 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Badge className={`mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90 text-xs sm:text-sm transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>ABOUT US</Badge>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>UCON MINISTRIES</h2>
        </div>
        
        {/* Mission Image */}
        <div className={`mb-6 sm:mb-8 rounded-xl overflow-hidden transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
          <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7e1174a2-cad7-4c9f-b66b-c4d256539749/generated_images/warm-and-uplifting-community-gathering-i-11afb1ee-20251119042802.jpg"
              alt="Community gathering in prayer and fellowship"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover"
              loading="lazy"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        </div>
        
        {/* Main Mission Statement */}
        <Card className={`mb-8 border-2 border-[#A92FFA]/20 hover-lift transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Mission Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground !whitespace-pre-line">
              Ucon Ministries exists to meet individuals at their point of need, offering immediate practical assistance and guiding them through a comprehensive journey of healing and transformation. Our mission is to <span className="font-semibold text-[#A92FFA]">transform feelings of worthlessness and mental health struggles into enduring purpose and dignity</span> for those deeply impacted by the justice system, addiction, homelessness, and personal brokenness.
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground mt-4">
              <span className="font-semibold text-[#F28C28]">We are all-inclusive and proudly welcome everyone</span>—including LGBTQ+ individuals—without exception. Every person carries sacred worth and belongs in our community of transformation.
            </p>
          </CardContent>
        </Card>
        
        {/* Vision & Approach */}
        <div className={`grid md:grid-cols-2 gap-6 mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
          <Card className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#A92FFA]" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                Through unconditional connection, consistent presence, and the redemptive love of Christ, we empower individuals to discover their inherent dignity and God-given purpose.
              </p>
            </CardContent>
          </Card>
          <Card className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#F28C28]" />
                Our Approach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                Cultivating authentic servant leaders who drive systemic change and build a legacy of hope in their communities through evidence-based practices and biblical integration.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Impact Promise Boxes */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1600ms' }}>
          {[
            { title: "Immediate Support", desc: "24/7 crisis intervention and practical assistance", delay: '1800ms' },
            { title: "Long-term Healing", desc: "Comprehensive 64-week transformation program", delay: '2000ms' },
            { title: "Leadership Development", desc: "Training next-generation servant leaders", delay: '2200ms' },
            { title: "Community Integration", desc: "Building lasting connections and support networks", delay: '2400ms' },
            { title: "Systemic Change", desc: "Advocating for justice and policy reform", delay: '2600ms' },
            { title: "Generational Impact", desc: "Creating legacy of hope for future generations", delay: '2800ms' }
          ].map((item, index) => (
            <div 
              key={item.title}
              className={`p-6 bg-card rounded-lg border border-border ${
                index % 2 === 0 ? '!border-indigo-500' : '!border-violet-600'
              } !shadow-[0_2px_4px_0_rgba(241,245,249,0.15)] !shadow-[0_16px_24px_-4px_rgba(241,245,249,0.25),0_8px_16px_-4px_rgba(241,245,249,0.15)] transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: item.delay }}
            >
              <CircleCheck className={`w-7 h-7 sm:w-8 sm:h-8 ${index % 2 === 0 ? 'text-[#A92FFA]' : 'text-[#F28C28]'} mb-3`} />
              <h3 className="font-semibold mb-2 text-base sm:text-lg">{item.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
