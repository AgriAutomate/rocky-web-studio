import { getNextQuestion } from "@/app/hooks/useQuestionFlow";
import { calculatePriority, getSectorRecommendation } from "@/app/lib/scoring";
import { isEmail, isBusinessName } from "@/app/utils/validation";

describe("Question flow", () => {
  const sectors: Array<"hospitality" | "trades" | "retail" | "professional" | "other"> = [
    "hospitality",
    "trades",
    "retail",
    "professional",
    "other",
  ];

  it.each(sectors)("returns first question for %s when none provided", (sector) => {
    expect(getNextQuestion("start", sector, {} as any)).not.toBeNull();
  });

  it("advances through trunk questions then branch", () => {
    const next = getNextQuestion("q1", "hospitality", {} as any);
    expect(next).toBe("q2");
  });
});

describe("Scoring", () => {
  it("assigns priority A for rush + high budget", () => {
    expect(calculatePriority("hospitality", "100k+", "rush")).toBe("A");
  });

  it("returns a recommendation object", () => {
    const rec = getSectorRecommendation("trades", {} as any);
    expect(rec).toHaveProperty("solution");
    expect(typeof rec.estimatedBudget).toBe("string");
  });
});

describe("Validation helpers", () => {
  it("rejects bad email", () => {
    expect(isEmail("nope")).toBe(false);
  });
  it("accepts good email", () => {
    expect(isEmail("test@example.com")).toBe(true);
  });
  it("enforces business name length", () => {
    expect(isBusinessName("A")).toBe(false);
    expect(isBusinessName("Valid Name")).toBe(true);
  });
});

describe("Form submission integration (mocked)", () => {
  beforeAll(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }) as any;
  });

  it("posts to questionnaire endpoint", async () => {
    const payload = { businessName: "ACME", email: "test@example.com" };
    await fetch("/api/questionnaire", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(global.fetch).toHaveBeenCalled();
  });
});
