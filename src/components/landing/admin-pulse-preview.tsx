"use client";

import { useState } from "react";

export function AdminPulsePreview() {
  const [activeTab, setActiveTab] = useState<"themes" | "triage" | "health">("themes");

  return (
    <div className="w-full rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 space-y-6 shadow-sm text-left">
      {/* Top Console Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#64748B]">
              Institutional Telemetry · Partition: UNIV-DELHI
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mt-1 font-display">
            Campus Wellbeing Climate Radar
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
          <button
            onClick={() => setActiveTab("themes")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "themes"
                ? "bg-[#0F172A] text-white font-semibold shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Distress Categories
          </button>
          <button
            onClick={() => setActiveTab("triage")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "triage"
                ? "bg-[#0F172A] text-white font-semibold shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Safety Triage
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "health"
                ? "bg-[#0F172A] text-white font-semibold shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Capacity & Quotas
          </button>
        </div>
      </div>

      {/* Tab 1: Themes */}
      {activeTab === "themes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Primary Cohort Stress Drivers (Rolling 30 Days)</span>
            <span className="text-emerald-700 font-mono font-medium">100% Anonymized Aggregation</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between items-center text-[#0F172A]">
                <span className="font-semibold flex items-center gap-2">
                  <span>📚</span> Exam & Midterm Performance Anxiety
                </span>
                <span className="font-mono text-[#0F172A] font-bold">42% of interactions</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0F172A] h-full" style={{ width: "42%" }} />
              </div>
              <p className="text-[11px] text-[#64748B]">
                Peaks Sunday through Wednesday between 11 PM and 3 AM.
              </p>
            </div>

            <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between items-center text-[#0F172A]">
                <span className="font-semibold flex items-center gap-2">
                  <span>💼</span> Placement & Career Uncertainty
                </span>
                <span className="font-mono text-sky-700 font-bold">29% of interactions</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full" style={{ width: "29%" }} />
              </div>
              <p className="text-[11px] text-[#64748B]">
                Predominantly Final Year & Pre-Final Year batches.
              </p>
            </div>

            <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between items-center text-[#0F172A]">
                <span className="font-semibold flex items-center gap-2">
                  <span>🏠</span> Hostel Homesickness & Isolation
                </span>
                <span className="font-mono text-emerald-700 font-bold">18% of interactions</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: "18%" }} />
              </div>
              <p className="text-[11px] text-[#64748B]">
                Primarily first-year undergraduate cohort post-orientation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Triage */}
      {activeTab === "triage" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Deterministic Triage Events</span>
            <span className="text-emerald-700 font-mono font-medium">Zero Inspection Guarantee</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-mono text-emerald-700 uppercase font-semibold">Green (Standard)</span>
              <div className="text-2xl font-bold text-[#0F172A] font-display">94.2%</div>
              <p className="text-[11px] text-[#64748B]">Empathetic listening & grounding</p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-mono text-amber-700 uppercase font-semibold">Amber (Elevated)</span>
              <div className="text-2xl font-bold text-amber-600 font-display">5.1%</div>
              <p className="text-[11px] text-[#64748B]">Offered campus helpline contacts</p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-1 col-span-2">
              <span className="text-[11px] font-mono text-rose-700 uppercase font-semibold">Red (Circuit Breaker)</span>
              <div className="text-2xl font-bold text-rose-600 font-display">0.7%</div>
              <p className="text-[11px] text-[#64748B]">Direct Tele-MANAS (14416) crisis hot-handoff initiated</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Health */}
      {activeTab === "health" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Infrastructure Health</span>
            <span className="text-emerald-700 font-mono font-medium">Operational</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-mono text-[#64748B] uppercase">Active Campus Students</span>
              <div className="text-2xl font-bold text-[#0F172A] font-display">3,420 / 4,000</div>
              <p className="text-[11px] text-[#64748B]">85.5% student body adoption</p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-mono text-[#64748B] uppercase">Median Response Latency</span>
              <div className="text-2xl font-bold text-emerald-600 font-display">480 ms</div>
              <p className="text-[11px] text-[#64748B]">Local edge inference cluster</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center justify-between font-mono">
        <span>🛡️ Strict k-anonymity (k ≥ 50). Individual chat logs are cryptographically unviewable.</span>
        <span className="text-[#0F172A] font-medium hidden sm:inline">FERPA & DPDP Compliant</span>
      </div>
    </div>
  );
}
