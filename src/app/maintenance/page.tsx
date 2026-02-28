"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LOGO = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png";

interface TimeLeft { hours: number; minutes: number; seconds: number; }

function getTimeLeft(end: string): TimeLeft | null {
  const diff = new Date(end).getTime() - Date.now();
  if (!end || diff <= 0) return null;
  return {
    hours:   Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}
function pad(n: number) { return String(n).padStart(2, "0"); }

export default function MaintenancePage() {
  const [estimatedEnd, setEstimatedEnd] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

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
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [estimatedEnd]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 60% 0%, rgba(169,47,250,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 100%, rgba(242,140,40,0.15) 0%, transparent 55%), #0d0d14",
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-30"
        style={{ background: "radial-gradient(circle, #A92FFA 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full blur-[100px] opacity-20"
        style={{ background: "radial-gradient(circle, #F28C28 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        <div className="relative w-28 h-28 drop-shadow-[0_0_40px_rgba(169,47,250,0.5)]">
          <Image src={LOGO} alt="Ucon Ministries Logo" fill className="object-contain" priority />
        </div>

        <div>
          <p className="text-[#A92FFA] font-semibold tracking-widest text-xs uppercase mb-2">Ucon Ministries</p>
          <div className="w-24 h-px mx-auto" style={{ background: "linear-gradient(90deg, #A92FFA, #F28C28)" }} />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold leading-tight"
          style={{ background: "linear-gradient(135deg, #ffffff 40%, #F28C28 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          We&apos;ll be right back.
        </h1>

        <div className="space-y-4 text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
          {customMessage ? (
            <p>{customMessage}</p>
          ) : (
            <>
              <p>Sometimes the most sacred thing you can do is stop. Breathe. Let something be tended to.</p>
              <p>We&apos;re behind the scenes right now — quiet hands doing quiet work — so that when you come back, this place is a little more ready to hold you.</p>
              <p className="text-gray-400 text-sm">Your story isn&apos;t on pause. We&apos;re just making space for the next chapter to open well.</p>
            </>
          )}
        </div>

        {timeLeft ? (
          <div className="w-full">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Estimated time remaining</p>
            <div className="flex items-center justify-center gap-4">
              {[{ label: "HRS", value: timeLeft.hours }, { label: "MIN", value: timeLeft.minutes }, { label: "SEC", value: timeLeft.seconds }]
                .map(({ label, value }, i) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold text-white"
                        style={{ background: "linear-gradient(135deg, rgba(169,47,250,0.25), rgba(242,140,40,0.15))", border: "1px solid rgba(169,47,250,0.3)" }}>
                        {pad(value)}
                      </div>
                      <p className="text-[10px] text-gray-500 tracking-widest mt-2">{label}</p>
                    </div>
                    {i < 2 && <span className="text-2xl font-bold text-[#A92FFA] mb-4 opacity-60">:</span>}
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="px-5 py-3 rounded-full text-sm text-gray-400"
            style={{ background: "rgba(169,47,250,0.08)", border: "1px solid rgba(169,47,250,0.2)" }}>
            ✦ Duration unknown — we&apos;re working as fast as love allows
          </div>
        )}

        <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(169,47,250,0.4), rgba(242,140,40,0.4), transparent)" }} />
        <p className="text-xs text-gray-600">United Convict Ministries Inc. &nbsp;·&nbsp; Where Your Past Becomes Your Purpose</p>
      </div>
    </div>
  );
}
