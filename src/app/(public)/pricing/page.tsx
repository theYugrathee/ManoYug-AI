import Link from "next/link";
import { PRICING_TIERS } from "@/lib/commercial/pricing";

export const metadata = {
  title: "Campus Pricing & Institutional Plans — ManoYug AI",
  description:
    "Predictable, transparent annual pricing for higher-education colleges and universities. 24/7 AI wellbeing companion with complete tenant privacy.",
};

const FEATURES = [
  "24/7 Confidential Student Wellbeing AI Companion",
  "Deterministic Crisis Safety Precheck Engine",
  "Official Tele-MANAS (14416) & National Helpline Escalation",
  "Custom Campus Emergency & Counsellor Directory",
  "Aggregated Student Stress & Exam Seasonality Analytics",
  "Dedicated Unique Institute Code & Tenant Partition",
  "CSV & Direct Approved Student Roster Sync",
  "Zero Personal Chat Retention for Administrators",
  "Role-Based Access for Deans, Counsellors & Administrators",
  "Priority Onboarding & Staff Orientation Workshop",
];

const FAQS = [
  {
    q: "How does the annual student capacity license work?",
    a: "Your institution chooses an annual capacity tier matching your total enrolled student body. All verified students receive unlimited access to the ManoYug AI companion, self-reflection check-ins, grounding exercises, and crisis escalation throughout the academic year.",
  },
  {
    q: "Can funding come from student welfare / UGC grants?",
    a: "Yes. ManoYug AI qualifies under student mental health, campus safety, and NAAC accreditation wellbeing mandate budgets. We provide GST-compliant invoices and formal vendor empanelment documentation.",
  },
  {
    q: "What happens if our enrollment exceeds our tier capacity?",
    a: "You can seamlessly upgrade to the next tier at any point during the academic year with pro-rated billing. Student access is never interrupted during exam or admission periods.",
  },
  {
    q: "How is student privacy protected from administration eyes?",
    a: "ManoYug AI strictly adheres to DPDP Act standards. Individual student conversations, journal check-ins, and personal reflections are end-to-end encrypted and completely inaccessible to college staff or super administrators. Administrators only see anonymized aggregate trends.",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Institutional SaaS Licensing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-[#0F172A]">
            Predictable Campus Pricing for Every Institution
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Transparent annual pricing based on enrolled student capacity. No hidden token charges, no per-turn fees, full platform capabilities included.
          </p>
        </div>

        {/* Pricing Table / Grid */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#F8FAFC]">
            <div>
              <h2 className="text-xl font-bold font-display text-[#0F172A]">Annual Institutional Schedule</h2>
              <p className="text-xs text-[#64748B] mt-1">Official annual subscription rates in INR (excluding applicable GST)</p>
            </div>
            <Link
              href="/institutions"
              className="inline-flex items-center justify-center rounded-full bg-[#0F172A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1E293B] transition-all shadow-xs"
            >
              Request Campus Onboarding →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC]/80 text-[#64748B] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Enrolled Student Capacity</th>
                  <th className="px-6 py-4">Annual License (INR)</th>
                  <th className="px-6 py-4">Effective Cost / Student</th>
                  <th className="px-6 py-4">Tenant Support SLA</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {PRICING_TIERS.map((tier) => {
                  const effectivePerStudent = Math.round(tier.annualInr / tier.maxStudents);
                  const isPopular = tier.maxStudents === 10000 || tier.maxStudents === 20000;
                  return (
                    <tr
                      key={tier.maxStudents}
                      className={`transition-colors hover:bg-[#F8FAFC] ${isPopular ? "bg-emerald-50/40" : ""}`}
                    >
                      <td className="px-6 py-4.5 font-bold text-sm text-[#0F172A]">
                        <div className="flex items-center gap-2">
                          <span>{tier.maxStudents.toLocaleString("en-IN")} Students</span>
                          {isPopular && (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                              Popular
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4.5 font-mono font-bold text-base text-[#0F172A]">
                        ₹{tier.annualInr.toLocaleString("en-IN")}
                        <span className="text-[11px] font-normal text-[#64748B]"> / year</span>
                      </td>

                      <td className="px-6 py-4.5 font-mono text-xs text-[#0F172A]">
                        ₹{effectivePerStudent} <span className="text-[#64748B]">/ student / yr</span>
                      </td>

                      <td className="px-6 py-4.5 text-[#64748B]">
                        {tier.maxStudents >= 50000 ? "Dedicated 24/7 SLA & Manager" : "Standard Priority Support"}
                      </td>

                      <td className="px-6 py-4.5 text-right">
                        <Link
                          href={`/institutions?capacity=${tier.maxStudents}`}
                          className="inline-flex items-center rounded-full border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#0F172A] transition-all shadow-xs"
                        >
                          Select Tier →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Included Features Section */}
        <div className="grid lg:grid-cols-2 gap-8 items-center rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0F172A]">
              Everything Included in Every Tier
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              We do not paywall critical student wellbeing features. Every institution receives the full safety stack, unlimited AI interactions, and campus analytics regardless of enrollment size.
            </p>
            <div className="pt-4">
              <Link
                href="/institutions"
                className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-6 py-3 text-xs font-bold text-white hover:bg-[#1E293B] transition-all shadow-xs"
              >
                Bring ManoYug to Your Campus →
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {FEATURES.map((feat) => (
              <div key={feat} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-emerald-600 font-bold text-sm">✓</span>
                <span className="text-xs text-[#0F172A] font-medium leading-tight">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0F172A]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#64748B]">Common questions from deans, directors, and finance committees</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-2.5 shadow-xs">
                <h3 className="text-sm font-bold text-[#0F172A] font-display">{faq.q}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0F172A]">
            Ready to Protect and Support Your Students?
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Get your campus code assigned today. Instant student verification, customized helpline directory, and zero setup complexity.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/institutions"
              className="rounded-full bg-[#0F172A] px-6 py-3 text-xs font-bold text-white hover:bg-[#1E293B] transition-all shadow-xs"
            >
              Get Started for Your College →
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#CBD5E1] bg-white px-6 py-3 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
            >
              Contact Commercial Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
