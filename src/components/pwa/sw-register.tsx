"use client";

import { useEffect } from "react";

/** Registers SW only in production builds — never caches private chat. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal
    });
  }, []);
  return null;
}
