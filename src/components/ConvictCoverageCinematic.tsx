"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export const ConvictCoverageCinematic = () => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const pinGroupRef = useRef<HTMLDivElement>(null);
  const pinSvgRef = useRef<SVGSVGElement>(null);
  const pinPathRef = useRef<SVGPathElement>(null);
  const localTextRef = useRef<HTMLDivElement>(null);
  const virtualTextRef = useRef<HTMLDivElement>(null);
  const mapLayerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapLabelRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const denverMapImgRef = useRef<HTMLImageElement>(null);
  const usaMapImgRef = useRef<HTMLImageElement>(null);

  const [pins, setPins] = useState<any[]>([]);
  const [subPins, setSubPins] = useState<any[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [finalRelativePos, setFinalRelativePos] = useState(0);
  
  const isAnimating = useRef(false);
  const localPinsDone = useRef(false);
  const virtualPinsDone = useRef(false);
  const subPinsDone = useRef(false);
  const autoCtaStarted = useRef(false);
  const lastProgress = useRef(0);
  const maxAllowedProgress = useRef(0.22);
  const touchStartY = useRef(0);

  // Block scrolling when locked or at scroll gate
  useEffect(() => {
    const getProgress = () => {
      if (!triggerRef.current) return -1;
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScroll = triggerRef.current.offsetHeight - viewportHeight;
      const start = window.pageYOffset + rect.top;
      const current = window.pageYOffset;
      if (current < start) return -1;
      return Math.min(1, Math.max(0, (current - start) / totalScroll));
    };

    const handleWheel = (e: WheelEvent) => {
      if (isLocking || isLocked) {
        e.preventDefault();
        return;
      }
      if (!hasCompleted && e.deltaY > 0) {
        const progress = getProgress();
        if (progress >= 0 && progress >= maxAllowedProgress.current - 0.01) {
          e.preventDefault();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isLocking || isLocked) {
        e.preventDefault();
        return;
      }
      const deltaY = touchStartY.current - e.touches[0].clientY;
      if (!hasCompleted && deltaY > 0) {
        const progress = getProgress();
        if (progress >= 0 && progress >= maxAllowedProgress.current - 0.01) {
          e.preventDefault();
        }
      }
    };

    if (isLocked || isLocking) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isLocked, isLocking, hasCompleted]);

  const denverCities = [
    { name: "Denver", x: 50, y: 50 }, { name: "Broomfield", x: 45, y: 22 },
    { name: "Golden", x: 18, y: 48 }, { name: "Aurora", x: 82, y: 52 },
    { name: "Lakewood", x: 32, y: 58 }, { name: "Parker", x: 80, y: 85 },
    { name: "Wheat Ridge", x: 35, y: 45 }, { name: "Arvada", x: 28, y: 35 },
    { name: "Thornton", x: 58, y: 18 }, { name: "Westminster", x: 42, y: 30 },
    { name: "Littleton", x: 42, y: 78 }, { name: "Centennial", x: 72, y: 75 },
    { name: "Highlands Ranch", x: 48, y: 88 }, { name: "Castle Rock", x: 58, y: 95 },
    { name: "Brighton", x: 75, y: 12 }, { name: "Commerce City", x: 62, y: 35 },
    { name: "Northglenn", x: 52, y: 24 }, { name: "Englewood", x: 48, y: 65 },
    { name: "Sheridan", x: 40, y: 68 }, { name: "Greenwood Village", x: 62, y: 70 },
    { name: "Lone Tree", x: 58, y: 85 }, { name: "Federal Heights", x: 46, y: 34 },
    { name: "Morrison", x: 12, y: 65 }, { name: "Cherry Hills", x: 56, y: 64 },
    { name: "Ken Caryl", x: 25, y: 82 }
  ];

  const usStates = [
    { name: "Alabama", x: 72, y: 72 }, { name: "Alaska", x: 15, y: 85 }, { name: "Arizona", x: 20, y: 65 }, { name: "Arkansas", x: 62, y: 65 },
    { name: "California", x: 8, y: 48 }, { name: "Colorado", x: 32, y: 48 }, { name: "Connecticut", x: 92, y: 30 }, { name: "Delaware", x: 91, y: 42 },
    { name: "Florida", x: 82, y: 88 }, { name: "Georgia", x: 78, y: 75 }, { name: "Hawaii", x: 25, y: 92 }, { name: "Idaho", x: 18, y: 22 },
    { name: "Illinois", x: 65, y: 42 }, { name: "Indiana", x: 72, y: 42 }, { name: "Iowa", x: 55, y: 38 }, { name: "Kansas", x: 48, y: 52 },
    { name: "Kentucky", x: 74, y: 54 }, { name: "Louisiana", x: 62, y: 82 }, { name: "Maine", x: 96, y: 12 }, { name: "Maryland", x: 89, y: 45 },
    { name: "Massachusetts", x: 94, y: 26 }, { name: "Michigan", x: 72, y: 30 }, { name: "Minnesota", x: 55, y: 22 }, { name: "Mississippi", x: 66, y: 75 },
    { name: "Missouri", x: 60, y: 52 }, { name: "Montana", x: 28, y: 15 }, { name: "Nebraska", x: 45, y: 38 }, { name: "Nevada", x: 12, y: 38 },
    { name: "New Hampshire", x: 93, y: 20 }, { name: "New Jersey", x: 90, y: 38 }, { name: "New Mexico", x: 32, y: 68 }, { name: "New York", x: 86, y: 28 },
    { name: "North Carolina", x: 85, y: 58 }, { name: "North Dakota", x: 45, y: 15 }, { name: "Ohio", x: 78, y: 42 }, { name: "Oklahoma", x: 50, y: 65 },
    { name: "Oregon", x: 8, y: 20 }, { name: "Pennsylvania", x: 84, y: 38 }, { name: "Rhode Island", x: 96, y: 30 }, { name: "South Carolina", x: 82, y: 66 },
    { name: "South Dakota", x: 45, y: 26 }, { name: "Tennessee", x: 70, y: 58 }, { name: "Texas", x: 45, y: 82 }, { name: "Utah", x: 22, y: 48 },
    { name: "Vermont", x: 90, y: 18 }, { name: "Virginia", x: 88, y: 50 }, { name: "Washington", x: 10, y: 10 }, { name: "West Virginia", x: 82, y: 48 },
    { name: "Wisconsin", x: 64, y: 28 }, { name: "Wyoming", x: 32, y: 28 }
  ];

  const additionalUSLocations = [
    { name: "Puerto Rico", x: 85, y: 95 }, { name: "Guam", x: 5, y: 95 }, 
    { name: "Virgin Islands", x: 90, y: 95 }, { name: "American Samoa", x: 10, y: 95 }
  ];

  const allUSStates = [...usStates, ...additionalUSLocations];

  const staticSubCities = useRef(Array.from({ length: 400 }, () => ({
    x: Math.random() * 92 + 4,
    y: Math.random() * 82 + 8
  })));

  useEffect(() => {
    if (denverMapImgRef.current) {
      denverMapImgRef.current.src = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1766237553532-1766261375420.jpg?width=8000&height=8000&resize=contain";
    }
    if (usaMapImgRef.current) {
      usaMapImgRef.current.src = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1766237711748-1766238214692.jpg?width=8000&height=8000&resize=contain";
    }
  }, []);

  const dropPins = async (data: any[], type: 'pins' | 'subPins' = 'pins', duration = 2000, keepLocked = false) => {
    isAnimating.current = true;
    setIsLocking(true);
    const batchSize = type === 'subPins' ? 12 : 1;
    const stagger = duration / (data.length / batchSize);

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      if (type === 'subPins') {
        setSubPins(prev => [...prev, ...batch]);
      } else {
        setPins(prev => [...prev, ...batch]);
      }
      await new Promise(r => setTimeout(r, stagger));
    }
    await new Promise(r => setTimeout(r, 600));
    isAnimating.current = false;
    if (!keepLocked) setIsLocking(false);
  };

  const autoTransitionToCta = async () => {
    if (autoCtaStarted.current) return;
    autoCtaStarted.current = true;
    setIsLocking(true);
    
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const p = Math.min(1, elapsed / duration);
      
      const fadeOutP = p;
      
      if (mapLayerRef.current) mapLayerRef.current.style.opacity = `${1 - fadeOutP}`;
      if (mapContainerRef.current) mapContainerRef.current.style.transform = `translate3d(0,0,0) scale(${1.4 + fadeOutP * 0.2})`;
      if (finalCtaRef.current) {
        finalCtaRef.current.style.opacity = `${fadeOutP}`;
        finalCtaRef.current.style.transform = `translate3d(0, ${20 - fadeOutP * 20}px, 0)`;
        finalCtaRef.current.style.pointerEvents = fadeOutP > 0.5 ? 'auto' : 'none';
      }
      
      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
            setIsLocking(false);
            setIsLocked(false);
            
            // Finalize height to current scroll position to avoid jump or "auto-scroll"
            if (triggerRef.current) {
              const currentScroll = window.scrollY;
              const rect = triggerRef.current.getBoundingClientRect();
              const start = currentScroll + rect.top;
              const relativePos = currentScroll - start;
              
              setFinalRelativePos(relativePos);
              setHasCompleted(true);
              
              // Set height to exactly current scroll depth + 1 viewport to end sticky phase immediately
              const finalHeightPx = relativePos + window.innerHeight;
              triggerRef.current.style.transition = 'none';
              triggerRef.current.style.height = `${finalHeightPx}px`;
            }
        }
      };
    
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleScroll = async () => {
      if (!triggerRef.current || hasCompleted) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScroll = triggerRef.current.offsetHeight - viewportHeight;
      
      const start = window.pageYOffset + rect.top;
      const current = window.pageYOffset;
      const progress = Math.min(1, Math.max(0, (current - start) / totalScroll));

        const scrollingDown = progress > lastProgress.current;
        lastProgress.current = progress;

        if (current < start) return;

        // Safety clamp: if user somehow scrolled past the gate, pull them back
        if (!hasCompleted && progress > maxAllowedProgress.current) {
          const clampedScroll = start + maxAllowedProgress.current * totalScroll;
          window.scrollTo({ top: clampedScroll });
          return;
        }

      if (scrollingDown) {
        // Clear Denver pins earlier to transition
        if (progress > 0.22 && pins.length > 0 && !virtualPinsDone.current && !isAnimating.current && pins.some(p => p.name === "Denver")) {
          setPins([]);
        }

          if (progress > 0.18 && progress < 0.25 && !localPinsDone.current && !isAnimating.current) {
            localPinsDone.current = true;
            denverMapImgRef.current?.classList.add('visible');
            if (mapLabelRef.current) mapLabelRef.current.innerText = "DENVER";
            await dropPins(denverCities, 'pins', 2000);
            maxAllowedProgress.current = 0.62;
          }

          if (progress > 0.58 && !virtualPinsDone.current && !isAnimating.current) {
          virtualPinsDone.current = true;
          maxAllowedProgress.current = 1.0;
          setIsLocking(true);
          setPins([]); 
          if (usaMapImgRef.current) usaMapImgRef.current.classList.add('visible');
          if (mapLabelRef.current) mapLabelRef.current.innerText = "UNITED STATES";
          
          setShowLabels(true);
          await dropPins(allUSStates, 'pins', 2500, true);
          
          await new Promise(r => setTimeout(r, 1000));
          setShowLabels(false);
          await new Promise(r => setTimeout(r, 1500)); 
          
          if (!subPinsDone.current) {
            subPinsDone.current = true;
            await dropPins(staticSubCities.current, 'subPins', 4000, true);
          }

          await autoTransitionToCta();
        }
      }

      if (!autoCtaStarted.current) {
        if (progress <= 0.2) {
          const p = progress / 0.2;
          const scale = 1 + Math.pow(p, 4) * 600;
          if (pinSvgRef.current) pinSvgRef.current.style.transform = `translate3d(0,0,0) scale(${scale})`;
          if (pinPathRef.current) pinPathRef.current.style.strokeWidth = `${Math.max(0.1, 14 / Math.sqrt(scale))}`;
          if (localTextRef.current) localTextRef.current.style.opacity = `${Math.max(0, 1 - p * 2.5)}`;
          if (mapLayerRef.current) mapLayerRef.current.style.opacity = `${p > 0.6 ? (p - 0.6) * 2.5 : 0}`;
          if (pinGroupRef.current) pinGroupRef.current.style.opacity = `${p > 0.95 ? 0 : 1}`;
        } 
        else if (progress > 0.2 && progress <= 0.45) {
          const p = (progress - 0.2) / 0.25;
          if (p < 0.3) { 
            if (mapLayerRef.current) mapLayerRef.current.style.opacity = `${1 - (p / 0.3)}`; 
          } 
          else if (p >= 0.3 && p <= 0.4) {
            if (mapLayerRef.current) mapLayerRef.current.style.opacity = '0'; 
            if (mapLabelRef.current) {
              if (scrollingDown) {
                mapLabelRef.current.innerText = "UNITED STATES"; 
                denverMapImgRef.current?.classList.remove('visible');
                usaMapImgRef.current?.classList.add('visible');
              } else {
                mapLabelRef.current.innerText = "DENVER";
                denverMapImgRef.current?.classList.add('visible');
                usaMapImgRef.current?.classList.remove('visible');
              }
            }
          } 
          else if (p > 0.4 && p <= 0.7) {
            const textInP = (p - 0.4) / 0.3;
            if (virtualTextRef.current) {
              virtualTextRef.current.style.opacity = `${textInP}`;
              virtualTextRef.current.style.transform = `translate3d(0,0,0) scale(${0.6 + textInP * 0.4})`;
            }
          } else {
            const textOutP = (p - 0.7) / 0.3;
            if (virtualTextRef.current) {
              virtualTextRef.current.style.opacity = `${1 - textOutP}`;
              virtualTextRef.current.style.transform = `translate3d(0,0,0) scale(1)`;
            }
          }
        }
        else if (progress > 0.45 && progress <= 0.7) {
          const p = (progress - 0.45) / 0.25;
          if (mapLayerRef.current) mapLayerRef.current.style.opacity = `${Math.min(1, p * 2.5)}`;
          if (mapContainerRef.current) mapContainerRef.current.style.transform = `translate3d(0,0,0) scale(1)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pins.length, hasCompleted]);

  return (
    <>
      <style>{`
          :root {
              --brand-orange: #F28C28;
              --brand-purple: #A92FFA;
              --brand-glow: rgba(242, 140, 40, 0.6);
            --bg-primary: #ffffff;
            --text-main: #111827;
            --map-bg: #fdfdfd;
            --map-shadow: rgba(107, 33, 168, 0.05);
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-primary: #0a0a0a;
                --text-main: #f3f4f6;
                --map-bg: #121212;
                --map-shadow: rgba(107, 33, 168, 0.2);
            }
        }
          .scroll-space { height: 500vh; position: relative; }
        .sticky-wrapper {
            position: sticky; top: 0; height: 100vh; width: 100%;
            display: flex; flex-direction: column; justify-content: center;
            align-items: center; overflow: hidden; background-color: var(--bg-primary);
            backface-visibility: hidden; z-index: 40; will-change: transform;
        }
        .text-layer {
            position: absolute; z-index: 40; text-align: center; max-width: 900px;
            padding: 20px; pointer-events: none; will-change: opacity, transform;
            transform: translate3d(0,0,0);
        }
        .pin-container {
            position: absolute; z-index: 100; display: flex; flex-direction: column;
            align-items: center; margin-top: 180px; pointer-events: none;
            will-change: transform, opacity; transform: translate3d(0,0,0);
        }
        .pin-svg {
            width: 60px; height: 84px; fill: none; stroke: var(--brand-orange);
            stroke-width: 14; stroke-linecap: round; stroke-linejoin: round;
            overflow: visible; transform-origin: 25px 25px;
            filter: drop-shadow(0 0 10px rgba(255, 107, 0, 0.3));
            transition: transform 0.05s linear;
        }
        .map-layer {
            position: absolute; inset: 0; z-index: 20; display: flex;
            justify-content: center; align-items: center; opacity: 0;
            background-color: var(--bg-primary); pointer-events: none;
            will-change: opacity; transform: translate3d(0,0,0);
        }
        .map-container {
            position: relative; width: 95%; max-width: 1100px; aspect-ratio: 1.8 / 1;
            background-color: var(--map-bg); border-radius: 40px;
            box-shadow: inset 0 0 100px var(--map-shadow);
            border: 1px solid rgba(107, 33, 168, 0.1); overflow: hidden;
            will-change: transform; transform: translate3d(0,0,0);
        }
        .map-image {
            position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
            opacity: 0; transition: opacity 1s ease-in-out;
            filter: grayscale(100%) contrast(1.2) brightness(1.1);
            mix-blend-mode: multiply; transform: translate3d(0,0,0);
        }
        @media (prefers-color-scheme: dark) {
            .map-image { filter: grayscale(100%) contrast(1.4) brightness(0.6) invert(1); mix-blend-mode: lighten; }
        }
        .map-image.visible { opacity: 0.45; }
        .marker { position: absolute; display: flex; flex-direction: column; align-items: center; transform: translate3d(-50%, -100%, 0); z-index: 30; will-change: transform, opacity; }
        .dynamic-pin { width: 24px; height: 32px; transform: scale(0) translate3d(0,0,0); position: relative; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2)); }
        .pin-glow { position: absolute; top: 50%; left: 50%; width: 40px; height: 40px; background: radial-gradient(circle, var(--brand-glow) 0%, transparent 70%); border-radius: 50%; transform: translate(-50%, -50%) scale(0); opacity: 0; pointer-events: none; z-index: -1; }
        .pin-shape { fill: url(#pinGradient); }
        .marker.active .dynamic-pin { animation: arrival-pin 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .marker.active .pin-glow { animation: pin-pulse-glow 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes arrival-pin {
            0% { transform: scale(0) translate3d(0, 20px, 0); opacity: 0; }
            70% { transform: scale(1.4) translate3d(0, -10px, 0); opacity: 1; } 
            100% { transform: scale(1) translate3d(0, 0, 0); opacity: 1; }  
        }
        @keyframes pin-pulse-glow {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(2.5); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0.3; }
        }
        .marker.sub-marker .dynamic-pin { width: 14px; height: 18px; opacity: 0.8; }
        .marker.sub-marker .pin-glow { width: 20px; height: 20px; }
        .marker-label {
            font-size: 10px; font-weight: 800; color: #6b21a8; margin-top: 6px;
            white-space: nowrap; opacity: 0; transform: translate3d(0, 10px, 0);
            transition: opacity 0.5s ease-out, transform 0.5s ease-out;
            text-transform: uppercase; letter-spacing: 0.05em;
            background: rgba(255, 255, 255, 0.95); padding: 4px 10px;
            border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            pointer-events: none; border: none; will-change: transform, opacity;
        }
        @media (prefers-color-scheme: dark) {
            .marker-label { background: rgba(30, 30, 30, 0.95); color: #c084fc; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        }
        .marker-label.fading-out {
            opacity: 0 !important; transform: translate3d(0, -10px, 0) !important;
            transition: opacity 1.5s ease-in-out, transform 1.5s ease-in-out !important;
        }
        .marker.active .marker-label { opacity: 1; transform: translate3d(0, 0, 0); transition-delay: 0.4s; }
        .bg-text {
            position: absolute; inset: 0; display: flex; justify-content: center;
            align-items: center; font-size: 12vw; font-weight: 900;
            color: rgba(107, 33, 168, 0.04); text-transform: uppercase;
            letter-spacing: -0.05em; pointer-events: none; transition: opacity 1s ease;
            transform: translate3d(0,0,0);
        }
        #finalCta {
            position: absolute; z-index: 100; opacity: 0; transform: translate3d(0, 20px, 0);
            pointer-events: none; transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
            display: flex; flex-direction: column; align-items: center; will-change: transform, opacity;
        }
        .cta-button {
            background: linear-gradient(135deg, var(--brand-orange), var(--brand-purple));
            color: white; font-weight: 900; padding: 20px 60px; border-radius: 100px;
            font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.1em;
            box-shadow: 0 20px 40px rgba(107, 33, 168, 0.3); text-decoration: none;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            pointer-events: auto; display: block;
        }
        .cta-button:hover { transform: translate3d(0, -4px, 0) scale(1.05); box-shadow: 0 25px 50px rgba(107, 33, 168, 0.4); }
        @media (prefers-color-scheme: dark) { .bg-text { color: rgba(168, 85, 247, 0.05); } }
      `}</style>

      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <defs>
          <radialGradient id="pinGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff6b00" />
            <stop offset="100%" stopColor="#6b21a8" />
          </radialGradient>
        </defs>
      </svg>

      <div className="scroll-space" id="trigger" ref={triggerRef}>
        <div 
          className="sticky-wrapper"
          style={hasCompleted ? { 
            position: 'absolute', 
            top: `${finalRelativePos}px`,
            height: '100vh',
            bottom: 'auto'
          } : {}}
        >
          
          {!hasCompleted && (
            <>
              <div className="text-layer" id="localText" ref={localTextRef}>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                  CONVICT<br /><span className="text-[#ff6b00]">COVERAGE</span>
                </h1>
                <p className="text-purple-600/40 dark:text-purple-400/30 font-bold tracking-[0.4em] text-sm mt-4 uppercase">Denver Metro Focus</p>
              </div>

              <div className="text-layer" id="virtualText" ref={virtualTextRef} style={{ opacity: 0, transform: 'translate3d(0,0,0) scale(0.6)' }}>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                  VIRTUALLY<br /><span className="text-[#6b21a8] dark:text-[#a855f7]">EVERYWHERE</span>
                </h1>
                <p className="text-orange-500/40 font-bold tracking-[0.4em] text-sm mt-4 uppercase">United States Coverage</p>
              </div>

              <div className="pin-container" id="pinGroup" ref={pinGroupRef}>
                <svg className="pin-svg" viewBox="0 0 50 70" id="pinSvg" ref={pinSvgRef}>
                  <path d="M25 65C25 65 5 44.25 5 25C5 13.95 13.95 5 25 5C36.05 5 45 13.95 45 25C45 44.25 25 65 25 65Z" id="pinPath" ref={pinPathRef} />
                </svg>
              </div>

              <div className="map-layer" id="mapLayer" ref={mapLayerRef}>
                <div className="map-container" id="mapContainer" ref={mapContainerRef}>
                  <img id="denverMap" ref={denverMapImgRef} className="map-image" alt="Denver Metro Area Map" />
                  <img id="usaMap" ref={usaMapImgRef} className="map-image" alt="USA Map" />
                  <div id="mapLabel" ref={mapLabelRef} className="bg-text">DENVER</div>
                  
                  {pins.map((pin, i) => (
                    <div key={`pin-${i}`} className="marker active" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
                      <div className="pin-glow"></div>
                      <div className="dynamic-pin">
                        <svg viewBox="0 0 50 70" width="100%" height="100%">
                          <path className="pin-shape" d="M25 65C25 65 5 44.25 5 25C5 13.95 13.95 5 25 5C36.05 5 45 13.95 45 25C45 44.25 25 65 25 65Z" />
                          <circle cx="25" cy="25" r="8" fill="white" fillOpacity="0.3" />
                        </svg>
                      </div>
                      {pin.name && (
                        <div className={`marker-label ${!showLabels ? 'fading-out' : ''}`}>
                          {pin.name}
                        </div>
                      )}
                    </div>
                  ))}

                  {subPins.map((pin, i) => (
                    <div key={`subpin-${i}`} className="marker sub-marker active" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
                      <div className="pin-glow"></div>
                      <div className="dynamic-pin">
                        <svg viewBox="0 0 50 70" width="100%" height="100%">
                          <path className="pin-shape" d="M25 65C25 65 5 44.25 5 25C5 13.95 13.95 5 25 5C36.05 5 45 13.95 45 25C45 44.25 25 65 25 65Z" />
                          <circle cx="25" cy="25" r="8" fill="white" fillOpacity="0.3" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div id="finalCta" ref={finalCtaRef} style={{ opacity: hasCompleted ? 1 : 0, transform: hasCompleted ? 'translate3d(0, 0, 0)' : 'translate3d(0, 20px, 0)', pointerEvents: hasCompleted ? 'auto' : 'none' }}>
            <Link href="/contact" className="cta-button">Convict Commit</Link>
            <p className="mt-6 font-bold text-sm tracking-widest uppercase opacity-40">Ready to take the next step?</p>
          </div>

        </div>
      </div>
    </>
  );
};
