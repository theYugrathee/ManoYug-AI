import { describe, expect, it } from "vitest";
import { runChatTurn } from "@/lib/ai/gateway";
import { runSafetyPostcheck, routeSafetyAction } from "@/lib/safety";
import {
  escapeCsvFormula,
  previewRosterCsv,
} from "@/lib/institution/csv-roster";

describe("safety postcheck + router", () => {
  it("blocks fabricated counsellor-contact claims", () => {
    const post = runSafetyPostcheck({
      userText: "I feel sad about exams",
      modelText: "I called your counsellor already.",
      priorState: "GREEN",
    });
    expect(post.recommended_action).toBe("block_unsafe_content");
    const route = routeSafetyAction(post);
    expect(route.allowModelReply).toBe(false);
  });

  it("does not downgrade imminent precheck", () => {
    const post = runSafetyPostcheck({
      userText: "fine",
      modelText: "Take a walk.",
      priorState: "IMMINENT",
    });
    expect(post.state).toBe("IMMINENT");
  });
});

describe("AI gateway", () => {
  it("continues ordinary stress with a reply", async () => {
    const turn = await runChatTurn({
      userText: "I am stressed about my midterm exams and CGPA.",
      language: "en",
    });
    expect(turn.decision.assessment.state).toBe("GREEN");
    expect(turn.assistantText).toBeTruthy();
    expect(turn.provider).toBe("mock");
  });

  it("opens crisis UX for imminent suicidal language", async () => {
    const turn = await runChatTurn({
      userText: "I want to kill myself tonight with the pills I have.",
      language: "en",
    });
    expect(turn.decision.uiMode).toBe("crisis_fullscreen");
    expect(turn.decision.allowModelReply).toBe(false);
  });
});

describe("CSV roster preview", () => {
  it("escapes formula injection", () => {
    expect(escapeCsvFormula("=CMD()")).toBe("'=CMD()");
  });

  it("validates and counts duplicates", () => {
    const csv = [
      "email,university_roll_no,graduation_year,status",
      "a@college.edu,R1,2027,ACTIVE",
      "a@college.edu,R2,2027,ACTIVE",
      "bad,R3,2027,ACTIVE",
    ].join("\n");
    const preview = previewRosterCsv(csv);
    expect(preview.total).toBe(3);
    expect(preview.accepted).toBe(1);
    expect(preview.duplicates).toBeGreaterThan(0);
  });
});
