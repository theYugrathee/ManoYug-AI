"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
  category: "General" | "Students" | "Institutions" | "Safety & Privacy";
};

const FAQS: FaqItem[] = [
  {
    category: "General",
    question: "What is ManoYug AI?",
    answer: "ManoYug AI is a 24/7 empathetic wellbeing infrastructure built specifically for college and university environments. It provides immediate, culturally fluent emotional active listening, grounding exercises, and crisis safety triage for students, paired with privacy-preserving aggregate wellbeing climate analytics for educational institutions.",
  },
  {
    category: "General",
    question: "Is it a therapist?",
    answer: "No. ManoYug AI is an emotional active-listening and coping companion, not a licensed medical therapist or psychiatrist. It does not provide clinical diagnoses, psychiatric psychotherapy, or prescribe medication. When clinical distress is detected, it facilitates an immediate warm handoff to qualified professionals.",
  },
  {
    category: "General",
    question: "Who can use it?",
    answer: "Students enrolled in partnered colleges, universities, and coaching institutes can register using their campus-provided institution code. Institutional leaders, deans of student welfare, and campus wellness counselors can access aggregate analytics through the institutional portal.",
  },
  {
    category: "Students",
    question: "How does student access work?",
    answer: "Students enter their college institution code (e.g. DU-2026, IITD-001) and the email their institute approved. Roll number and other academic details are optional when the institute has provided them. Once verified, they gain confidential access on mobile or desktop.",
  },
  {
    category: "Students",
    question: "Can institutions see private conversations?",
    answer: "Never. ManoYug AI operates on strict zero-inspection database policies. College administrators, deans, and professors have zero access to individual chat logs, student names, or personal identities. Institutional dashboards only display anonymized cohort-level trends (e.g., general exam stress levels) with strict k-anonymity protections.",
  },
  {
    category: "Safety & Privacy",
    question: "Is student data private?",
    answer: "Yes. All student interactions are isolated at the database level with Row-Level Security (RLS) and encrypted in transit and at rest. We adhere strictly to DPDP Act principles. Conversations are never sold, mined for marketing, or used to train open LLM models.",
  },
  {
    category: "Safety & Privacy",
    question: "What happens during a safety concern?",
    answer: "ManoYug AI features an out-of-model deterministic safety engine. If self-harm, severe crisis, or violence triggers are detected, the system immediately presents verified crisis hotline resources—including Tele-MANAS (14416), Kiran (1800-599-0019), and campus emergency contacts—ensuring human support takes precedence.",
  },
  {
    category: "Institutions",
    question: "How does the platform work for universities?",
    answer: "Universities receive an isolated campus tenant partition. Leadership gets real-time cohort wellbeing insights, early warning signals for seasonal stress surges (such as placement or exam periods), and direct emergency hotline directory configuration without infringing on student confidentiality.",
  },
  {
    category: "Institutions",
    question: "How does institutional deployment work?",
    answer: "Institutions submit an onboarding request. Upon institutional verification, our team sets up their secure tenant partition, assigns a permanent institution code, and configures campus emergency contacts. Campus rollout typically takes less than 48 hours.",
  },
  {
    category: "Institutions",
    question: "How can an institution contact ManoYug?",
    answer: "Institutions can submit a request through the 'Bring ManoYug to your campus' form, email our campus partnerships team, or schedule an executive briefing to evaluate tenant provisioning and safety compliance.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "General", "Students", "Institutions", "Safety & Privacy"];

  const filteredFaqs = selectedCategory === "All"
    ? FAQS
    : FAQS.filter((f) => f.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Category filter pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setOpenIndex(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-[#E2E8F0] rounded-3xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="transition-colors hover:bg-[#F8FAFC]/60">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-6 sm:p-7 text-left text-base sm:text-lg font-semibold text-[#0F172A] transition-all cursor-pointer font-display"
                aria-expanded={isOpen}
              >
                <span className="pr-6 leading-snug">{faq.question}</span>
                <span className={`h-8 w-8 rounded-full flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#64748B] flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#0F172A] border-[#CBD5E1]" : ""}`}>
                  ↓
                </span>
              </button>

              {isOpen && (
                <div className="px-6 sm:px-7 pb-7 text-sm text-[#64748B] leading-relaxed my-fade-in-up">
                  <p className="max-w-3xl">{faq.answer}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] font-mono">
                      {faq.category}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
