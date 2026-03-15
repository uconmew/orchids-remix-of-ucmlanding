"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE: The boom IS the clock.
//
// Every word is born the instant its boom fires.
// The word lives for exactly BOOM_RESONANCE ms — the boom's natural decay.
// The next boom fires after INTERVAL ms.
//
// At slow speed:  interval ≈ resonance → clean single-word display
// At fast speed:  interval << resonance → booms stack, words stack, pure blur
//
// No pre-fades. No independent timers. Boom fires → word snaps → word lingers
// exactly as long as the sound lingers → gone.
// ─────────────────────────────────────────────────────────────────────────────

const WORDS = [
  // ── OPENING — 8 words steady ──
  "Welcome.",
  "United Convicts.",
  "ALONE?",
  "ASHAMED?",
  "NUMB?",
  "HOLLOW?",
  "TERRIFIED?",
  "DESPERATE?",

  // ── ACCELERATION BEGINS ──
  "EXHAUSTED?",
  "ANGRY?",
  "GRIEVING?",
  "HOPELESS?",
  "PANICKING?",
  "RESTLESS?",
  "DISGUSTED?",
  "EMBARRASSED?",
  "FORGOTTEN?",
  "INCARCERATED?",
  "HOMELESS?",
  "RELAPSING?",
  "EVICTED?",
  "STILL USING?",
  "JUST OUT?",
  "COURT DATE?",
  "ON PROBATION?",
  "UNEMPLOYABLE?",
  "LOST CUSTODY?",
  "NOWHERE LEFT?",
  "BROKEN?",
  "DAMAGED?",
  "DISPOSABLE?",
  "INVISIBLE?",
  "REJECTED?",
  "WORTHLESS?",
  "UNLOVABLE?",
  "UNFIXABLE?",
  "A BURDEN?",
  "A MISTAKE?",
  "TOO FAR?",
  "BEYOND GRACE?",
  "NOT ENOUGH?",
  "ADDICTED?",
  "GUILTY?",
  "EVERYONE LEFT?",
  "YOU LEFT?",
  "BURNED DOWN?",
  "TOO ASHAMED?",
  "NO ONE LEFT?",
  "YOUR KIDS?",
  "YOUR FAMILY?",
  "NO ONE CALLS?",

  // ── PURE BLUR TERRITORY ──
  "3AM.",
  "THE FLOOR.",
  "AGAIN.",
  "STILL HERE.",
  "CAN'T STOP.",
  "ONE MORE TIME.",
  "NO PURPOSE?",
  "SOMEBODY SAW.",
  "HE WAITED.",
  "STILL YOU.",
  "NOT DONE.",
  "YOUR PAST?",
  "YOUR PURPOSE.",
  "HELP?",

  // ── THE ANSWER ──
  "JESUS.",
];

const FINAL_WORDS = ["WE'VE", "BEEN", "WAITING", "JUST", "FOR", "YOU"];

// ── Timing constants ──────────────────────────────────────────────────────────
const STEADY_COUNT    = 8;     // first N words play at full interval
const START_INTERVAL  = 1500;  // ms between boom triggers at start (~boom file length)
const END_INTERVAL    = 80;    // ms between boom triggers at peak speed
const BOOM_RESONANCE  = 1500;  // how long each word stays visible (matches boom decay)
const JESUS_DURATION  = 3000;  // JESUS holds for 3s (full cubic-bezier scale)
const RISER_DURATION  = 60;    // riser locked to 60 seconds

// ── Audio ─────────────────────────────────────────────────────────────────────
const OPENING_HIT_URL      = "https://od.lk/d/NzNfMTEyMzg5ODUxXw/cinematic-hit-425569.mp3";
const WORD_BOOM_URL        = "https://od.lk/d/NzNfMTEyMzg5ODUzXw/fx-dramatic-cinematic-boom-sound-effect-249258.mp3";
const IMPACT_AUDIO_URL     = "https://od.lk/d/NzNfMTEyMzg5ODUyXw/cinematic-impact-106030.mp3";
const BACKGROUND_MUSIC_URL = "https://od.lk/d/NzNfMTEyMzkwMDUwXw/emotional-cinematic-inspiring-piano-beautiful-ambient-background-music-238377.mp3";

