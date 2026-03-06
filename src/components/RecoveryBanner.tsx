"use client";

import { useEffect, useState } from "react";
import { X, Phone, AlertTriangle } from "lucide-react";
import Link from "next/link";

const SESSION_KEY = "ucon-recovery-dismissed";

export default function RecoveryBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(SESSION_KEY) === "true") return;

    const check = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (data.recovery_banner_enabled === "true") setVisible(true);
        else setVisible(false);
      } catch {}
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "true");
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-500"
      style={{
        background:
          "linear-gradient(90deg, rgba(15,10,28,0.97) 0%, rgba(25,12,40,0.97) 50%, rgba(15,10,28,0.97) 100%)",
        borderTop: "1px solid rgba(169,47,250,0.35)",
        boxShadow: "0 -8px 40px rgba(169,47,250,0.15), 0 -2px 12px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="h-[2px] w-full"
        style={{ background: "linear-gradient(90deg, #A92FFA, #F28C28, #A92FFA)" }}
      />
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-start sm:items-center gap-3">
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 sm:mt-0"
          style={{ background: "rgba(242,140,40,0.12)", border: "1px solid rgba(242,140,40,0.3)" }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: "#F28C28" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
            <span className="font-semibold mr-1.5" style={{ color: "#F28C28" }}>
              We&apos;re still getting back on our feet.
            </span>
            We&apos;re sorry for the inconvenience — our systems are recovering, and{" "}
            <span className="font-medium" style={{ color: "#A92FFA" }}>
              our transit booking system is still affected.
            </span>{" "}
            If you need help right now, please{" "}
            <Link
              href="/contact"
              className="underline underline-offset-2 transition-opacity hover:opacity-80 font-medium"
              style={{ color: "#F28C28" }}
            >
              reach us through our contact form
            </Link>{" "}
            or call us at{" "}
            <a
              href="tel:7206639243"
              className="font-semibold transition-opacity hover:opacity-80 whitespace-nowrap"
              style={{ color: "#A92FFA" }}
            >
              <Phone className="w-3 h-3 inline mr-0.5 -mt-0.5" />
              720.663.9243
            </a>
            . You matter to us — we haven&apos;t forgotten you.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss recovery notice"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 mt-0.5 sm:mt-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
