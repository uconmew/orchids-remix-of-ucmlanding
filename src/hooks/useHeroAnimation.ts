"use client";

import { useState, useEffect } from "react";

export function useHeroAnimation() {
  const [showHeroImage, setShowHeroImage] = useState(false);
  const [fadeOutFinal, setFadeOutFinal] = useState(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);

  useEffect(() => {
    const handleAnimationStart = () => {
      setIsAnimationPlaying(true);
      setShowHeroImage(false);
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
      }, 3600); // 100ms delay + 3000ms word fade + 500ms buffer for clean separation
    };

    window.addEventListener('animationStarted', handleAnimationStart);
    window.addEventListener('wordShuffleComplete', handleAnimationComplete);

    return () => {
      window.removeEventListener('animationStarted', handleAnimationStart);
      window.removeEventListener('wordShuffleComplete', handleAnimationComplete);
    };
  }, []);

  return {
    showHeroImage,
    fadeOutFinal,
    isAnimationPlaying
  };
}
