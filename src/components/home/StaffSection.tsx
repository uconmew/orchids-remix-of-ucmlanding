"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target } from "lucide-react";
import { useStaffAnimation } from "@/hooks/useStaffAnimation";
import { getCardPosition, getCardDelay } from "@/utils/staffAnimationUtils";
import type { TeamMember } from "@/data/teamMembers";

interface StaffSectionProps {
  isVisible: boolean;
  isLandscape: boolean;
}

export default function StaffSection({ isVisible, isLandscape }: StaffSectionProps) {
  const visible = isLandscape ? true : isVisible;
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  const {
    staffAnimationPhase,
    releasedCards,
    pulsingCard,
    allCardsPulsing,
    isMobile,
    mobileReady
  } = useStaffAnimation(visible);

  // Fetch live staff on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('/api/staff');
        if (response.ok) {
          const liveStaff = await response.json();
          const mappedStaff = liveStaff.map((staff: any) => ({
            name: staff.name,
            role: staff.role,
            image: staff.image,
            description: staff.bio,
            badges: staff.expertise || []
          }));
          
          if (mappedStaff.length > 0) {
            setTeamMembers(mappedStaff);
          }
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    fetchStaff();
  }, []);

  return (
    <section className={`w-full px-4 sm:px-6 lg:px-8 py-20 mb-32 ${
      isMobile || !mobileReady ? 'min-h-0' : 'min-h-[1600px]'
    } bg-white dark:bg-background transition-all duration-1000 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="w-full">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Badge className={`mb-4 bg-[#F28C28] text-white transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>Our Team</Badge>
          <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-700 sm:!text-violet-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>Meet Our Leadership</h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
            A diverse team united by personal transformation stories and a shared calling to serve those seeking hope and purpose.
          </p>
        </div>
        
        {/* Staff Members */}
        {isMobile || !mobileReady ? (
          // Mobile: Static grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {teamMembers.map((member, index) => (
              <Card key={member.name} className={`hover-lift h-full bg-card transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${800 + index * 200}ms` }}>
                  <CardHeader>
                    <div className="w-full aspect-[1358/1393] rounded-lg overflow-hidden mb-4 relative bg-muted">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        style={member.name === "Nicole Hedges" ? { objectPosition: "center 100%" } : undefined}
                      />
                    </div>
                    <CardTitle className="text-center text-xl">{member.name}</CardTitle>
                    <CardDescription className="text-center">{member.role}</CardDescription>
                  </CardHeader>

                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-4 max-h-20 overflow-y-auto text-left px-2 !font-normal">{member.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.badges.map((badge) => (
                      <Badge key={badge} variant="outline">{badge}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop: Animated stack
          <div className="relative min-h-[1400px] flex items-center justify-center mb-16">
            <div className="relative w-full max-w-5xl h-[1400px] flex items-center justify-center">
              <AnimatePresence>
                {teamMembers.map((member, index) => {
                  const position = getCardPosition(index, staffAnimationPhase, releasedCards);
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
                      style={{ zIndex: isPulsing || allCardsPulsing ? 100 : 10 + index }}
                    >
                      <Card className={`hover-lift h-full ${isPulsing ? 'ring-4 ring-[#A92FFA] shadow-2xl' : ''} ${allCardsPulsing ? 'ring-4 ring-[#A92FFA] shadow-[0_0_30px_rgba(169,47,250,0.6),0_0_60px_rgba(242,140,40,0.4)]' : ''}`}>
                        <CardHeader>
                          <div className="w-full aspect-[1358/1393] rounded-lg overflow-hidden mb-4 relative">
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              className="object-cover"
                              style={member.name === "Nicole Hedges" ? { objectPosition: "center 100%" } : undefined}
                            />
                          </div>
                          <CardTitle className="text-center text-xl !text-orange-400 !font-bold">{member.name}</CardTitle>
                          <CardDescription className="text-center !text-purple-400 !font-bold">{member.role}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                          <p className="text-sm text-muted-foreground mb-3 !font-normal">{member.description}</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {member.badges.map((badge) => (
                              <Badge key={badge} variant="outline" className="!text-violet-300">{badge}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
        
        {/* Team Values & CTA */}
        <div className="grid md:grid-cols-2 gap-8 mt-32">
          <Card className={`border-2 border-[#A92FFA]/30 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2600ms' }}>
            <CardHeader>
              <CardTitle className="text-2xl !text-center !text-orange-400">Our Team Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-[#A92FFA] mt-1 flex-shrink-0" fill="currentColor" />
                <div>
                  <p className="font-semibold mb-1">Lived Experience</p>
                  <p className="text-sm text-muted-foreground">Many team members are LDI graduates who understand the journey from brokenness to purpose</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 mt-1 flex-shrink-0 !text-orange-400" />
                <div>
                  <p className="font-semibold mb-1">Diverse Expertise</p>
                  <p className="text-sm text-muted-foreground">Clinical psychology, theology, social work, and community organizing unified in mission</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-[#A92FFA] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Continuous Learning</p>
                  <p className="text-sm text-muted-foreground">Committed to ongoing professional development and evidence-based practice excellence</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`bg-gradient-to-br from-[#F28C28]/10 to-[#A92FFA]/10 border-2 border-[#F28C28]/30 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2800ms' }}>
            <CardHeader>
              <CardTitle className="text-2xl !text-center !text-purple-400">Join Our Team</CardTitle>
              <CardDescription className="!text-center">Make a Difference Through Service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Whether you're seeking employment, internship opportunities, or volunteer positions, there's a place for you at UCon Ministries.
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
  );
}
