"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const SESSION_DURATION = 3600; // 1 hour in seconds
const INACTIVITY_THRESHOLD = 300; // 5 minutes in seconds
const REFRESH_THRESHOLD = 300; // Last 5 minutes of session
const FADE_OUT_DURATION = 5000; // 5 seconds in milliseconds

export function useSessionTimer() {
  const [remainingTime, setRemainingTime] = useState<number>(SESSION_DURATION);
  const [isInactive, setIsInactive] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const fadeOutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetSession = useCallback(() => {
    const newExpiration = Date.now() + SESSION_DURATION * 1000;
    localStorage.setItem("session_expiry", newExpiration.toString());
    setRemainingTime(SESSION_DURATION);
    setLastActivity(Date.now());
    setIsInactive(false);
    setIsFadingOut(false);
    if (fadeOutTimeoutRef.current) {
      clearTimeout(fadeOutTimeoutRef.current);
    }
  }, []);

  // Initialize or resume session
  useEffect(() => {
    const storedExpiry = localStorage.getItem("session_expiry");
    if (storedExpiry) {
      const remaining = Math.max(0, Math.floor((parseInt(storedExpiry) - Date.now()) / 1000));
      if (remaining === 0) {
        resetSession();
      } else {
        setRemainingTime(remaining);
      }
    } else {
      resetSession();
    }
  }, [resetSession]);

  // Activity listeners
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity((prevLast) => {
        const now = Date.now();
        // Check if we were inactive and now becoming active
        const secondsSinceLast = Math.floor((now - prevLast) / 1000);
        
        if (secondsSinceLast >= INACTIVITY_THRESHOLD) {
          // We were inactive, now active. Trigger fade out.
          setIsFadingOut(true);
          if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
          fadeOutTimeoutRef.current = setTimeout(() => {
            setIsFadingOut(false);
          }, FADE_OUT_DURATION);
        }
        
        return now;
      });
      setIsInactive(false);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
    };
  }, []);

  // Timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const storedExpiry = localStorage.getItem("session_expiry");
      
      if (storedExpiry) {
        const remaining = Math.max(0, Math.floor((parseInt(storedExpiry) - now) / 1000));
        setRemainingTime(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          localStorage.removeItem("session_expiry");
          authClient.signOut().then(() => {
            toast.error("Session expired due to inactivity");
            window.location.href = "/login";
          });
          return;
        }
      }

      // Check inactivity (only if not currently fading out)
      const secondsSinceActivity = Math.floor((now - lastActivity) / 1000);
      if (secondsSinceActivity >= INACTIVITY_THRESHOLD) {
        setIsInactive(true);
        setIsFadingOut(false); // If we reached inactivity again, stop fade out
      } else {
        setIsInactive(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

    const isVisible = isInactive || isFadingOut;
  
    return {
      remainingTime,
      formattedTime: formatTime(remainingTime),
      isTimerVisible: isVisible,
      isFadingOut,
      showRefresh: isVisible && remainingTime <= REFRESH_THRESHOLD,
      resetSession,
    };
  }

