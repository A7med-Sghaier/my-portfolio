import { describe, expect, it } from "vitest";
import { normalizeContent } from "./content";
import { answerPortfolioQuestion, buildPortfolioFacts } from "./portfolio-assistant";

const content = normalizeContent({
  profile: {
    name: "Ahmed Sghaier",
    title: "Senior Full-Stack Engineer",
    positioning: "Building reliable data products.",
    statement: "I deliver systems from data to interface.",
    location: "Bavaria, Germany",
    availability: "Available for remote opportunities worldwide.",
    disciplines: ["React", "Data & AI"],
    languages: [],
  },
  experiences: [
    {
      id: "bmw",
      company: "BMW Group",
      role: "Data Scientist",
      period: "2019",
      start: "2019-02",
      summary: "Developed predictive failure detection for industrial test benches.",
      achievements: ["Analyzed event logs and sensor data."],
      tech: ["Python", "Machine Learning"],
    },
  ],
  projects: [
    {
      slug: "air-quality-platform",
      title: "Air Quality Platform",
      tagline: "Predictive environmental analytics.",
      overview: "A platform for pollutant forecasts.",
      status: "published",
      visibility: "public",
      stack: ["React", "Python"],
      architecture: ["React client", "Prediction service"],
      results: ["Delivered station-level forecasts."],
    },
  ],
  expertise: [
    {
      id: "full-stack",
      title: "Full-stack engineering",
      blurb: "Production delivery across interface, service and data layers.",
      skills: ["React", "Node.js", "PostgreSQL"],
    },
    {
      id: "security",
      title: "Application security",
      blurb: "Authentication, authorization and secure delivery.",
      skills: ["OAuth", "Permissions", "Threat modeling"],
    },
    {
      id: "mobile",
      title: "Mobile engineering",
      blurb: "Native mobile product delivery.",
      skills: ["Swift", "Kotlin"],
    },
    {
      id: "delivery",
      title: "Delivery systems",
      blurb: "Repeatable testing and deployment workflows.",
      skills: ["CI/CD", "Docker"],
    },
  ],
  education: [],
  principles: [],
  heroMetrics: [],
  performanceMetrics: [],
});

describe("local portfolio assistant", () => {
  it("builds its knowledge only from loaded public content", () => {
    const facts = buildPortfolioFacts(content);
    expect(facts.map((item) => item.id)).toEqual([
      "profile",
      "experience-bmw",
      "project-air-quality-platform",
      "expertise-full-stack",
      "expertise-security",
      "expertise-mobile",
      "expertise-delivery",
    ]);
  });

  it("returns deterministic answers with routes to the matching evidence", () => {
    const first = answerPortfolioQuestion(content, "What did he build at BMW?", "No match");
    const second = answerPortfolioQuestion(content, "What did he build at BMW?", "No match");

    expect(first).toEqual(second);
    expect(first.text).toContain("predictive failure detection");
    expect(first.sources).toEqual([
      { id: "experience-bmw", label: "BMW Group", path: "/experience" },
    ]);

    const machineLearning = answerPortfolioQuestion(
      content,
      "Does he have machine-learning experience?",
      "No match",
    );
    expect(machineLearning.text).toContain("Machine Learning");
    expect(machineLearning.sources[0]?.path).toBe("/experience");

    const security = answerPortfolioQuestion(content, "security skills", "No match");
    expect(security.sources[0]?.id).toBe("expertise-security");

    const strongest = answerPortfolioQuestion(content, "ما أقوى حزمة تقنية لديه؟", "No match");
    expect(strongest.sources).toHaveLength(4);
  });

  it("uses the supplied localized fallback when no loaded fact matches", () => {
    expect(answerPortfolioQuestion(content, "favorite meal", "Verified data only")).toEqual({
      text: "Verified data only",
      sources: [],
    });
  });
});
