import { UniversalRegisterView } from "@/components/auth/universal-register-view";

export const metadata = { title: "Create your student account — ManoYug" };

export default function StudentRegisterPage() {
  return (
    <main className="min-h-screen bg-[#F4F8F3] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
        <aside className="rounded-[1.75rem] bg-[#173E31] p-8 text-white lg:sticky lg:top-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#BFD8CA]">Student access</p>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-[-0.05em]">A private place to begin.</h1>
          <p className="mt-5 text-sm leading-6 text-[#C5D8CE]">Set up your account with your campus code. Once you&apos;re in, you can talk, check in, use grounding tools, and find verified support.</p>
          <ul className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm text-[#D7E7DE]"><li>01 · Your conversations stay personal.</li><li>02 · Start with the smallest next step.</li><li>03 · Human support stays easy to find.</li></ul>
        </aside>
        <section className="rounded-[1.75rem] border border-[#D7E5DB] bg-white p-7 shadow-[0_18px_50px_rgba(33,76,57,0.08)] sm:p-10"><UniversalRegisterView initialType="student" /></section>
      </div>
    </main>
  );
}
