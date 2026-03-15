"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const SONGS = [
  { title: "How You Make Me Feel", url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/How-You-Make-Me-Feel-1766035117288.mp3" },
  { title: "Jesus UCM Worship", url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/Jesus-UCM-Worship-1766035117574.mp3" },
  { title: "Jesus I'm Coming Home", url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/Jesus-I-m-Coming-Home-1766035116850.mp3" },
  { title: "Grace Is Enough", url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/Grace-Is-Enough-1766035116896.mp3" },
  { title: "Surrender sGrip 1", url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/Surrender-sGrip-1-1766035117471.mp3" },
  { title: "Lord, I'm Not Okay", url: "https://od.lk/d/NzNfMTEwMDI1MTgyXw/Lord%2C%20Im%20Not%20Okay%20%281%29.mp3" },
  { title: "Just Want You", url: "https://od.lk/d/MF8zODI5NjQ5OTBf/Just%20Want%20You.mp3" },
  { title: "Open Heaven (River Wild)", url: "https://od.lk/d/MF8zODI5NjU2NzFf/Open%20Heaven%20%28River%20Wild%29.mp3" },
  { title: "Hallelujah Here Below", url: "https://od.lk/d/MF8zODI5NjYwMTVf/Hallelujah%20Here%20Below.mp3" },
  { title: "Surrender", url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/Ucon-Ministries-Surrender-sGrip-1765694225255.mp3" }
];

const PLAYLIST = SONGS.map(song => song.url);

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [autoplayTriggered, setAutoplayTriggered] = useState(false);
  const [isHeroComplete, setIsHeroComplete] = useState(false);
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimestampsRef = useRef<number[]>([]);

  useEffect(() => {
    // If not on homepage, hero is "complete" by default
    if (pathname !== '/') {
      setIsHeroComplete(true);
    } else {
      // On homepage, check if animation was already seen or skipped
      const hasSeenAnimation = typeof window !== 'undefined' && localStorage.getItem('hero-animation-seen') === 'true';
      if (hasSeenAnimation) {
        setIsHeroComplete(true);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const audio = new Audio(PLAYLIST[0]);
    audio.volume = 0.1;
    audio.preload = "auto";
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setCurrentSongIndex((prev) => (prev + 1) % PLAYLIST.length);
    const handleError = () => {
      setIsPlaying(false);
      setCurrentSongIndex((prev) => (prev + 1) % PLAYLIST.length);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && currentSongIndex >= 0) {
      // Automatic transition if audio ended or was playing
      const wasPlaying = !audioRef.current.paused || audioRef.current.ended;
      audioRef.current.src = PLAYLIST[currentSongIndex];
      audioRef.current.load();
      
      if (wasPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentSongIndex]);

  useEffect(() => {
    const attemptAutoplay = () => {
      if (!autoplayTriggered && audioRef.current && audioRef.current.paused) {
        setAutoplayTriggered(true);
        audioRef.current.play().catch(() => {});
      }
    };

    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        autoplayTimeoutRef.current = setTimeout(attemptAutoplay, 30000);
      }
    };

    const handleHeroComplete = () => {
      setIsHeroComplete(true);
      attemptAutoplay();
    };

    const handleAnimationStart = () => {
      setIsHeroComplete(false);
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('wordShuffleComplete', handleHeroComplete);
    window.addEventListener('animationStarted', handleAnimationStart);

    return () => {
      if (autoplayTimeoutRef.current) clearTimeout(autoplayTimeoutRef.current);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('wordShuffleComplete', handleHeroComplete);
      window.removeEventListener('animationStarted', handleAnimationStart);
    };
  }, [hasInteracted, autoplayTriggered]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    const now = Date.now();
    clickTimestampsRef.current.push(now);
    clickTimestampsRef.current = clickTimestampsRef.current.filter(t => now - t < 5000);
    
    if (clickTimestampsRef.current.length >= 3) {
      clickTimestampsRef.current = [];
      setCurrentSongIndex((prev) => (prev + 1) % PLAYLIST.length);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  if (!isHeroComplete) return null;

  return (
    <Card 
      className="fixed bottom-24 right-6 z-40 p-3 bg-background/95 backdrop-blur-sm border-2 border-[#A92FFA]/20 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="whitespace-nowrap overflow-hidden"
          >
            <span className="text-sm font-medium text-[#A92FFA] px-2">
              {SONGS[currentSongIndex].title}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        size="sm"
        variant="ghost"
        onClick={togglePlay}
        className="hover:bg-[#A92FFA]/10 shrink-0"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-[#A92FFA]" />
        ) : (
          <Play className="w-5 h-5 text-[#A92FFA]" />
        )}
      </Button>
    </Card>
  );
}
