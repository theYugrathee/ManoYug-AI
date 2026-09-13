import Link from "next/link";

type Guide = {
  title: string;
  category: string;
  readTime: string;
  description: string;
  tag: string;
};

const GUIDES: Guide[] = [
  {
    category: "Somatic Grounding",
    title: "The 5-4-3-2-1 Sensory Protocol for Acute Panic in Hostel Rooms",
    readTime: "3 min read",
    description: "A clinically grounded sensory anchoring exercise to halt racing thoughts when end-sem panic or palpitations trigger late at night.",
    tag: "Grounding Tool",
  },
  {
    category: "Cognitive Reframing",
    title: "Navigating Day-1 Placement Shortlist Rejection",
    readTime: "5 min read",
    description: "How to separate self-worth from algorithmic shortlist filters, manage peer comparison, and break the spiral of catastrophizing.",
    tag: "Career Wellbeing",
  },
  {
    category: "Campus Policy",
    title: "UGC Guidelines on Student Mental Health & NAAC Criterion 5",
    readTime: "6 min read",
    description: "An administrative blueprint for Higher Education Institutions to build 24/7 proactive student mental health support systems.",
    tag: "Institutional Architecture",
  },
];

export function ResourceGuides() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {GUIDES.map((guide, idx) => (
        <article
          key={idx}
          className="group rounded-3xl border border-border/80 bg-elevated/70 p-6 sm:p-7 backdrop-blur-md transition-all duration-300 hover:border-brand/50 hover:bg-elevated hover:shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-brand">{guide.category}</span>
              <span className="text-muted text-[11px] font-mono">{guide.readTime}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-brand transition-colors">
              {guide.title}
            </h3>

            <p className="text-xs text-muted leading-relaxed">
              {guide.description}
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="rounded-full bg-subtle px-3 py-1 font-mono text-[10px] text-muted">
              {guide.tag}
            </span>
            <Link
              href="/help"
              className="font-semibold text-brand group-hover:underline flex items-center gap-1"
            >
              Read Protocol →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
