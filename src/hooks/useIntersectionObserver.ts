import { useState, useEffect, useRef } from 'react';

export function useIntersectionObserver(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const checkViewport = () => {
      if (typeof window === 'undefined') return { isLandscape: false, isMobileTablet: false };
      const width = window.innerWidth;
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isLandscapeTablet = width >= 768 && width <= 1024 && isLandscape;
      const isMobileTablet = width <= 1024;
      return { isLandscape, isMobileTablet };
    };

    const { isLandscape } = checkViewport();
    setIsLandscapeTablet(isLandscape);

    const handleViewportChange = () => {
      const { isLandscape: newLandscape } = checkViewport();
      setIsLandscapeTablet(newLandscape);
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);

    const threshold = 0.05;
    const rootMargin = '0px 0px 0px 0px';

    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }
    }, { threshold, rootMargin, ...options });

    if (ref.current) {
      observer.observe(ref.current);
      
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      if (rect.top < viewportHeight && rect.bottom > 0) {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  return [ref, isVisible, isLandscapeTablet] as const;
}
