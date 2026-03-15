"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";

const LOGO =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png";

interface TimeLeft { hours: number; minutes: number; seconds: number; }

function getTimeLeft(end: string): TimeLeft | null {
  const diff = new Date(end).getTime() - Date.now();
  if (!end || diff <= 0) return null;
  return {
    hours:   Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function MaintenancePage() {
  const [estimatedEnd, setEstimatedEnd]   = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [timeLeft, setTimeLeft]           = useState<TimeLeft | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        setEstimatedEnd(d.maintenance_estimated_end ?? "");
        setCustomMessage(d.maintenance_message ?? "");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!estimatedEnd) return;
    const tick = () => setTimeLeft(getTimeLeft(estimatedEnd));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [estimatedEnd]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 60% 0%, rgba(169,47,250,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 100%, rgba(242,140,40,0.15) 0%, transparent 55%), #0d0d14",
      }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, #A92FFA 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F28C28 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        <div className="relative w-24 h-24 drop-shadow-[0_0_40px_rgba(169,47,250,0.5)]">
          <Image src={LOGO} alt="Ucon Ministries Logo" fill className="object-contain" priority />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="font-semibold tracking-widest text-xs uppercase" style={{ color: "#A92FFA" }}>
            Ucon Ministries
          </p>
          <div className="w-24 h-px" style={{ background: "linear-gradient(90deg, #A92FFA, #F28C28)" }} />
        </div>

        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight"
          style={{
            background: "linear-gradient(135deg, #ffffff 40%, #F28C28 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          We&apos;ll be right back.
        </h1>

        <div
          className="rounded-2xl p-6 text-left space-y-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(169,47,250,0.2)" }}
        >
          {customMessage ? (
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
              {customMessage}
            </p>
          ) : (
            <>
              <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
                Hey. We see you showing up, and that means something. We&apos;re in
                the middle of some necessary work on our end — the kind that makes
                everything stronger on the other side. We haven&apos;t gone anywhere.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                Sit tight. Come back soon. And if you need us right now — we mean
                it — reach out. We&apos;re still here.
              </p>
            </>
          )}
        </div>

        {timeLeft && (
          <div className="flex items-center gap-4">
            {[
              { label: "HRS", val: timeLeft.hours },
              { label: "MIN", val: timeLeft.minutes },
              { label: "SEC", val: timeLeft.seconds },
            ].map(({ label, val }, i) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold font-mono"
                    style={{ background: "rgba(169,47,250,0.12)", border: "1px solid rgba(169,47,250,0.3)", color: "#A92FFA" }}
                  >
                    {pad(val)}
                  </div>
                  <span className="text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <span className="text-2xl font-bold -mt-5" style={{ color: "rgba(255,255,255,0.25)" }}>:</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link
            href="/contact"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #A92FFA, #7c1fd4)", color: "#fff" }}
          >
            <Mail className="w-4 h-4" />
            Contact Us
          </Link>
          <a
            href="tel:7206639243"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "rgba(242,140,40,0.12)", border: "1px solid rgba(242,140,40,0.35)", color: "#F28C28" }}
          >
            <Phone className="w-4 h-4" />
            720.663.9243
          </a>
        </div>

        <Link
          href="/staff-login"
          className="text-xs transition-opacity hover:opacity-80"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Staff login →
        </Link>
      </div>
    </div>
  );
}
