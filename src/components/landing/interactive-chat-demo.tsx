"use client";

import { useState, useEffect } from "react";

type Scenario = {
  id: string;
  label: string;
  icon: string;
  userPrompt: string;
  companionResponse: string;
  tag: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "placement",
    label: "Placement Panic",
    icon: "💼",
    userPrompt: "Bhai day-1 shortlists aayi hain aur mera ek bhi company mein nahi hua. Ghar pe kya bolunga, bohot panic ho raha hai...",
    companionResponse: "Main samajh sakta hoon ki is waqt kitna heavy feel ho raha hoga. Shortlist na aana bilkul bhi tumhari worth define nahi karta, par family ke expectations ka pressure bohot real hota hai.\n\nEk gehri saans lo. Abhi agle ghante mein koi bada decision lene ki zaroorat nahi hai. Kya hum pehle iss panic ko thoda shaant karne ke liye 2 minute ka grounding exercise try karein?",
    tag: "Bilingual Empathy · Grounding",
  },
  {
    id: "exam",
    label: "2 AM Backlog Stress",
    icon: "📚",
    userPrompt: "Kal subah 9 baje end-sem hai, 4 units bachi hain. Lagta hai fail ho jaunga, dil bohot tez dhadak raha hai.",
    companionResponse: "Ye jo dil ki dhadkan tez ho rahi hai, ye tumhari body ka acute stress response hai. Pehle 30 seconds ke liye ek glass paani piyo.\n\nSuno — poori 4 units ek raat mein master karna realistic nahi hai, par fail hone ka darr sabse zyada tab overwhelm karta hai jab hum sab kuch ek saath sochte hain. Jo highest-weightage topics hain, unke 2 key concepts summarize kar sakte hain. Chalo step-by-step dekhte hain.",
    tag: "Emotional De-escalation",
  },
  {
    id: "hostel",
    label: "Hostel Homesickness",
    icon: "🏠",
    userPrompt: "I moved 1,500km away from home to this campus. Everyone seems to have their friend groups already. I just sit in my room feeling completely invisible.",
    companionResponse: "Moving so far away is a massive transition, and feeling invisible in a new campus is one of the loneliest experiences someone can go through. Most people you see laughing in groups are often just masking their own awkwardness.\n\nYou don't have to force yourself into a whole social circle today. What's one small thing that gave you comfort back home that we can bring into your hostel room tonight?",
    tag: "Validation · Safe Haven",
  },
  {
    id: "burnout",
    label: "Attendance & Lab Fatigue",
    icon: "⏱️",
    userPrompt: "Attendance 73% pe atki hai, 2 lab records pending hain aur kal subah viva hai. I can't keep doing this every semester.",
    companionResponse: "Jab multiple deadlines aur attendance strictures ek saath head-on hit karte hain, toh nervous system shutdown mode mein chala jata hai. Tum akele nahi ho jo is academic grind mein exhausted feel kar rahe ho.\n\nLet's break the paralysis. Agar hum viva ke pehle bas 3 standard questions prepare kar lein, toh attendance ka fine ya detention tackle ho sakta hai. Tumhe sabse zyada kis lab ka dar lag raha hai?",
    tag: "Cognitive Reframing",
  },
];

export function InteractiveChatDemo() {
  const [selectedId, setSelectedId] = useState("placement");
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedId) || SCENARIOS[0];

  useEffect(() => {
    setIsTyping(true);
    setTypedText("");
    let charIndex = 0;
    const full = scenario.companionResponse;

    const interval = setInterval(() => {
      charIndex += 2;
      setTypedText(full.slice(0, charIndex));
      if (charIndex >= full.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [scenario]);

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 text-left shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] text-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-[#0F172A] tracking-tight font-display">ManoYug AI Live Conversation</span>
          <span className="text-[11px] text-[#64748B] hidden sm:inline">· Confidential Session</span>
        </div>
        <div className="rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 text-[11px] font-semibold text-[#059669]">
          {scenario.tag}
        </div>
      </div>

      {/* Interactive Scenario Selection Pills */}
      <div className="py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-[#64748B] whitespace-nowrap mr-1 font-mono uppercase">
          Situation:
        </span>
        {SCENARIOS.map((s) => {
          const isActive = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0F172A] text-white font-semibold shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4 my-4 min-h-[220px]">
        {/* User Bubble */}
        <div className="flex justify-end">
          <div className="max-w-[88%] sm:max-w-[80%] rounded-2xl rounded-tr-xs bg-[#0F172A] text-white px-5 py-3.5 text-xs sm:text-sm shadow-xs">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between gap-4 font-mono">
              <span>Student (Hostel Campus)</span>
              <span className="text-slate-400 font-normal">2:14 AM</span>
            </div>
            <p className="leading-relaxed text-slate-100">{scenario.userPrompt}</p>
          </div>
        </div>

        {/* AI Companion Bubble */}
        <div className="flex justify-start">
          <div className="max-w-[94%] sm:max-w-[88%] rounded-2xl rounded-tl-xs bg-[#F8FAFC] border border-[#E2E8F0] px-5 py-4 text-xs sm:text-sm text-[#0F172A] shadow-xs">
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
              <span className="flex items-center gap-2 text-emerald-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> ManoYug AI Companion
              </span>
              <span className="text-[10px] text-[#94A3B8]">First-Line Active Listening</span>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap font-sans text-[#1E293B]">
              {typedText}
              {isTyping && <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-600 animate-pulse align-middle" />}
            </p>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748B] gap-2 font-mono">
        <span>🔒 Zero personal identifiers retained · End-to-end anonymized</span>
        <span className="text-emerald-700 font-medium">Deterministic Crisis Escalation Ready</span>
      </div>
    </div>
  );
}
