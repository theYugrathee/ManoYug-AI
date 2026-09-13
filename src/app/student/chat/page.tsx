import Link from "next/link";
import {
  getStudentHomeData,
  startConversationAction,
} from "@/lib/student/actions";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Companion" };

export default async function ChatIndexPage() {
  const data = await getStudentHomeData();

  async function createNew() {
    "use server";
    const { id } = await startConversationAction("en");
    redirect(`/student/chat/${id}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 md:px-8 md:py-12 my-fade-in-up">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Conversations
          </h1>
          <p className="mt-2 text-sm text-muted">
            Clearly identified as AI. Safety checks run outside the model.
          </p>
        </div>
        <form action={createNew}>
          <Button type="submit">New conversation</Button>
        </form>
      </header>

      <div className="rounded-2xl border border-border bg-elevated/50 p-2 sm:p-4">
        <ul className="space-y-2">
          {data.conversations.length === 0 ? (
            <li className="rounded-xl border border-border border-dashed bg-transparent px-6 py-12 text-center text-sm text-muted">
              No conversations yet. Start a new chat when you&apos;re ready.
            </li>
          ) : (
            data.conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/student/chat/${c.id}`}
                  className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-subtle"
                >
                  <div className="mr-4 truncate">
                    <span className="font-semibold text-foreground">{c.title || "New Chat"}</span>
                    <p className="text-xs text-muted mt-1 truncate">ID: {c.id.split('-')[0]}</p>
                  </div>
                  <Badge variant={
                    c.latestSafetyState === "GREEN" ? "success" :
                      c.latestSafetyState === "AMBER" ? "warning" : "danger"
                  } dot>
                    {c.latestSafetyState}
                  </Badge>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}
