"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import WordShuffleHero from "@/components/WordShuffleHero";

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLDivElement>;
  heroVisible: boolean;
  isAnimationPlaying: boolean;
  showHeroImage: boolean;
  fadeOutFinal: boolean;
}

export default function HeroSection({
  heroRef,
  heroVisible,
  isAnimationPlaying,
  showHeroImage,
  fadeOutFinal
}: HeroSectionProps) {
  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden w-full"
    >
      {/* Hero Background Image - CINEMATIC FADE IN */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-[3000ms] ease-in-out ${
        showHeroImage && heroVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
      }>
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png"
          alt="Community in prayer"
          fill
          sizes="100vw"
          className="object-cover"
          quality={85}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/10 to-background/30" />
      </div>
      
      <div className="w-full relative z-10 py-12 sm:py-16 md:py-20 px-4 lg:px-8 !text-orange-500">
        {/* Word Shuffle Animation */}
        <motion.div
          className="transition-all duration-1000"
          initial={{ opacity: 1 }}
          animate={{
            opacity: fadeOutFinal ? 0 : heroVisible ? 1 : 0,
            scale: heroVisible ? 1 : 0.9
          }}
          transition={{
            opacity: { duration: 3, ease: "easeInOut" },
            scale: { duration: 1 }
          }}
        >
          <WordShuffleHero />
        </motion.div>
        
        {/* CTA Buttons */}
        <div className={`flex flex-wrap gap-4 justify-center mt-8 sm:mt-12 transition-all duration-700 delay-[300ms] ${
          heroVisible && !isAnimationPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`
        }>
          <Button size="lg" className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 bg-[#F28C28] hover:bg-[#F28C28]/90" asChild>
            <Link href="/contact">
              Start Your Journey
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 border-[#A92FFA] hover:bg-[#A92FFA] hover:text-white" asChild>
            <Link href="/ldi">
              The Leadership Development Institute
            </Link>
          </Button>
        </div>
        
        {/* Hero Stats Grid */}
        <div className={`mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mx-auto max-w-7xl transition-all duration-700 delay-[500ms] ${
          heroVisible && !isAnimationPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`
        }>
          <Card className={`bg-[#A92FFA] text-white hover-lift transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white !whitespace-pre-line">Projection</CardTitle>
              <CardDescription className="text-white/80 text-center text-xs sm:text-sm">Lives Transformed</CardDescription>
            </CardHeader>
          </Card>
          <Card className={`bg-[#F28C28] text-white hover-lift transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '700ms' }}>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white">64</CardTitle>
              <CardDescription className="text-white/80 text-center text-xs sm:text-sm">Week Program</CardDescription>
            </CardHeader>
          </Card>
          <Card className={`bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white hover-lift transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white">4</CardTitle>
              <CardDescription className="text-white/80 text-center text-xs sm:text-sm">Leadership Tiers</CardDescription>
            </CardHeader>
          </Card>
          <Card className={`hover-lift transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '900ms' }}>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center">24/7</CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm">Support Available</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