const preloadAudio = (url: string): HTMLAudioElement => {
  const audio = new Audio(url);
  audio.preload = "auto";
  return audio;
};

const playAudioFull = (audio: HTMLAudioElement, volume: number = 0.6) => {
  const clone = audio.cloneNode(true) as HTMLAudioElement;
  clone.volume = Math.min(1, volume);
  clone.currentTime = 0;
  clone.play().catch(() => {});
};

// ── Riser: 3 layers locked to 60s, all accelerate together ───────────────────
const createRiser = (ctx: AudioContext, duration: number = RISER_DURATION) => {
  if (!ctx) return;
  const t = ctx.currentTime;

  // Sub bass: deep rumble → surge
  const sub = ctx.createOscillator();
  const subG = ctx.createGain();
  const subF = ctx.createBiquadFilter();
  sub.connect(subF); subF.connect(subG); subG.connect(ctx.destination);
  sub.type = "sawtooth";
  sub.frequency.setValueAtTime(20, t);
  sub.frequency.exponentialRampToValueAtTime(50,  t + duration * 0.6);
  sub.frequency.exponentialRampToValueAtTime(120, t + duration);
  subF.type = "lowpass";
  subF.frequency.setValueAtTime(60, t);
  subF.frequency.exponentialRampToValueAtTime(200, t + duration * 0.6);
  subF.frequency.exponentialRampToValueAtTime(900, t + duration);
  subF.Q.value = 10;
  subG.gain.setValueAtTime(0, t);
  subG.gain.linearRampToValueAtTime(0.25, t + 2);
  subG.gain.linearRampToValueAtTime(0.5,  t + duration * 0.6);
  subG.gain.linearRampToValueAtTime(0.8,  t + duration - 1);
  subG.gain.linearRampToValueAtTime(0,    t + duration);
  sub.start(t); sub.stop(t + duration);

  // Mid pitch: crawl → scream
  const mid = ctx.createOscillator();
  const midG = ctx.createGain();
  const midF = ctx.createBiquadFilter();
  mid.connect(midF); midF.connect(midG); midG.connect(ctx.destination);
  mid.type = "sine";
  mid.frequency.setValueAtTime(80, t);
  mid.frequency.exponentialRampToValueAtTime(200,  t + duration * 0.5);
  mid.frequency.exponentialRampToValueAtTime(600,  t + duration * 0.75);
  mid.frequency.exponentialRampToValueAtTime(2000, t + duration);
  midF.type = "bandpass";
  midF.frequency.setValueAtTime(200, t);
  midF.frequency.exponentialRampToValueAtTime(2000, t + duration);
  midF.Q.value = 3;
  midG.gain.setValueAtTime(0, t);
  midG.gain.linearRampToValueAtTime(0.1,  t + 3);
  midG.gain.linearRampToValueAtTime(0.25, t + duration * 0.6);
  midG.gain.linearRampToValueAtTime(0.5,  t + duration - 1);
  midG.gain.linearRampToValueAtTime(0,    t + duration);
  mid.start(t); mid.stop(t + duration);

  // Tremolo LFO: 0.5hz slow dread → 18hz frantic
  const trem = ctx.createOscillator();
  const tremG = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoG = ctx.createGain();
  lfo.connect(lfoG); lfoG.connect(tremG.gain);
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(0.5, t);
  lfo.frequency.exponentialRampToValueAtTime(3,  t + duration * 0.5);
  lfo.frequency.exponentialRampToValueAtTime(18, t + duration);
  lfoG.gain.setValueAtTime(0.05, t);
  lfoG.gain.linearRampToValueAtTime(0.2, t + duration * 0.6);
  lfoG.gain.linearRampToValueAtTime(0.4, t + duration);
  trem.connect(tremG); tremG.connect(ctx.destination);
  trem.type = "sawtooth";
  trem.frequency.setValueAtTime(180, t);
  trem.frequency.exponentialRampToValueAtTime(900, t + duration);
  tremG.gain.setValueAtTime(0, t);
  tremG.gain.linearRampToValueAtTime(0.08, t + duration * 0.4);
  tremG.gain.linearRampToValueAtTime(0.35, t + duration - 2);
  tremG.gain.linearRampToValueAtTime(0,    t + duration);
  lfo.start(t); lfo.stop(t + duration);
  trem.start(t); trem.stop(t + duration);
};

