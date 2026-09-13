"use client";

import React from "react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded bg-neutral-900 px-3 py-1.5 font-semibold text-white print:hidden hover:bg-neutral-800 text-xs shadow-sm transition-colors"
    >
      Print / Save as PDF
    </button>
  );
}
