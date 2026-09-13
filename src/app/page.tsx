import Link from "next/link";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroNetworkCanvas } from "@/components/landing/hero-network-canvas";
import { InteractiveChatDemo } from "@/components/landing/interactive-chat-demo";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { HeroProductOrbit } from "@/components/landing/hero-product-orbit";

export const metadata = {
  title: "ManoYug — Student wellbeing, made easier to reach",
  description: "A confidential wellbeing companion for students and a privacy-first support workspace for campuses.",
};

const STUDENT_STEPS = [
  ["01", "Join your campus", "Use the code shared by your institution."],
  ["02", "Start where you are", "Talk, check in, or choose a short grounding exercise."],
  ["03", "Find the next step", "Reach verified campus and emergency support when you need it."],
];

const INSTITUTION_STEPS = [
  ["01", "Request a conversation", "Tell us about your campus and wellbeing goals."],
  ["02", "Set up your workspace", "Provision student access and verified support contacts."],
  ["03", "See the whole picture", "Use aggregate trends to plan thoughtful support."],
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FBFCFA] text-[#10231E]">
      <LandingNavbar />
      <main>
        <section className="relative isolate overflow-hidden border-b border-[#DCE6E0] px-6 pb-16 pt-32 sm:pt-40 lg:min-h-[780px] lg:pb-24">
          <HeroNetworkCanvas />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(216,235,224,0.82),transparent_30%),radial-gradient(circle_at_84%_80%,rgba(238,222,183,0.34),transparent_26%),linear-gradient(180deg,#fbfcfa_0%,#f4f8f3_100%)]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#FBFCFA] to-transparent" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.04fr_.96fr] lg:gap-8">
            <div className="max-w-2xl">
              <div className="hero-stagger-1 mb-7 inline-flex items-center gap-2 rounded-full border border-[#BFD3C6] bg-white/75 px-3.5 py-1.5 text-xs font-semibold text-[#265B46] shadow-sm backdrop-blur"><span className="h-2 w-2 rounded-full bg-[#D58E2A]" />A calmer first step for campus wellbeing</div>
              <h1 className="hero-stagger-2 max-w-xl font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] text-[#10231E] sm:text-6xl lg:text-7xl">Support that feels easier to reach.</h1>
              <p className="hero-stagger-3 mt-7 max-w-xl text-base leading-7 text-[#557066] sm:text-lg">ManoYug gives students a confidential place to pause, reflect, and find the right next step—while helping institutions strengthen support without compromising personal conversations.</p>
              <div className="hero-stagger-4 mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
                <Link href="/register/student" className="landing-path-card group"><span className="landing-path-icon bg-[#E7F1EA] text-[#265B46]">↗</span><span><span className="block text-sm font-bold text-[#10231E]">I&apos;m a student</span><span className="mt-1 block text-xs leading-5 text-[#557066]">Create your confidential student account</span></span></Link>
                <Link href="/register/institution" className="landing-path-card landing-path-card-campus group"><span className="landing-path-icon bg-white/10 text-[#F4D5A0]">↗</span><span><span className="block text-sm font-bold text-white">I represent a campus</span><span className="mt-1 block text-xs leading-5 text-[#E0EEE6]">Explore the institution workspace</span></span></Link>
              </div>
              <div className="hero-stagger-5 mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#557066]"><Link href="/login/student" className="font-semibold text-[#265B46] hover:text-[#10231E] hover:underline">Student sign in</Link><Link href="/login/institution" className="font-semibold text-[#265B46] hover:text-[#10231E] hover:underline">Institution sign in</Link><Link href="/get-started" className="hover:text-[#10231E] hover:underline">Not sure which path?</Link></div>
            </div>
            <div className="hero-stagger-3 relative mx-auto w-full max-w-[540px] lg:justify-self-end"><HeroProductOrbit /></div>
          </div>
        </section>

        <section id="paths" className="border-b border-[#DCE6E0] bg-white px-6 py-24 sm:py-28"><div className="mx-auto max-w-7xl"><ScrollReveal><div className="max-w-2xl"><p className="eyebrow">Start with the path that is yours</p><h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.04em] text-[#10231E] sm:text-5xl">One platform. Two clear ways in.</h2><p className="mt-5 text-base leading-7 text-[#557066]">No one should have to decode a platform before they can use it. Choose your role once, then see the actions that matter to you.</p></div></ScrollReveal><div className="mt-12 grid gap-5 lg:grid-cols-2"><AudienceCard role="For students" title="A private space to reset, reflect, and move forward." body="Start a conversation, track how you&apos;re doing, try grounding exercises, or find verified support on your campus." registerHref="/register/student" loginHref="/login/student" action="Create student account" dark={false} tags={["Companion", "Check-ins", "Resources"]} /><AudienceCard role="For institutions" title="Build a more responsive support system across campus." body="Manage eligible students and support resources, and use protected aggregate insights to plan better care—not inspect private conversations." registerHref="/register/institution" loginHref="/login/institution" action="Request campus access" dark tags={["Roster", "Support directory", "Aggregate reports"]} /></div></div></section>

        <section id="how-it-works" className="border-b border-[#DCE6E0] bg-[#FBFCFA] px-6 py-24 sm:py-28"><div className="mx-auto max-w-7xl"><div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end"><ScrollReveal><div><p className="eyebrow">A simple onboarding story</p><h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.04em] text-[#10231E] sm:text-5xl">Built to get people moving, not stuck.</h2></div></ScrollReveal><p className="max-w-xl text-base leading-7 text-[#557066]">The first screen should answer “what do I do now?” Each workspace then keeps next actions visible and the rest discoverable.</p></div><div className="mt-14 grid gap-8 lg:grid-cols-2"><FlowCard label="Student journey" steps={STUDENT_STEPS} dark={false} /><FlowCard label="Institution journey" steps={INSTITUTION_STEPS} dark /></div></div></section>

        <section id="companion" className="border-b border-[#DCE6E0] bg-white px-6 py-24 sm:py-28"><div className="mx-auto max-w-7xl"><ScrollReveal><div className="mx-auto max-w-2xl text-center"><p className="eyebrow">The companion experience</p><h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.04em] text-[#10231E] sm:text-5xl">Thoughtful support, without a crowded interface.</h2><p className="mt-5 text-base leading-7 text-[#557066]">Conversation is the main action. Check-ins, exercises, history, and human support remain easy to reach when they are useful.</p></div></ScrollReveal><div className="mt-12"><InteractiveChatDemo /></div></div></section>

        <section id="trust" className="border-b border-[#DCE6E0] bg-[#102D24] px-6 py-24 text-white sm:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.84fr_1.16fr]"><ScrollReveal><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#BFD8CA]">Privacy & safety, made legible</p><h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">Trust should be clear before someone shares anything.</h2><p className="mt-5 max-w-md text-base leading-7 text-[#C5D8CE]">Explain boundaries in plain language: what the companion can do, when urgent resources appear, and what institutions can—and cannot—see.</p><div className="mt-8 flex gap-3"><Link href="/privacy" className="landing-button-light">Read privacy approach <span>→</span></Link><Link href="/safety" className="landing-secondary-link-light">Safety information</Link></div></div></ScrollReveal><div className="grid gap-4 sm:grid-cols-3"><TrustCard number="01" title="Private by default" body="Student conversations and personal support remain separate from campus reporting." /><TrustCard number="02" title="Clear escalation" body="Urgent situations point people to emergency and verified human-support options." /><TrustCard number="03" title="Useful, not intrusive" body="Institutional views focus on patterns that can inform better campus support." /></div></div></section>

        <section id="faq" className="border-b border-[#DCE6E0] bg-[#FBFCFA] px-6 py-24 sm:py-28"><div className="mx-auto max-w-5xl"><ScrollReveal><div className="text-center"><p className="eyebrow">Questions, answered early</p><h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.04em] text-[#10231E] sm:text-5xl">Know what to expect.</h2></div></ScrollReveal><div className="mt-12"><FaqAccordion /></div></div></section>
        <section className="bg-white px-6 py-20 sm:py-24"><div className="mx-auto flex max-w-5xl flex-col items-center rounded-[2rem] bg-[#E7F1EA] px-6 py-14 text-center sm:px-12"><p className="eyebrow">Take the next clear step</p><h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-[-0.04em] text-[#10231E] sm:text-5xl">A better campus support experience can start today.</h2><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/register/student" className="landing-button">I&apos;m a student <span>→</span></Link><Link href="/register/institution" className="landing-button-outline">I&apos;m from an institution <span>→</span></Link></div></div></section>
      </main>
      <Footer />
    </div>
  );
}

