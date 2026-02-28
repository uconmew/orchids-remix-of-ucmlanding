"use client";

import { useState, useEffect } from "react";

export function useNewsletterModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const subscribed = localStorage.getItem("newsletter-subscribed");
    const dismissed = localStorage.getItem("newsletter-dismissed");
    
    // Early exit: If subscribed or recently dismissed, don't set up scroll listener
    if (subscribed) return;
    
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollPosition + windowHeight) / documentHeight;
      
      // Show modal when user reaches 50% of page
      if (scrollPercentage >= 0.5 && !showModal) {
        setShowModal(true);
        // Remove listener after showing once
        window.removeEventListener('scroll', handleScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showModal]);

  return {
    showModal,
    setShowModal
  };
}
