import { getStudentHomeData } from "@/lib/student/actions";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Timeline" };

export default async function TimelinePage() {
  const data = await getStudentHomeData();

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'checkin': return 'C';
      case 'exercise': return 'E';
      case 'support': return 'S';
      case 'appointment': return 'A';
      default: return '·';
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'checkin': return 'bg-brand/20 text-brand outline-brand/30';
      case 'exercise': return 'bg-[var(--my-accent)]/20 text-[var(--my-accent)] outline-[var(--my-accent)]/30';
      case 'support': return 'bg-[var(--my-warning)]/20 text-[var(--my-warning)] outline-[var(--my-warning)]/30';
      case 'appointment': return 'bg-[var(--my-success)]/20 text-[var(--my-success)] outline-[var(--my-success)]/30';
      default: return 'bg-elevated text-muted outline-border';
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 md:px-8 md:py-12 my-fade-in-up">
      <header className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Personal Timeline
        </h1>
        <p className="mt-2 text-sm text-muted">
          Your check-ins, exercises, support requests, and appointments. Note: This is an activity log, not a diagnostic medical chart.
        </p>
      </header>

      <div className="relative border-l-2 border-border ml-5 pl-8 space-y-8">
        {data.timeline.length === 0 ? (
          <div className="rounded-2xl border border-border border-dashed bg-transparent px-6 py-12 text-center text-sm text-muted -ml-8">
            No activity yet.
          </div>
        ) : (
          data.timeline.map((e) => {
            const iconStr = getTimelineIcon(e.type);
            const colorClass = getTimelineColor(e.type);

            return (
              <div key={e.id} className="relative">
                {/* Timeline Node */}
                <div
                  className={`absolute -left-[45px] top-1 flex h-8 w-8 items-center justify-center rounded-full outline outline-4 ${colorClass} bg-background font-bold text-xs`}
                  aria-hidden="true"
                >
                  {iconStr}
                </div>

                <div className="rounded-2xl border border-border bg-elevated p-5 transition-colors hover:border-[var(--my-border-strong)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      {e.type.replace("_", " ")}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {new Date(e.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-foreground text-sm font-medium leading-relaxed">{e.label}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
