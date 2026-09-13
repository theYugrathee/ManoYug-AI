/**
 * Approved knowledge retrieval (RAG-lite).
 * Only returns curated, source-attributed snippets — never arbitrary uploads.
 */

export type KnowledgeSnippet = {
  id: string;
  title: string;
  body: string;
  source: string;
  scope: "global" | "tenant";
  tags: string[];
};

const KNOWLEDGE: KnowledgeSnippet[] = [
  {
    id: "kb-exam-stress",
    title: "Exam stress — practical steps",
    body: "Break study into short blocks, sleep before major exams when possible, and ask campus academic support for backlog planning. This is educational — not a clinical treatment.",
    source: "ManoYug approved wellbeing library v1",
    scope: "global",
    tags: ["exam", "stress", "cgpa", "jee", "neet"],
  },
  {
    id: "kb-human-support",
    title: "When to seek a human",
    body: "If distress is persistent, escalating, or you want someone to talk to, use Talk to a human. You do not need to keep chatting with the AI.",
    source: "ManoYug approved wellbeing library v1",
    scope: "global",
    tags: ["human", "counsellor", "support"],
  },
  {
    id: "kb-ragging",
    title: "Ragging / harassment",
    body: "Ragging and harassment are serious. Prefer institutional anti-ragging / student grievance channels and human support. Do not confront alone if unsafe.",
    source: "ManoYug approved wellbeing library v1",
    scope: "global",
    tags: ["ragging", "harassment", "bullying", "abuse"],
  },
  {
    id: "kb-crisis",
    title: "Crisis resources",
    body: "For immediate danger use local emergency services. Verified national mental-health helplines are listed in Help / Safety from the resource registry (e.g. Tele-MANAS). The AI must not invent numbers.",
    source: "Verified resource registry policy",
    scope: "global",
    tags: ["crisis", "suicide", "emergency", "tele-manas"],
  },
];

export function retrieveApprovedKnowledge(
  query: string,
  limit = 2,
): KnowledgeSnippet[] {
  const q = query.toLowerCase();
  const scored = KNOWLEDGE.map((item) => {
    const hay = `${item.title} ${item.body} ${item.tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const tag of item.tags) {
      if (q.includes(tag)) score += 3;
    }
    for (const word of q.split(/\W+/).filter((w) => w.length > 3)) {
      if (hay.includes(word)) score += 1;
    }
    return { item, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);

  return scored;
}

export function formatKnowledgeForPrompt(snippets: KnowledgeSnippet[]): string {
  if (snippets.length === 0) return "";
  return [
    "Approved knowledge (cite as general education, not diagnosis):",
    ...snippets.map(
      (s) => `- ${s.title} [${s.source}]: ${s.body}`,
    ),
  ].join("\n");
}
