"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export function RoleSelector() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] px-6 py-16 text-[#0F172A] selection:bg-sky-500/20 selection:text-[#0F172A] relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-100/60 via-cyan-50/40 to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto text-center space-y-10 my-reveal">
        {/* Institutional Logo */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F172A] text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            <span className="font-display">M</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#0F172A] font-display flex items-center gap-2">
            ManoYug
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold font-mono">
              AI
            </span>
          </span>
        </Link>

        {/* Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 text-xs font-semibold text-sky-800 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            Institutional Access Gateway
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] font-display leading-tight">
            How will you use <br />
            <span className="hero-glow-text">ManoYug AI?</span>
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] max-w-lg mx-auto leading-relaxed">
            Select your portal to proceed. Conversations are strictly confidential, tenant-isolated, and encrypted.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl text-left">
          {/* Student Card */}
          <button
            onClick={() => router.push("/register/student")}
            className="glow-card group relative flex flex-col justify-between rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-300 hover:border-sky-500 hover:shadow-xl active:scale-[0.99] cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-3xl border border-sky-100 group-hover:scale-110 transition-transform">
                  🎓
                </div>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Free for Students
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[#0F172A] font-display group-hover:text-sky-600 transition-colors">
                  Campus Student
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  24/7 confidential emotional active listening, 4-7-8 breathing resets, CBT reframing, and instant crisis safety net.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
              <span>Create student profile</span>
              <span aria-hidden="true" className="font-mono transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>

          {/* Institution Card */}
          <button
            onClick={() => router.push("/register/institution")}
            className="glow-card group relative flex flex-col justify-between rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-300 hover:border-emerald-500 hover:shadow-xl active:scale-[0.99] cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl border border-emerald-100 group-hover:scale-110 transition-transform">
                  🏛️
                </div>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  University / College
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[#0F172A] font-display group-hover:text-emerald-600 transition-colors">
                  Higher Ed Institution
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Provision your campus tenant code, track cohort wellbeing telemetry, and satisfy NAAC Criterion 5 compliance.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
              <span>Request campus onboarding</span>
              <span aria-hidden="true" className="font-mono transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>
        </div>

        {/* Already have an account */}
        <p className="text-xs text-[#64748B]">
          Already have an account?{" "}
          <Link
            href="/login/student"
            className="font-bold text-[#0F172A] hover:text-sky-600 underline transition-colors"
          >
            Sign in to your portal here →
          </Link>
        </p>
      </div>
    </div>
  );
}