function AudienceCard({ role, title, body, registerHref, loginHref, action, dark, tags }: { role: string; title: string; body: string; registerHref: string; loginHref: string; action: string; dark: boolean; tags: string[] }) {
  return <article className={`group rounded-[1.75rem] border p-7 transition duration-300 hover:-translate-y-1 sm:p-9 ${dark ? "border-[#274C3D] bg-[#173E31] text-white hover:shadow-[0_20px_50px_rgba(23,62,49,0.25)]" : "border-[#D7E5DB] bg-[#F5FAF6] text-[#10231E] hover:shadow-[0_20px_50px_rgba(33,76,57,0.10)]"}`}><p className={`text-xs font-bold uppercase tracking-[0.16em] ${dark ? "text-[#BFD8CA]" : "text-[#3A775C]"}`}>{role}</p><h3 className="mt-10 font-display text-3xl font-extrabold tracking-[-0.04em]">{title}</h3><p className={`mt-4 max-w-lg text-sm leading-6 ${dark ? "text-[#C5D8CE]" : "text-[#557066]"}`}>{body}</p><div className={`mt-7 flex flex-wrap gap-2 text-xs font-semibold ${dark ? "text-[#D8E8DE]" : "text-[#315C49]"}`}>{tags.map((tag) => <span key={tag} className={`rounded-full px-3 py-1.5 ${dark ? "bg-white/10" : "bg-white"}`}>{tag}</span>)}</div><div className="mt-8 flex flex-wrap gap-3"><Link href={registerHref} className={dark ? "landing-button-light" : "landing-button"}>{action} <span>→</span></Link><Link href={loginHref} className={dark ? "landing-secondary-link-light" : "landing-secondary-link"}>Sign in</Link></div></article>;
}

