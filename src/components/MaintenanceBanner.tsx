"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function MaintenanceBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const check = () =>
      fetch("/api/admin/settings")
        .then(r => r.json())
        .then(d => setActive(d.maintenance_mode === "true"))
        .catch(() => {});
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  if (!active) return null;

  return (
    <div className="w-full px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium"
      style={{ background: "linear-gradient(90deg, rgba(242,140,40,0.15), rgba(242,140,40,0.08), rgba(242,140,40,0.15))", borderBottom: "1px solid rgba(242,140,40,0.35)", color: "#F28C28" }}>
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        Maintenance mode is <strong>active</strong> — the public site is blocked for visitors.{" "}
        <Link href="/admin/settings" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
          Turn it off in Settings
        </Link>
      </span>
    </div>
  );
}
