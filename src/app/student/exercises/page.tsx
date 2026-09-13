import { GUIDED_EXERCISES } from "@/lib/wellbeing/catalogue";
import {
  completeExerciseAction,
  getExercisesData,
} from "@/lib/student/actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Exercises" };

export default async function ExercisesPage() {
  const { completions } = await getExercisesData();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 md:px-8 md:py-12 my-fade-in-up">
      <header className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Guided Exercises
        </h1>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Practical, science-backed wellbeing tools. Not a replacement for therapy, but effective for immediate grounding.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {GUIDED_EXERCISES.map((ex) => {
          const done = completions.some((c) => c.slug === ex.slug);
          return (
            <div
              key={ex.slug}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-[var(--my-duration-slow)] ${done
                  ? "border-[var(--my-success)]/20 bg-[var(--my-success-bg)]/20"
                  : "border-border bg-elevated hover:border-[var(--my-border-strong)] hover:shadow-[var(--my-shadow-md)] group"
                }`}
            >
              {/* Animated decorative breathe circle for breathing exercises */}
              {ex.slug.includes('breath') && !done && (
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full border border-brand/20 my-breathe pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              )}

              <div className="p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <h2 className="text-lg font-bold text-foreground">{ex.name}</h2>
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${done ? 'bg-[var(--my-success)]/20 text-[var(--my-success)]' : 'bg-subtle text-brand'}`}>
                    {ex.durationMinutes} min
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-foreground opacity-90">{ex.description}</p>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <ol className="space-y-4">
                    {ex.steps.map((step, idx) => (
                      <li key={`${ex.slug}-step-${idx}`} className="flex gap-4 items-start text-sm">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-subtle text-[11px] font-bold text-muted border border-border border-dashed">
                          {idx + 1}
                        </span>
                        <span className="mt-0.5 text-muted leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="p-4 bg-subtle/50 border-t border-border/50">
                <form
                  action={async () => {
                    "use server";
                    await completeExerciseAction(ex.slug);
                  }}
                >
                  <Button
                    type="submit"
                    variant={done ? "secondary" : "primary"}
                    className="w-full"
                    disabled={done}
                  >
                    {done ? "✓ Completed today" : "Mark as completed"}
                  </Button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