function FlowCard({ label, steps, dark }: { label: string; steps: string[][]; dark: boolean }) {
  return <article className={`rounded-[1.5rem] border p-7 sm:p-8 ${dark ? "border-[#355B4C] bg-[#173E31] text-white" : "border-[#D7E5DB] bg-white text-[#10231E]"}`}><p className={`text-xs font-bold uppercase tracking-[0.16em] ${dark ? "text-[#BFD8CA]" : "text-[#3A775C]"}`}>{label}</p><ol className="mt-8 space-y-6">{steps.map(([number, title, body]) => <li className={`grid grid-cols-[44px_1fr] gap-4 border-t pt-6 first:border-t-0 first:pt-0 ${dark ? "border-white/10" : "border-[#E3ECE6]"}`} key={number}><span className={`font-mono text-xs font-bold ${dark ? "text-[#F4D5A0]" : "text-[#B5741B]"}`}>{number}</span><div><h3 className="text-base font-bold">{title}</h3><p className={`mt-1.5 text-sm leading-6 ${dark ? "text-[#C5D8CE]" : "text-[#557066]"}`}>{body}</p></div></li>)}</ol></article>;
}

function TrustCard({ number, title, body }: { number: string; title: string; body: string }) { return <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-6"><span className="font-mono text-xs font-bold text-[#F4D5A0]">{number}</span><h3 className="mt-9 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#C5D8CE]">{body}</p></div>; }

function Footer() { const columns = [["Get started", [["Student account", "/register/student"], ["Student sign in", "/login/student"], ["Institution access", "/register/institution"], ["Institution sign in", "/login/institution"], ["Choose a path", "/get-started"]]], ["Explore", [["How it works", "/how-it-works"], ["For institutions", "/institutions"], ["Pricing", "/pricing"], ["About", "/about"], ["Help centre", "/help"], ["Contact", "/contact"]]], ["Trust & policies", [["Safety", "/safety"], ["Privacy", "/privacy"], ["AI disclosure", "/ai-disclosure"], ["Terms", "/terms"], ["Acceptable use", "/acceptable-use"], ["Cookies", "/cookies"]]]] as const; return <footer className="border-t border-[#DCE6E0] bg-[#10231E] px-6 py-14 text-[#C5D8CE]"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.35fr_1fr_1fr_1fr]"><div><Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-white"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4D5A0] text-sm text-[#173E31]">M</span>ManoYug</Link><p className="mt-4 max-w-xs text-sm leading-6">Student wellbeing support that is easier to understand, access, and build around.</p><p className="mt-5 text-xs">If there is immediate danger, call local emergency services or a crisis helpline.</p></div>{columns.map(([title, links]) => <div key={title}><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">{title}</h2><ul className="mt-4 space-y-2.5 text-sm">{links.map(([label, href]) => <li key={href}><Link href={href} className="transition-colors hover:text-white">{label}</Link></li>)}</ul></div>)}</div><div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row"><span>© {new Date().getFullYear()} ManoYug AI. All rights reserved.</span><span>ManoYug AI does not replace professional or emergency care.</span></div></footer>; }
