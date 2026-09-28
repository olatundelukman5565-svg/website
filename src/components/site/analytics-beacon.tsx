"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track", { method: "POST", keepalive: true }).catch(() => {});
  }, [pathname]);

  return null;
}
