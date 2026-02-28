"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, BookOpen, HandHeart, TrendingUp } from "lucide-react";

interface ValuesSectionProps {
  isVisible: boolean;
  isLandscape: boolean;
}

const coreValues = [
  {
    icon: Heart,
    title: "Inherent Dignity",
    description: "Upholding the intrinsic worth of every individual, irrespective of background or circumstance, is central to our service delivery.",
    color: "A92FFA"
  },
  {
    icon: Target,
    title: "Purpose-Driven Recovery",
    description: "We anchor sustainable healing in the discovery and cultivation of individual and communal purpose.",
    color: "F28C28"
  },
  {
    icon: Users,
    title: "Unconditional Connection",
    description: "We demonstrate radical empathy and consistent, non-judgmental presence as the foundation of engagement.",
    color: "A92FFA"
  },
  {
    icon: TrendingUp,
    title: "Community Transformation",
    description: "We foster systemic change through empowered individuals who serve and inspire their communities.",
    color: "A92FFA"
  },
  {
    icon: BookOpen,
    title: "Biblical Integration",
    description: "We seamlessly weave spiritual truth and principles with clinically sound, evidence-based practices.",
    color: "F28C28"
  },
  {
    icon: HandHeart,
    title: "Outreach & Accessibility",
    description: "We proactively engage marginalized populations and eliminate barriers to access for essential services.",
    color: "A92FFA"
  }
];

const valueStats = [
  { value: "100%", label: "Unconditional Acceptance", delay: '2200ms' },
  { value: "365", label: "Days of Support", delay: '2400ms' },
  { value: "∞", label: "Potential in Every Person", delay: '2600ms' },
  { value: "1", label: "Community United", delay: '2800ms' }
];

export default function ValuesSection({ isVisible, isLandscape }: ValuesSectionProps) {
  const visible = isLandscape ? true : isVisible;

  return (
    <section className={`w-full px-4 sm:px-6 lg:px-8 py-20 mb-16 transition-all duration-1000 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className={`mb-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>OUR CORE VALUES</Badge>
          <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>What Drives Our Ministry</h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
            Six foundational principles that guide every aspect of our work and shape our approach to transformation.
          </p>
        </div>
        
        {/* Values Image */}
        <div className={`mb-8 rounded-xl overflow-hidden transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
          <div className="relative w-full h-[400px] md:h-[500px]">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7e1174a2-cad7-4c9f-b66b-c4d256539749/generated_images/powerful-hands-reaching-out-to-help-some-d0a19c34-20251114190901.jpg"
              alt="Hands reaching out in support and solidarity"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover"
              loading="lazy"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        </div>
        
        {/* Six Core Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {coreValues.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card 
                key={value.title}
                className={`hover:shadow-lg transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
                style={{ transitionDelay: `${1000 + index * 200}ms` }}
              >
                <CardHeader>
                  <div className={`w-12 h-12 bg-[#${value.color}]/10 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-[#${value.color}]`} />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Value Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {valueStats.map((stat, index) => (
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
