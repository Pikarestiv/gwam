"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track("pageview", pathname);
  }, [pathname]);

  return null;
}
