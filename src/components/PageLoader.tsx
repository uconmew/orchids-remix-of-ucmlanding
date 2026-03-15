"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [prevPathname, setPrevPathname] = useState<string | null>(null);
  const pathname = usePathname();

  // Handle initial page load
  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }, 500);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  // Handle pathname changes
  useEffect(() => {
    if (prevPathname !== null && prevPathname !== pathname) {
      setIsLoading(true);
      setIsFadingOut(false);
      
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }, 300);
    }
    
    setPrevPathname(pathname);
  }, [pathname, prevPathname]);

  if (!isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 ease-in-out pointer-events-none ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="dot-spinner-container">
        <div className="dot-spinner">
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
        </div>
      </div>
    </div>
  );
}
