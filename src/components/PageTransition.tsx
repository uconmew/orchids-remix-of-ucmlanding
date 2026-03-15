"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [prevPathname, setPrevPathname] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      setIsVisible(true);
    }
  }, [isFirstLoad]);

  useEffect(() => {
    if (prevPathname !== null && prevPathname !== pathname) {
      setIsVisible(false);
      
      setTimeout(() => {
        setIsVisible(true);
      }, 150);
    }
    
    setPrevPathname(pathname);
  }, [pathname, prevPathname]);

  return (
    <>
      <div 
        className={`fixed inset-0 z-[9998] pointer-events-none transition-opacity duration-[300ms] ease-in-out bg-white dark:bg-black ${
          isVisible ? 'opacity-0' : 'opacity-100'
        }`}
      />
      
      <div 
        className={`transition-opacity duration-[300ms] ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </>
  );
}
