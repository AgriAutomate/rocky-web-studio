export interface ChallengeDetail {
  number: number;
  title: string;
  sections: string[];
  roiTimeline: string;
  projectCostRange: string;
}

const CHALLENGE_LIBRARY: Record<string, ChallengeDetail> = {
  "1": {
    number: 1,
    title: "Reduce Operational Costs",
    sections: [
      "Manual processes and legacy systems are creating unnecessary overhead and slowing down delivery.",
      "Your team is spending time on repetitive tasks that could be automated, limiting capacity for higher-value work.",
      "Without clear visibility into costs, it’s difficult to make confident decisions about where to invest or cut back.",
    ],
    roiTimeline: "3–9 months",
    projectCostRange: "$10k–$30k (depending on scope and integrations)",
  },
  "2": {
    number: 2,
    title: "Improve Revenue & Conversions",
    sections: [
      "Your current digital presence may not be converting as many visitors into leads or customers as it could.",
      "Key journeys & calls-to-action may be unclear or inconsistent across your website, landing pages, and campaigns.",
      "You may not be fully leveraging data to understand what’s working and where prospects are dropping off.",
    ],
    roiTimeline: "6–12 months",
    projectCostRange: "$15k–$40k (depending on channels and complexity)",
  },
  "3": {
    number: 3,
    title: "Scaling Service Delivery",
    sections: [
      "As demand grows, existing tools and workflows may not be keeping pace with your operational needs.",
      "Processes that rely on spreadsheets, email, or manual coordination can introduce errors and delays.",
      "A lack of integrated systems makes it harder to get a single source of truth across teams and locations.",
    ],
    roiTimeline: "6–12 months",
    projectCostRange: "$20k–60k (depending on systems and rollout)",
  },
  "4": {
    number: 4,
    title: "Modernise Digital Experience",
    sections: [
      "Your website or online platforms may no longer reflect the quality, innovation, or professionalism of your brand.",
      "Customers expect intuitive, mobile-friendly experiences and will quickly turn away if the journey is confusing.",
      "Outdated technology can limit your ability to experiment with new services, channels, or business models.",
    ],
    roiTimeline: "6–18 months",
    projectCostRange: "$25k–75k (depending on feature set)",
  },
  "5": {
    number: 5,
    title: "Customer Engagement & Retention",
    sections: [
      "Customers may not be receiving timely, relevant communications across email, SMS, and other channels.",
      "Lack of segmentation and automation can limit your ability to nurture relationships at scale.",
      "Missed engagement opportunities can reduce repeat business and lifetime customer value.",
    ],
    roiTimeline: "6–12 months",
    projectCostRange: "$10k–30k (depending on tooling and scope)",
  },
  "6": {
    number: 6,
    title: "Data & Insight Gaps",
    sections: [
      "Key decisions are being made without a clear, real-time view of performance across channels and operations.",
      "Data may be siloed across different systems, making it hard to measure ROI or identify trends.",
      "Without reliable insight, it’s challenging to prioritise investments or optimise your customer journeys.",
    ],
    roiTimeline: "6–12 months",
    projectCostRange: "$15k–40k (depending on integrations and complexity)",
  },
  "7": {
    number: 7,
    title: "Brand & Market Positioning",
    sections: [
      "Your current brand and messaging may not clearly communicate your value to the right audiences.",
      "In a competitive market, it’s harder to stand out, win tenders, or attract ideal customers.",
      "Inconsistent visual identity or messaging can erode trust and reduce perceived professionalism.",
    ],
    roiTimeline: "6–18 months",
    projectCostRange: "$8k–25k (depending on scope and channels)",
  },
  "8": {
    number: 8,
    title: "Innovation & New Service Development",
    sections: [
      "You have ideas for new services, products, or digital offerings but lack a clear path to bring them to market.",
      "Internal teams may be stretched thin, making it difficult to experiment or validate new concepts.",
      "Without structured experimentation, it’s easy to invest in the wrong initiatives or miss high-impact opportunities.",
    ],
    roiTimeline: "6–18 months",
    projectCostRange: "$20k–80k (depending on ambition and scope)",
  },
  "9": {
    number: 9,
    title: "Risk, Compliance & Resilience",
    sections: [
      "Manual or outdated processes can increase the risk of errors, non-compliance, or data breaches.",
      "Changing regulations and industry standards make it hard to keep your digital systems up to date.",
      "Lack of resilience planning can expose your organisation to downtime, lost revenue, or reputational damage.",
    ],
    roiTimeline: "6–12 months",
    projectCostRange: "$15k–40k (depending on regulatory scope)",
  },
  "10": {
    number: 10,
    title: "Team Capability & Culture",
    sections: [
      "Your people may not have the tools, training, or support they need to deliver modern digital experiences.",
      "Siloed teams and legacy processes can slow down decision-making and collaboration.",
      "Without the right culture and capability in place, even well-designed strategies can stall in execution.",
    ],
    roiTimeline: "6–18 months",
    projectCostRange: "$10k–50k (depending on programme design)",
  },
};

/**
 * Look up full challenge details (title, sections, and ROI metadata) for a
 * given list of pain point IDs.
 */
export function getChallengeDetails(ids: number[]): ChallengeDetail[] {
  return ids
    .map((id, index) => {
      const key = String(id);
      const base = CHALLENGE_LIBRARY[key];
      if (!base) return null;
      // Ensure the display number is either the mapped number or the position in the list
      return {
        number: base.number ?? ids[index] ?? id,
        title: base.title,
        sections: base.sections,
        roiTimeline: base.roiTimeline,
        projectCostRange: base.projectCostRange,
      } as ChallengeDetail;
    })
    .filter((c): c is ChallengeDetail => Boolean(c));
}
