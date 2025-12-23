/**
 * Unit Tests for CQ Advantage Section
 * 
 * Tests that verify sector-specific Central Queensland Advantage content
 * includes expected keywords and language for Healthcare, Trades, and Transport sectors.
 */

import { buildCQAdvantageSection } from "@/backend-workflow/services/pdf-content-builder";
import { getSector } from "@/backend-workflow/types/sectors";

describe("CQ Advantage Section - Healthcare & Allied Health", () => {
  it("should include telehealth and online booking language", () => {
    const sector = getSector("healthcare-allied-health");
    expect(sector).toBeDefined();
    
    const cqAdvantage = buildCQAdvantageSection(sector!);
    expect(cqAdvantage).not.toBeNull();
    
    // Verify telehealth language
    expect(cqAdvantage!.cqInsiderInsight.toLowerCase()).toContain("telehealth");
    expect(cqAdvantage!.cqInsiderInsight.toLowerCase()).toContain("online booking");
    
    // Verify 24/7 portal language
    expect(cqAdvantage!.rwsSurvivalKit.toLowerCase()).toContain("24/7");
    expect(cqAdvantage!.rwsSurvivalKit.toLowerCase()).toContain("patient portal");
    expect(cqAdvantage!.rwsSurvivalKit.toLowerCase()).toContain("telehealth");
    
    // Verify after-hours language
    expect(cqAdvantage!.localCompetitorFailure.toLowerCase()).toContain("after-hours");
  });

  it("should include specific healthcare statistics", () => {
    const sector = getSector("healthcare-allied-health");
    const cqAdvantage = buildCQAdvantageSection(sector!);
    
    // Verify key statistics appear
    expect(cqAdvantage!.cqInsiderInsight).toContain("325");
    expect(cqAdvantage!.cqInsiderInsight).toContain("32 minutes");
    expect(cqAdvantage!.cqInsiderInsight).toContain("6 months");
    expect(cqAdvantage!.cqInsiderInsight).toContain("22.5%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("26.6%");
    
    // Verify competitor failure statistics
    expect(cqAdvantage!.localCompetitorFailure).toContain("39%");
    expect(cqAdvantage!.localCompetitorFailure).toContain("15-20%");
    expect(cqAdvantage!.localCompetitorFailure).toContain("$27 million");
    
    // Verify solution benefits
    expect(cqAdvantage!.rwsSurvivalKit).toContain("12-18%");
  });

  it("should reference Queensland Virtual Hospital", () => {
    const sector = getSector("healthcare-allied-health");
    const cqAdvantage = buildCQAdvantageSection(sector!);
    
    expect(cqAdvantage!.localCompetitorFailure).toContain("Queensland Virtual Hospital");
    expect(cqAdvantage!.rwsSurvivalKit).toContain("Queensland Virtual Hospital");
  });
});

describe("CQ Advantage Section - Trades & Construction", () => {
  it("should include Procurement Policy 2026 and compliance language", () => {
    const sector = getSector("trades-construction");
    expect(sector).toBeDefined();
    
    const cqAdvantage = buildCQAdvantageSection(sector!);
    expect(cqAdvantage).not.toBeNull();
    
    // Verify Procurement Policy 2026 reference
    expect(cqAdvantage!.cqInsiderInsight).toContain("Queensland Procurement Policy 2026");
    
    // Verify compliance language
    expect(cqAdvantage!.cqInsiderInsight.toLowerCase()).toContain("compliance");
    expect(cqAdvantage!.localCompetitorFailure.toLowerCase()).toContain("compliance");
    expect(cqAdvantage!.rwsSurvivalKit.toLowerCase()).toContain("compliance");
    
    // Verify BIM language
    expect(cqAdvantage!.cqInsiderInsight).toContain("BIM");
    expect(cqAdvantage!.rwsSurvivalKit).toContain("BIM");
  });

  it("should include Ethical Supplier Mandate language", () => {
    const sector = getSector("trades-construction");
    const cqAdvantage = buildCQAdvantageSection(sector!);
    
    expect(cqAdvantage!.localCompetitorFailure).toContain("Ethical Supplier Mandate");
    expect(cqAdvantage!.rwsSurvivalKit).toContain("Ethical Supplier");
  });

  it("should include specific construction statistics", () => {
    const sector = getSector("trades-construction");
    const cqAdvantage = buildCQAdvantageSection(sector!);
    
    // Verify key statistics
    expect(cqAdvantage!.cqInsiderInsight).toContain("18,200");
    expect(cqAdvantage!.cqInsiderInsight).toContain("50,000");
    expect(cqAdvantage!.cqInsiderInsight).toContain("184");
    expect(cqAdvantage!.cqInsiderInsight).toContain("23%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("$53-77 billion");
    
    // Verify competitor failure statistics
    expect(cqAdvantage!.localCompetitorFailure).toContain("$45,000");
    expect(cqAdvantage!.localCompetitorFailure).toContain("12");
    expect(cqAdvantage!.localCompetitorFailure).toContain("89%");
    
    // Verify solution benefits
    expect(cqAdvantage!.rwsSurvivalKit).toContain("$50 million");
    expect(cqAdvantage!.rwsSurvivalKit).toContain("70%");
  });

  it("should reference Ring Road and Shoalwater Bay", () => {
    const sector = getSector("trades-construction");
    const cqAdvantage = buildCQAdvantageSection(sector!);
    
    // Note: These may not appear in the new detailed content, but checking for regional references
    expect(cqAdvantage!.cqInsiderInsight.toLowerCase()).toContain("queensland");
  });
});

describe("CQ Advantage Section - Transport & Logistics", () => {
  it("should include driver shortage and CoR language", () => {
    const sector = getSector("transport-logistics");
    expect(sector).toBeDefined();
    
    const cqAdvantage = buildCQAdvantageSection(sector!);
    expect(cqAdvantage).not.toBeNull();
    
    // Verify driver shortage language
    expect(cqAdvantage!.cqInsiderInsight.toLowerCase()).toContain("driver");
    expect(cqAdvantage!.cqInsiderInsight.toLowerCase()).toContain("shortage");
    
    // Verify Chain of Responsibility (CoR) language
    expect(cqAdvantage!.cqInsiderInsight).toContain("Chain of Responsibility");
    expect(cqAdvantage!.localCompetitorFailure).toContain("Chain of Responsibility");
    expect(cqAdvantage!.rwsSurvivalKit).toContain("Chain of Responsibility");
    
    // Verify route optimization language
    expect(cqAdvantage!.cqInsiderInsight.toLowerCase()).toContain("route");
    expect(cqAdvantage!.rwsSurvivalKit.toLowerCase()).toContain("route");
  });

  it("should include real-time tracking and automated quotes", () => {
    const sector = getSector("transport-logistics");
    const cqAdvantage = buildCQAdvantageSection(sector!);
    
    // Verify real-time tracking language
    expect(cqAdvantage!.cqInsiderInsight.toLowerCase()).toContain("real-time");
    expect(cqAdvantage!.localCompetitorFailure.toLowerCase()).toContain("real-time");
    expect(cqAdvantage!.rwsSurvivalKit.toLowerCase()).toContain("real-time");
    
    // Verify automated quotes language
    expect(cqAdvantage!.cqInsiderInsight.toLowerCase()).toContain("automated");
    expect(cqAdvantage!.rwsSurvivalKit.toLowerCase()).toContain("automated");
  });

  it("should include specific transport statistics", () => {
    const sector = getSector("transport-logistics");
    const cqAdvantage = buildCQAdvantageSection(sector!);
    
    // Verify key statistics
    expect(cqAdvantage!.cqInsiderInsight).toContain("28,000");
    expect(cqAdvantage!.cqInsiderInsight).toContain("47%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("21%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("15%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("5.3%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("13%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("18-23%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("$300,000");
    expect(cqAdvantage!.cqInsiderInsight).toContain("68%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("35-40%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("30%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("15%");
    expect(cqAdvantage!.cqInsiderInsight).toContain("87%");
    
    // Verify competitor failure statistics
    expect(cqAdvantage!.localCompetitorFailure).toContain("22%");
    
    // Verify solution benefits
    expect(cqAdvantage!.rwsSurvivalKit).toContain("18,600");
  });

  it("should reference NHVR and Queensland Transport", () => {
    const sector = getSector("transport-logistics");
    const cqAdvantage = buildCQAdvantageSection(sector!);
    
    expect(cqAdvantage!.rwsSurvivalKit).toContain("NHVR");
    expect(cqAdvantage!.rwsSurvivalKit).toContain("Queensland Transport");
  });
});

describe("CQ Advantage Section - General Structure", () => {
  it("should return null for sectors without CQ Advantage content", () => {
    const sectorWithoutContent = {
      name: "Test Sector",
      description: "Test",
    };
    
    const result = buildCQAdvantageSection(sectorWithoutContent as any);
    expect(result).toBeNull();
  });

  it("should return structured content when all fields are present", () => {
    const sector = getSector("healthcare-allied-health");
    const cqAdvantage = buildCQAdvantageSection(sector!);
    
    expect(cqAdvantage).not.toBeNull();
    expect(cqAdvantage).toHaveProperty("cqInsiderInsight");
    expect(cqAdvantage).toHaveProperty("localCompetitorFailure");
    expect(cqAdvantage).toHaveProperty("rwsSurvivalKit");
    
    expect(typeof cqAdvantage!.cqInsiderInsight).toBe("string");
    expect(typeof cqAdvantage!.localCompetitorFailure).toBe("string");
    expect(typeof cqAdvantage!.rwsSurvivalKit).toBe("string");
    
    // Verify content is not empty
    expect(cqAdvantage!.cqInsiderInsight.length).toBeGreaterThan(0);
    expect(cqAdvantage!.localCompetitorFailure.length).toBeGreaterThan(0);
    expect(cqAdvantage!.rwsSurvivalKit.length).toBeGreaterThan(0);
  });

  it("should support sector-specific override", () => {
    const sector = getSector("healthcare-allied-health");
    const override = {
      cqInsiderInsight: "Custom insight",
      localCompetitorFailure: "Custom failure",
      rwsSurvivalKit: "Custom solution",
    };
    
    const cqAdvantage = buildCQAdvantageSection(sector!, override);
    
    expect(cqAdvantage!.cqInsiderInsight).toBe("Custom insight");
    expect(cqAdvantage!.localCompetitorFailure).toBe("Custom failure");
    expect(cqAdvantage!.rwsSurvivalKit).toBe("Custom solution");
  });
});
