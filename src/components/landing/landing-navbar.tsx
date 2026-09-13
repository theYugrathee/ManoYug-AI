"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { href: "#paths", label: "Who it’s for" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/institutions", label: "For institutions" },
  { href: "#trust", label: "Trust & safety" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 18); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-[#DCE6E0] bg-[#FBFCFA]/90 py-3 shadow-[0_6px_24px_rgba(27,64,48,0.06)] backdrop-blur-xl" : "py-5"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="ManoYug home"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173E31] font-display text-base font-bold text-white">M</span><span className="font-display text-lg font-extrabold tracking-[-0.04em] text-[#10231E]">ManoYug</span></Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#48665A] lg:flex" aria-label="Main navigation">{links.map((item) => item.href.startsWith("#") ? <a key={item.href} href={item.href} className="transition-colors hover:text-[#10231E]">{item.label}</a> : <Link key={item.href} href={item.href} className="transition-colors hover:text-[#10231E]">{item.label}</Link>)}</nav>
        <div className="hidden items-center gap-2.5 sm:flex"><Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-[#315C49] transition hover:bg-[#E7F1EA]">Sign in</Link><Link href="/get-started" className="rounded-full bg-[#173E31] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#102D24]">Get started <span aria-hidden="true">→</span></Link></div>
        <div className="flex items-center gap-2 sm:hidden"><Link href="/get-started" className="rounded-full bg-[#173E31] px-3.5 py-2 text-xs font-bold text-white">Start</Link><button type="button" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#CBDCD1] bg-white text-lg text-[#173E31]">{open ? "×" : "☰"}</button></div>
      </div>
      {open ? <div className="mx-4 mt-3 rounded-2xl border border-[#DCE6E0] bg-white p-4 shadow-xl sm:hidden"><nav className="grid gap-1" aria-label="Mobile navigation">{links.map((item) => item.href.startsWith("#") ? <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#315C49] hover:bg-[#F1F6F2]">{item.label}</a> : <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#315C49] hover:bg-[#F1F6F2]">{item.label}</Link>)}<div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#E3ECE6] pt-3"><Link href="/login/student" onClick={() => setOpen(false)} className="rounded-xl border border-[#CBDCD1] px-3 py-2.5 text-center text-xs font-bold text-[#173E31]">Student sign in</Link><Link href="/register/institution" onClick={() => setOpen(false)} className="rounded-xl bg-[#173E31] px-3 py-2.5 text-center text-xs font-bold text-white">Institution access</Link></div></nav></div> : null}
    </header>
  );
}
