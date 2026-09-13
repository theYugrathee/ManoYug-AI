import { CheckinForm } from "@/components/student/checkin-form";
import { getStudentHomeData } from "@/lib/student/actions";

export const metadata = { title: "Check-in" };

export default async function CheckinPage() {
  const data = await getStudentHomeData();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 md:px-8 md:py-12 my-fade-in-up">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Daily Reflection
        </h1>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Take a moment to check in with yourself. This data is private and only visible to you — it helps you identify patterns over time.
        </p>
      </header>

      <CheckinForm />

      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">Recent reflections</h2>

        {data.checkins.length === 0 ? (
          <div className="rounded-2xl border border-border border-dashed p-10 text-center">
            <p className="text-sm text-muted">No check-ins yet. Start building your history today.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.checkins.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-subtle p-5 hover:border-[var(--my-border-strong)] transition-colors"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {new Date(c.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs text-brand font-medium">
                    {new Date(c.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  {[
                    { label: "Mood", val: c.mood },
                    { label: "Stress", val: c.stress },
                    { label: "Energy", val: c.energy },
                  ].map(stat => (
                    <div key={stat.label} className="flex justify-between items-center text-sm">
                      <span className="text-muted">{stat.label}</span>
                      <div className="flex items-center gap-2">
                        {/* Mini visual indicator */}
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1.5 w-3 rounded-full ${i <= stat.val ? 'bg-brand' : 'bg-elevated'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
