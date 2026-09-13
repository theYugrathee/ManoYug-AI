import { AppointmentForm } from "@/components/student/appointment-form";
import {
  cancelAppointmentAction,
  getAppointmentsData,
} from "@/lib/student/actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Appointments" };

export default async function AppointmentsPage() {
  const data = await getAppointmentsData();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 md:px-8 md:py-12 my-fade-in-up">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

        {/* Left Col - Booking Form */}
        <div>
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Book Appointment
            </h1>
            <p className="mt-2 text-sm text-muted">
              Schedule a focused slot with a counsellor. Double-booking and scheduling in the past are automatically prevented.
            </p>
          </header>

          <div className="rounded-2xl border border-border bg-elevated p-5 sm:p-8">
            <AppointmentForm />
          </div>
        </div>

        {/* Right Col - Bookings List */}
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your bookings</h2>

          <ul className="flex-1 space-y-4">
            {data.mine.length === 0 ? (
              <li className="rounded-2xl border border-border border-dashed bg-transparent px-6 py-10 text-center text-sm text-muted h-full flex items-center justify-center min-h-[200px]">
                No appointments booked yet.
              </li>
            ) : (
              data.mine.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-border bg-subtle p-5 hover:border-[var(--my-border-strong)] transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-semibold text-brand uppercase tracking-wider block mb-1">
                        {new Date(a.startsAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {new Date(a.startsAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${a.status === 'SCHEDULED' ? 'bg-brand/20 text-brand' : 'bg-elevated text-muted'
                      }`}>
                      {a.status}
                    </span>
                  </div>

                  {a.status === "SCHEDULED" ? (
                    <form
                      action={async () => {
                        "use server";
                        await cancelAppointmentAction(a.id);
                      }}
                      className="pt-4 border-t border-border/50"
                    >
                      <Button type="submit" variant="ghost" size="sm" className="w-full text-[var(--my-danger)] hover:text-white hover:bg-[var(--my-danger)]">
                        Cancel booking
                      </Button>
                    </form>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>

      </div>
    </main>
  );
}
