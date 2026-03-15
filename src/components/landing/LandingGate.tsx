"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordShuffleHero from "@/components/WordShuffleHero";
import { ArrowRight } from "lucide-react";

type Phase = "shuffle" | "black" | "mission";

interface LandingGateProps {
  onComplete: () => void;
}

export default function LandingGate({ onComplete }: LandingGateProps) {
  const [phase, setPhase] = useState<Phase>("shuffle");

  useEffect(() => {
    const handleShuffleComplete = () => {
      setTimeout(() => setPhase("black"), 700);
      setTimeout(() => setPhase("mission"), 2500);
    };
    window.addEventListener("wordShuffleComplete", handleShuffleComplete);
    return () => window.removeEventListener("wordShuffleComplete", handleShuffleComplete);
  }, []);

  const handleCommit = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ucon-committed", "true");
      localStorage.setItem("hero-animation-seen", "true");
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
      <AnimatePresence>
        {phase === "shuffle" && (
          <motion.div
            key="shuffle"
            className="fixed inset-0 z-10 flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          >
            <WordShuffleHero />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase === "mission" && (
          <motion.div
            key="mission"
            className="relative z-20 min-h-screen w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          >
            <MissionContent onCommit={handleCommit} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ALL_OF_US: string[] = [
  "The addict",
  "The one who loves them",
  "The incarcerated",
  "The ones who put them there",
  "The homeless",
  "The housed who feel just as lost",
  "The divorced",
  "The widowed",
  "The ones barely holding on",
  "The parent who lost a child",
  "The child who lost a parent",
  "The kid aging out of the system",
  "The teenager drowning and smiling at the same time",
  "The teacher",
  "The coach",
  "The counselor",
  "The one who pours out every day with no one pouring back in",
  "The police officer who carries things home",
  "The judge",
  "The prosecutor",
  "The public defender",
  "The veteran",
  "The first responder",
  "The one who came back different",
  "The CEO",
  "The executive",
  "The high achiever who still feels empty",
  "The unemployed",
  "The underemployed",
  "The one too ashamed to ask for help",
  "The church hurt",
  "The ones wounded by His people",
  "The lifelong Christian with more questions than answers",
  "The atheist",
  "The agnostic",
  "The spiritually curious",
  "The one in recovery",
  "The one who relapsed",
  "The one who hasn't admitted it yet",
  "The mentally ill told to just be stronger",
  "The anxious",
  "The depressed",
  "The one who performs okay so well nobody knows",
  "The abuse survivor",
  "The formerly incarcerated",
  "The prodigal",
  "The one who ran",
  "The one who is tired of running",
  "The one who hates themselves",
  "The one loved by everyone and completely alone",
  "The angry ones",
  "The numb ones",
  "The ones who have nothing left",
  "The ones forgiving people who never said sorry",
  "The ones trying to forgive themselves",
];

const GRADIENT_PO = {
  background: "linear-gradient(135deg, #A92FFA 0%, #F28C28 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const GRADIENT_OP = {
  background: "linear-gradient(135deg, #F28C28 0%, #A92FFA 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

function MissionContent({ onCommit }: { onCommit: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white relative">

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
        <img
          src="/ucon-logo.png"
          alt=""
          style={{ width: "min(72vw, 580px)", opacity: 0.045, filter: "grayscale(100%) brightness(2)", userSelect: "none" } as React.CSSProperties}
        />
      </div>

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{ background: "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(169,47,250,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 85% 100%, rgba(242,140,40,0.06) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 space-y-20">

        <Reveal delay={0}>
          <div className="space-y-5 text-center">
            <img src="/ucon-logo.png" alt="UCon Ministries" className="w-28 md:w-36 mx-auto" style={{ filter: "drop-shadow(0 0 28px rgba(169,47,250,0.55))" }} />
            <h1 className="font-black tracking-tighter leading-none" style={{ fontSize: "clamp(3rem, 11vw, 6.5rem)", ...GRADIENT_PO }}>
              UCON MINISTRIES
            </h1>
            <p className="text-2xl md:text-3xl font-light italic text-gray-400">Where your past becomes your purpose.</p>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="space-y-5">
            <h2 className="text-4xl md:text-5xl font-black" style={GRADIENT_OP}>Nothing is wasted.</h2>
            <div className="space-y-4 text-lg md:text-xl leading-relaxed text-gray-300">
              <p>Not the years. Not the wreckage. Not the version of ourselves we had to leave behind. Not the thing we did that we've never said out loud. Not the floor we hit — or the floor below that one.</p>
              <p className="text-2xl font-bold" style={GRADIENT_PO}>Not one bit of it.</p>
            </div>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="space-y-5">
            <h2 className="text-4xl md:text-5xl font-black" style={GRADIENT_OP}>We don't have to look broken to be broken.</h2>
            <div className="space-y-4 text-lg md:text-xl leading-relaxed text-gray-300">
              <p>Some of us have a mortgage, a title, a reputation — and cry in our car before we walk inside.</p>
              <p>Some of us are homeless. Some of us are one paycheck from it.</p>
              <p>Some of us are cops who've seen too much. Judges carrying the weight of every decision. Teachers holding kids together while quietly falling apart themselves.</p>
              <p>Some of us just signed divorce papers. Some of us are still in the marriage and lonelier than we've ever been.</p>
              <p>Some of us are the strong one. The helper. The one everyone calls. And we are so tired.</p>
              <p>Some of us love God and lost Him somewhere in the pain. Some of us never believed and built our own truth from scratch — and it got us pretty far. Until it didn't.</p>
              <p>Some of us are sitting in a pew every Sunday performing fine.</p>
              <p>Some of us are kids who needed a different kind of adult and never got one. Some of us are that adult now, wondering if it's too late to become who we were supposed to be.</p>
              <p>Some of us are angry. Some of us are happy and hurt at the same time and don't know how to explain that to anyone.</p>
              <p className="text-xl font-bold" style={GRADIENT_PO}>None of that disqualifies us. All of it belongs here.</p>
            </div>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="space-y-10">
            <h2 className="text-4xl md:text-5xl font-black" style={GRADIENT_OP}>This is for all of us.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
              {ALL_OF_US.map((item, i) => (
                <p key={i} className="text-base md:text-lg leading-snug font-medium" style={{ color: i % 2 === 0 ? "#A92FFA" : "#F28C28" }}>
                  {item}
                </p>
              ))}
            </div>
            <p className="text-xl md:text-2xl font-bold pt-2" style={GRADIENT_PO}>If any part of this is you — you are exactly who we were built for.</p>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="space-y-5">
            <h2 className="text-4xl md:text-5xl font-black" style={GRADIENT_OP}>UCon was born in the dark.</h2>
            <div className="space-y-4 text-lg md:text-xl leading-relaxed text-gray-300">
              <p>Not in a boardroom. Not in a theology class. In the specific silence that comes when the noise finally stops and it's just us and the truth — and we can't look away anymore.</p>
              <p>Our founder didn't study suffering. They <span className="italic text-white">lived</span> it. The justice system. Addiction. Homelessness. The long, slow walk back. And what they found on that walk became the only thing worth building.</p>
              <p>One conviction. One operating principle. One word.</p>
              <p className="text-4xl md:text-5xl font-black" style={GRADIENT_PO}>Unconditional.</p>
              <p>No performance required. No cleaned-up version of ourselves needed first. No minimum pain level that qualifies us.</p>
              <p className="font-semibold" style={GRADIENT_OP}>We don't have to be at rock bottom to need a lifeline.</p>
            </div>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="space-y-5">
            <h2 className="text-4xl md:text-5xl font-black" style={GRADIENT_PO}>UCon. United Convicts.</h2>
            <div className="space-y-4 text-lg md:text-xl leading-relaxed text-gray-300">
              <p>Two kinds of convicted — and if we've lived in that tension, we already know.</p>
              <p>Convicted by what we've done. The choices. The slow drift away from who we meant to be. The things we did and the things we didn't and the people caught in the middle of both. That weight is real. We are not rushing past it.</p>
              <p>And convicted by a grace that makes no logical sense. A God who looked at the whole story — the complete, unedited file — and said <span className="italic text-white">still. You. I came for you specifically.</span></p>
              <p>That has always been His thing. The ones everybody else stepped over on their way somewhere more important.</p>
              <p>The guilt and the grace living in the same body at the same time.</p>
              <p className="text-xl font-bold" style={GRADIENT_OP}>That is not a contradiction. That is the beginning. That is UCon.</p>
            </div>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="space-y-5">
            <h2 className="text-4xl md:text-5xl font-black" style={GRADIENT_PO}>This is not a church for people who have it together.</h2>
            <div className="space-y-4 text-lg md:text-xl leading-relaxed text-gray-300">
              <p className="text-xl text-gray-400 italic">It is a community for people honest enough to admit they don't.</p>
              <p>The successful and the struggling in the same room. The faithful and the furious. The ones who've been incarcerated and the ones who put them there. The parent who lost their child to addiction and the child who was the addiction. The one who left the church angry and the one who never found a reason to walk in. The person in the front row of Sunday service and the person who hasn't stepped inside a church in fifteen years and isn't sure they ever will again.</p>
              <p className="font-semibold" style={GRADIENT_OP}>All of us.</p>
              <p>We don't preach around the hard things hoping nobody notices. We don't hand out clichés as substitutes for real healing. We don't need anyone certain, sorted, or smiling at the door.</p>
              <p className="font-semibold" style={GRADIENT_PO}>We name the hard things. Directly. Out loud.</p>
              <p>Because in a world drowning in shame, honesty is the only life raft that actually holds weight.</p>
            </div>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="space-y-10">
            <h2 className="text-4xl md:text-5xl font-black" style={GRADIENT_OP}>Three Pillars. Because all of us deserve the whole truth.</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold" style={GRADIENT_PO}>Clinical Psychology</h3>
                <p className="text-lg md:text-xl leading-relaxed text-gray-300">Our pain has a structure. Trauma lives in the body and the mind and it needs to be understood — not spiritualized away, not prayed over without being looked at. We take the science seriously because God created the human mind and learning how it breaks and how it heals is not a threat to faith. It is an act of it.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold" style={GRADIENT_OP}>Systematic Theology</h3>
                <p className="text-lg md:text-xl leading-relaxed text-gray-300">Not the comfortable version. Not the one designed to fill seats and ask nothing of us. The real God — the whole Word, wrestled with honestly, allowed to say what it actually says. Because the people who need God the most deserve the real one. Not watered down. Not a God who only ever affirms us. The whole truth.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold" style={GRADIENT_PO}>Lived Experience</h3>
                <p className="text-lg md:text-xl leading-relaxed text-gray-300">We are not speaking from theory. We are speaking from scars. There is a difference you can feel in the first five minutes. We don't want help from someone who read about our pain in a textbook. We want someone who has been on the floor. That is us.</p>
              </div>
            </div>
            <p className="text-lg md:text-xl leading-relaxed text-gray-300">When we bring those three together — the clinical, the theological, the lived — we get something the world doesn't have enough of. Truth that heals. A community that can hold us intellectually, spiritually, and humanly all at once.</p>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="space-y-5">
            <h2 className="text-4xl md:text-5xl font-black" style={GRADIENT_OP}>We've watched it work.</h2>
            <div className="space-y-4 text-lg md:text-xl leading-relaxed text-gray-300">
              <p>We have sat across from people who were completely gone — lost to themselves, lost to everyone who loved them — and watched them come back. One percent at a time. Slowly. Quietly. From the inside out. The way real transformation always happens.</p>
              <p className="font-semibold" style={GRADIENT_PO}>Not because of us.</p>
              <p>Because of what happens when someone finally feels <span className="italic text-white">seen.</span> When everything they carried — every scar, every mistake, every chapter they wished they could delete — gets handed a purpose.</p>
              <p>When the clinical, the theological, and the lived all look at a person at the same time and say — <span className="italic text-white">you are not too far gone. You are not a lost cause. You are exactly who this was built for.</span></p>
              <p className="text-xl font-bold" style={GRADIENT_OP}>Our past is not a prison. It is a pulpit.</p>
              <p>And the people who need us most are waiting on the other side of the story we haven't told yet.</p>
            </div>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="space-y-5">
            <h2 className="text-4xl md:text-5xl font-black" style={GRADIENT_PO}>None of us are too far gone.</h2>
            <div className="space-y-4 text-lg md:text-xl leading-relaxed text-gray-300">
              <p>Not the addict. Not the executive. Not the exhausted parent or the kid who aged out of the system with nowhere to go. Not the judge who sentences people and carries it home. Not the officer who's seen things that don't leave. Not the one who hasn't believed in years and misses it more than they can say. Not the one who has done things they cannot forgive themselves for.</p>
              <p className="text-2xl font-bold" style={GRADIENT_OP}>Not us.</p>
              <p>We are not saviors. We are United Convicts. Broken people walking with broken people. We don't show up with a polished program. We show up with presence. With truth. With the stubborn, relentless refusal to give up on each other — especially when we've given up on ourselves.</p>
              <p>Because when we are loved with no conditions and no version of ourselves required first — we slowly learn to love ourselves. And when we learn to love ourselves, we find God. And when we find God, we find out why we were here all along.</p>
              <p>Transformation isn't a moment. It's a journey. Slow and real and sometimes ugly. Fueled by the Gospel of Jesus Christ — not just on Sundays, not just in buildings, but in streets and living rooms and phone calls at midnight and one honest conversation at a time.</p>
            </div>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.05}>
          <div className="text-center space-y-6 py-6">
            <p className="text-sm font-bold tracking-[0.3em] uppercase" style={GRADIENT_PO}>Three Pillars. One Mission. Whole People.</p>
            <p className="text-2xl font-bold" style={GRADIENT_OP}>We are broken made whole.</p>
            <p className="font-black tracking-tight" style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)", ...GRADIENT_PO }}>
              WE ARE UNITED CONVICTS.
            </p>
            <p className="text-xl text-gray-400 italic">We are walking with each other — all the way home.</p>
            <p className="text-lg font-bold italic" style={GRADIENT_OP}>UCon Ministries — Where your past becomes your purpose.</p>
          </div>
        </Reveal>

        <Divider />

        <Reveal delay={0.1}>
          <div className="text-center space-y-6 pb-10">
            <motion.button
              onClick={onCommit}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="relative inline-flex items-center gap-4 px-12 py-6 rounded-full text-white font-black text-xl md:text-2xl tracking-wide overflow-hidden group cursor-pointer"
              style={{ background: "linear-gradient(135deg, #A92FFA 0%, #C45AFF 45%, #F28C28 100%)", boxShadow: "0 0 60px rgba(169,47,250,0.45), 0 0 120px rgba(169,47,250,0.18), inset 0 1px 0 rgba(255,255,255,0.12)" }}
            >
              <span aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.14) 50%, transparent 62%)", backgroundSize: "200% 100%", animation: "ccShimmer 1.6s infinite" }} />
              <span className="relative z-10">CONVICT COMMIT</span>
              <ArrowRight className="relative z-10 w-7 h-7" />
            </motion.button>
            <p className="text-sm text-gray-600 italic">This is where you stop spectating and start walking.</p>
          </div>
        </Reveal>

      </div>

      <style>{`
        @keyframes ccShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}

function Divider() {
  return <hr className="border-gray-800" />;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
