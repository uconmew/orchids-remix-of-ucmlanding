"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Heart, Users } from "lucide-react";

interface CTASectionProps {
  isVisible: boolean;
  isLandscape: boolean;
}

const ctaActions = [
  {
    icon: GraduationCap,
    title: "Apply to LDI",
    subtitle: "Begin Your Journey",
    description: "Ready to commit to transformation? Apply for our intensive 64-week Leadership Development Institute.",
    buttonText: "Apply Now",
    buttonLink: "/ldi-waitlist",
    variant: "default" as const,
    iconBg: "A92FFA",
    borderColor: "A92FFA",
    delay: '1000ms'
  },
  {
    icon: Heart,
    title: "Donate",
    subtitle: "Fuel Transformation",
    description: "Your financial support directly impacts lives, providing resources for healing.",
    buttonText: "Give Now",
    buttonLink: "/donations",
    variant: "default" as const,
    iconBg: "F28C28",
    borderColor: "F28C28",
    delay: '1400ms'
  },
  {
    icon: Users,
    title: "Volunteer",
    subtitle: "Serve Your Community",
    description: "Join our team of volunteers making a difference in people's lives every day.",
    buttonText: "Get Started",
    buttonLink: "/volunteer",
    variant: "default" as const,
    iconBg: "A92FFA",
    borderColor: "A92FFA",
    delay: '1800ms'
  }
];

export default function CTASection({ isVisible, isLandscape }: CTASectionProps) {
  const visible = isLandscape ? true : isVisible;

  return (
    <section className={`w-full px-4 sm:px-6 lg:px-8 py-20 mb-16 transition-all duration-1000 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="w-full">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Badge className={`mb-4 !tracking-[10px] transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>GET INVOLVED</Badge>
          <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Be Part of the Transformation</h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
            Every person has a role to play in building a community of hope. Choose your path to get involved.
          </p>
        </div>
        
        {/* Six Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {ctaActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.title}
                className={`hover:shadow-xl transition-shadow border-2 hover:border-[#${action.borderColor}] transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
                style={{ transitionDelay: action.delay }}
              >
                <CardHeader>
                  <div className={`w-16 h-16 bg-[#${action.iconBg}] rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
                  <CardDescription>{action.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <Button className="w-full" variant={action.variant} asChild>
                    <Link href={action.buttonLink}>{action.buttonText}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
