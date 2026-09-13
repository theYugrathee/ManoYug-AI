import Link from "next/link";
import { VERIFIED_RESOURCES } from "@/lib/wellbeing/catalogue";

export const metadata = { title: "Help" };

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 my-fade-in-up">
      <Link href="/" className="text-sm font-semibold text-brand hover:underline underline-offset-4 mb-8 block">← Home</Link>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        Help / Safety
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted max-w-xl">
        ManoYug AI is not an emergency service. If you are in immediate danger, contact local emergency services. Verified helplines below come from a managed resource registry — not from the AI guessing numbers.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {VERIFIED_RESOURCES.map((r) => (
          <div
            key={r.contact}
            className="group rounded-2xl border border-border bg-elevated p-6 hover:border-[var(--my-border-strong)] transition-all"
          >
            <h2 className="font-bold text-foreground mb-1">{r.name}</h2>
            <p className="text-lg font-bold text-brand">{r.contact}</p>
            <p className="text-xs text-muted mt-2">{r.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-6 text-sm pt-6 border-t border-border">
        <Link href="/student/support" className="group font-semibold text-brand hover:underline underline-offset-4 flex items-center gap-1">
          Talk to a human <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <Link href="/safety" className="font-semibold text-muted hover:text-foreground transition-colors">
          Safety principles
        </Link>
      </div>

      <section id="password-reset" className="mt-10 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-bold text-foreground">Can&apos;t sign in?</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Use the same email you registered with. If you no longer know the password, contact your campus administrator or platform support so the account can be reset without creating a duplicate student record.
        </p>
      </section>
    </main>
  );
}
