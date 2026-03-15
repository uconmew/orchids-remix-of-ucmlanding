"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHeroComplete, setIsHeroComplete] = useState(false);

  useEffect(() => {
    const handleHeroComplete = () => {
      setIsHeroComplete(true);
    };

    window.addEventListener('wordShuffleComplete', handleHeroComplete);
    return () => window.removeEventListener('wordShuffleComplete', handleHeroComplete);
  }, []);

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent && isHeroComplete) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isHeroComplete]);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    }));
    setIsVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-3"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-900/95 backdrop-blur-sm border border-[#A92FFA]/30 rounded-lg shadow-lg overflow-hidden">
              <div className="flex items-center justify-between gap-4 p-3 md:p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Cookie className="w-5 h-5 text-[#F28C28] flex-shrink-0" />
                  <p className="text-xs text-slate-300 leading-snug">
                    We use cookies to enhance your experience.{" "}
                    <a href="/privacy-policy" className="text-[#F28C28] hover:underline">
                      Learn more
                    </a>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={acceptEssential}
                    className="text-xs text-slate-400 hover:text-white h-8 px-3"
                  >
                    Essential
                  </Button>
                  <Button
                    size="sm"
                    onClick={acceptAll}
                    className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90 text-white text-xs h-8 px-4"
                  >
                    Accept All
                  </Button>
                  <button 
                    onClick={() => setIsVisible(false)}
                    className="text-slate-400 hover:text-white transition-colors ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}