"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialsSectionProps {
  isVisible: boolean;
  isLandscape: boolean;
}

const testimonials = [
  {
    name: "Marcus T.",
    role: "Outreach Recipient",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762834483420-v9zvsw6ymh.png",
    quote: "When I was living on the streets, Ucon's outreach team found me. They didn't just give me a meal—they sat with me, listened to my story, and treated me like I mattered. Now I'm on the waitlist for the LDI program, and for the first time in years, I have real hope.",
    badge: "Seen. Heard. Valued.",
    delay: '800ms'
  },
  {
    name: "Sarah L.",
    role: "Services Participant",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762834895212-1rziiuwy9se.jpg",
    quote: "I started attending the UCON Awaken and Equip just looking for community after rehab. The workshops on financial literacy and the pastoral support have been life-changing. I'm excited about what Ucon is building—I've never seen a ministry approach recovery this comprehensively.",
    badge: "Supporting Every Step Forward",
    delay: '1000ms'
  },
  {
    name: "James K.",
    role: "Volunteer",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762835614164-pdcorjjmyp.png",
    quote: "As someone who went through addiction myself years ago, I'm blown away by Ucon's vision. The three-track model and the LDI program design are exactly what this community needs. I volunteer every week because I believe in this mission completely.",
    badge: "Been There. Serving Here",
    delay: '1200ms'
  },
  {
    name: "Diana R.",
    role: "Services Participant",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762836294042-v39uhxc78x.png",
    quote: "This community gave me more than church attendance—it gave me a faith that's actually mine. The teachers here don't see me as broken; they see me as someone God is transforming. I'm learning theology, practicing spiritual disciplines, and for the first time, I feel rooted in something real and lasting.",
    badge: "Where Scripture Meets Life",
    delay: '1400ms'
  },
  {
    name: "Thomas P.",
    role: "Early LDI Candidate",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/visual-edit-uploads/1762836623683-hhrhnmrg93.jpg",
    quote: "I've been clean for 6 months and working with UCon's pastoral team. When they told me about the 64-week LDI program, I knew that's what I need. Not just recovery, but real transformation and purpose. I've completed my application and can't wait to start.",
    badge: "Committed to Complete Change",
    delay: '1600ms'
  },
  {
    name: "Linda M.",
    role: "Community Partner",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3b399b69-78b1-47ea-a46d-f78b0232d98b/generated_images/professional-headshot-portrait-photograp-82743e11-20251105190506.jpg",
    quote: "As a local business owner, I've partnered with UCon to provide employment opportunities. What impresses me most is their holistic vision—they're not just helping people survive, they're building leaders who will transform this entire community. I'm excited to see what's ahead.",
    badge: "Leaders Who Give Back",
    delay: '1800ms'
  }
];

const impactStats = [
  { value: "150+", label: "People Served Monthly", delay: '2000ms' },
  { value: "200+", label: "Meals Distributed Weekly", delay: '2200ms' },
  { value: "45", label: "LDI Applicants", delay: '2400ms' },
  { value: "100%", label: "Commitment to Transform", delay: '2600ms' }
];

export default function TestimonialsSection({ isVisible, isLandscape }: TestimonialsSectionProps) {
  const visible = isLandscape ? true : isVisible;

  return (
    <section className={`w-full px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5 double-exposure mb-16 transition-all duration-1000 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className={`mb-4 !tracking-[10px] transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>Stories of Hope</Badge>
          <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Lives Being Transformed</h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
            Real stories from real people experiencing hope, community, and the beginning of transformation through UCon Ministries.
          </p>
        </div>
        
        {/* Six Testimonial Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.name}
              className={`hover:shadow-lg transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: testimonial.delay }}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      loading="lazy"
                      quality={75}
                    />
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
                <p className="text-sm text-muted-foreground italic mb-3 !whitespace-pre-line">
                  {testimonial.quote}
                </p>
                <Badge variant="outline" className="!whitespace-pre-line">{testimonial.badge}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Impact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {impactStats.map((stat, index) => (
            <div 
              key={stat.label}
              className={`text-center p-6 bg-card rounded-lg transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
              style={{ transitionDelay: stat.delay }}
            >
              <p className={`text-4xl font-bold ${index % 2 === 0 ? 'text-[#A92FFA]' : 'text-[#F28C28]'} mb-2`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