// ── Compute interval for word at index i ─────────────────────────────────────
const getInterval = (i: number, total: number): number => {
  if (i < STEADY_COUNT) return START_INTERVAL;
  const accelTotal = total - STEADY_COUNT - 1; // exclude JESUS
  const progress = (i - STEADY_COUNT) / Math.max(accelTotal - 1, 1);
  const eased = progress * progress * (3 - 2 * progress); // smoothstep
  return Math.round(START_INTERVAL - eased * (START_INTERVAL - END_INTERVAL));
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function WordShuffleHero() {
  // Stack of currently visible words — overlap at high speed means multiple visible
  const [visibleWords, setVisibleWords] = useState<{ id: number; text: string }[]>([]);
  const [showFinal, setShowFinal]        = useState(false);
  const [hasStarted, setHasStarted]      = useState(false);
  const [fadeOutFinal, setFadeOutFinal]  = useState(false);

  const audioCtxRef        = useRef<AudioContext | null>(null);
  const startedRef         = useRef(false);
  const openingHitRef      = useRef<HTMLAudioElement | null>(null);
  const boomRef            = useRef<HTMLAudioElement | null>(null);
  const impactRef          = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef         = useRef<HTMLAudioElement | null>(null);
  const wordIdRef          = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    openingHitRef.current = preloadAudio(OPENING_HIT_URL);
    boomRef.current       = preloadAudio(WORD_BOOM_URL);
    impactRef.current     = preloadAudio(IMPACT_AUDIO_URL);
    bgMusicRef.current    = preloadAudio(BACKGROUND_MUSIC_URL);
    if (bgMusicRef.current) bgMusicRef.current.loop = true;

    return () => {
      audioCtxRef.current?.close();
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    };
  }, []);

  const startAnimation = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setHasStarted(true);

    window.dispatchEvent(new CustomEvent("animationStarted"));

    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();

    // Fire opening hit + riser locked to 60s
    if (openingHitRef.current) playAudioFull(openingHitRef.current, 0.7);
    if (audioCtxRef.current)   createRiser(audioCtxRef.current, RISER_DURATION);

    const total = WORDS.length;
    let elapsed = 0;

    WORDS.forEach((word, i) => {
      const isJesus = word === "JESUS.";
      const isHelpQ = i === total - 2; // HELP? — fires impact before JESUS
      const interval = isJesus ? 0 : getInterval(i, total);

      // Volume climbs with speed — louder as words stack faster
      // JESUS drops back to quiet/sacred
      const accelProgress = i < STEADY_COUNT ? 0 : (i - STEADY_COUNT) / (total - STEADY_COUNT - 1);
      const boomVol = isJesus ? 0.45 : 0.4 + accelProgress * 0.5;

      // Schedule this boom + word appearance
      setTimeout(() => {
        // HELP? fires the cinematic impact
        if (isHelpQ && impactRef.current) playAudioFull(impactRef.current, 0.9);

        // Boom fires → word appears instantly
        if (boomRef.current) playAudioFull(boomRef.current, Math.min(boomVol, 0.9));

        const id = ++wordIdRef.current;

        setVisibleWords(prev => [...prev, { id, text: word }]);

        // Word lives for BOOM_RESONANCE ms (or JESUS_DURATION for JESUS)
        const lifetime = isJesus ? JESUS_DURATION : BOOM_RESONANCE;
        setTimeout(() => {
          setVisibleWords(prev => prev.filter(w => w.id !== id));

          // After JESUS fades — show final message
          if (isJesus) {
            setTimeout(() => {
              setShowFinal(true);
              if (boomRef.current) playAudioFull(boomRef.current, 0.3);

              setTimeout(() => {
                window.dispatchEvent(new CustomEvent("wordShuffleComplete"));
                if (bgMusicRef.current) {
                  bgMusicRef.current.volume = 0.4;
                  bgMusicRef.current.play().catch(() => {});
                }
                setTimeout(() => setFadeOutFinal(true), 500);
              }, 500);
            }, 800);
          }
        }, lifetime);
      }, elapsed);

      elapsed += interval;
    });
  };

  return (
    <div className="relative flex flex-col justify-center items-center min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] overflow-hidden">

      {/* ── Dark scene backdrop — appears instantly so words are always legible ── */}
      {hasStarted && (
        <div className="absolute inset-0 z-0 rounded-2xl bg-black" />
      )}

      {/* ── Play button ── */}
      {!hasStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={startAnimation}
            size="icon"
            className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:from-[#A92FFA]/90 hover:to-[#F28C28]/90 text-white w-20 h-20 rounded-full shadow-2xl hover:shadow-[0_0_50px_rgba(169,47,250,0.7)] transition-all duration-500 hover:scale-110 group"
            title="Start"
          >
            <Play className="w-10 h-10 fill-white group-hover:scale-110 transition-transform" />
          </Button>
        </motion.div>
      )}

      {/* ── Word stack — all visible words render simultaneously ── */}
      {hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <AnimatePresence>
            {visibleWords.map(({ id, text }) => {
              const isJesus = text === "JESUS.";

              return (
                <motion.span
                  key={id}
                  initial={
                    isJesus
                      ? { opacity: 1, scale: 2, transformOrigin: "50% 0%" }
                      : { opacity: 1 }
                  }
                  animate={
                    isJesus
                      ? { opacity: 1, scale: 1, transformOrigin: "50% 0%" }
                      : { opacity: 1 }
                  }
                  exit={
                    isJesus
                      ? { opacity: 0, transition: { duration: 0.8 } }
                      : { opacity: 0, transition: { duration: BOOM_RESONANCE / 1000 } }
                  }
                  transition={
                    isJesus
                      ? { scale: { duration: 3, ease: [1, 0.024, 1, 1.054] } }
                      : { duration: 0 }
                  }
                  className={`
                    absolute font-bold text-center pointer-events-none
                    ${isJesus
                      ? "text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-white tracking-widest drop-shadow-[0_0_80px_rgba(255,255,255,1)] [text-shadow:0_0_40px_rgba(255,255,255,0.9),0_0_80px_rgba(255,255,255,0.7),0_0_120px_rgba(255,255,255,0.5),0_0_200px_rgba(169,47,250,0.4)]"
                      : text.includes("?")
                      ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl bg-gradient-to-r from-[#A92FFA] to-[#F28C28] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(169,47,250,0.6)]"
                      : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white/90"
                    }
                  `}
                >
                  {text}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Height spacer so layout doesn't collapse */}
      {hasStarted && <div className="h-48 sm:h-56 md:h-64" />}

      {/* ── Final: WE'VE BEEN WAITING / JUST FOR YOU ── */}
      <AnimatePresence>
        {showFinal && (
          <motion.div
            className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 md:gap-6 max-w-6xl"
            animate={{ opacity: fadeOutFinal ? 0 : 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          >
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6">
              {FINAL_WORDS.slice(0, 3).map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: index * 0.5 }}
                  onAnimationStart={() => {
                    setTimeout(() => {
                      if (boomRef.current) playAudioFull(boomRef.current, 0.4);
                    }, 750);
                  }}
                  className="inline-block font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-[#A92FFA] drop-shadow-[0_0_40px_rgba(169,47,250,0.8)]"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6">
              {FINAL_WORDS.slice(3).map((word, idx) => {
                const globalIndex = idx + 3;
                return (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: globalIndex * 0.5 }}
                    onAnimationStart={() => {
                      setTimeout(() => {
                        if (boomRef.current) {
                          const vol = globalIndex === FINAL_WORDS.length - 1 ? 0.3 : 0.4;
                          playAudioFull(boomRef.current, vol);
                        }
                      }, 750);
                    }}
                    className="inline-block font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-[#F28C28] drop-shadow-[0_0_40px_rgba(169,47,250,0.8)]"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
