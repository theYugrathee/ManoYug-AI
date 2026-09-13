import { UniversalLoginView } from "@/components/auth/universal-login-view";

export const metadata = { title: "Institution sign in — ManoYug" };

export default function InstitutionLoginPage() {
  return <main className="min-h-screen bg-[#F4F8F3] px-4 py-12 sm:px-6 sm:py-16"><div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-start"><aside className="rounded-[1.75rem] bg-[#173E31] p-8 text-white lg:sticky lg:top-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#BFD8CA]">Institution sign in</p><h1 className="mt-5 font-display text-4xl font-extrabold tracking-[-0.05em]">Your campus support workspace.</h1><p className="mt-5 text-sm leading-6 text-[#C5D8CE]">Manage access, support contacts, resources, and privacy-aware aggregate reporting from one clear workspace.</p></aside><section className="rounded-[1.75rem] border border-[#D7E5DB] bg-white p-7 shadow-[0_18px_50px_rgba(33,76,57,0.08)] sm:p-10"><UniversalLoginView initialType="institute" /></section></div></main>;
}
