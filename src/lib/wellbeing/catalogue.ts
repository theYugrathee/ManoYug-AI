export const GUIDED_EXERCISES = [
  {
    slug: "breathing-box",
    name: "Box breathing",
    description:
      "A short paced-breathing reset for exam or placement stress. Not medical treatment.",
    durationMinutes: 4,
    steps: [
      "Inhale for 4 seconds",
      "Hold for 4 seconds",
      "Exhale for 4 seconds",
      "Hold for 4 seconds",
      "Repeat 4 rounds",
    ],
  },
  {
    slug: "grounding-54321",
    name: "5-4-3-2-1 grounding",
    description: "Orient to the present using senses. Not a clinical intervention.",
    durationMinutes: 5,
    steps: [
      "Name 5 things you see",
      "Name 4 things you feel",
      "Name 3 things you hear",
      "Name 2 things you smell",
      "Name 1 thing you taste",
    ],
  },
  {
    slug: "exam-stress-reset",
    name: "Exam stress reset",
    description: "Brief cognitive unload before or after an exam block.",
    durationMinutes: 6,
    steps: [
      "Name the worry in one sentence",
      "What is one controllable next step?",
      "Take three slow breaths",
      "Return to the smallest next action",
    ],
  },
  {
    slug: "sleep-prep",
    name: "Sleep preparation",
    description: "Wind-down sequence for hostel nights. Not a sleep disorder treatment.",
    durationMinutes: 8,
    steps: [
      "Dim screens",
      "Write tomorrow's top 1 task",
      "Slow breathing ×5",
      "Lights down",
    ],
  },
  {
    slug: "homesickness",
    name: "Homesickness support",
    description: "Gentle reflection for students far from home.",
    durationMinutes: 7,
    steps: [
      "Acknowledge the feeling without judging it",
      "Name one connection you can reach today",
      "Plan a small comforting routine",
    ],
  },
  {
    slug: "placement-rejection",
    name: "Placement rejection reflection",
    description: "Process a hard rejection without turning it into identity.",
    durationMinutes: 8,
    steps: [
      "What happened, factually?",
      "What story is your mind adding?",
      "What skill or support would help the next attempt?",
      "One kind action for yourself today",
    ],
  },
] as const;

export const VERIFIED_RESOURCES = [
  {
    name: "Tele-MANAS",
    type: "national_mental_health_helpline",
    contact: "14416",
    region: "IN",
    note: "From verified resource registry — not invented by the AI.",
  },
  {
    name: "Tele-MANAS (toll-free)",
    type: "national_mental_health_helpline",
    contact: "1800-89-14416",
    region: "IN",
    note: "From verified resource registry — not invented by the AI.",
  },
] as const;
