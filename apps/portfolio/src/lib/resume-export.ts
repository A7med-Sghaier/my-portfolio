import { jsPDF } from "jspdf";
import type { PortfolioContent, PortfolioExpertise } from "./content";

export interface ResumeExportLabels {
  experience: string;
  education: string;
  expertise: string;
  languages: string;
}

export interface ResumeFocus {
  id: string;
  title: string;
  note?: string;
}

function orderedExpertise(
  expertise: PortfolioExpertise[],
  focus?: ResumeFocus,
): PortfolioExpertise[] {
  if (!focus) return expertise;
  const selected = expertise.find((group) => group.id === focus.id);
  return selected ? [selected, ...expertise.filter((group) => group.id !== focus.id)] : expertise;
}

function filenamePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function resumeFileName(
  extension: "pdf" | "md",
  focus?: ResumeFocus,
  name?: string,
): string {
  const base = name?.trim() ? `${filenamePart(name)}-CV` : "CV";
  const suffix = focus ? filenamePart(focus.title) : "";
  return `${base}${suffix ? `-${suffix}` : ""}.${extension}`;
}

function buildResumeDocument(
  content: PortfolioContent,
  labels: ResumeExportLabels,
  focus?: ResumeFocus,
): jsPDF | null {
  const profile = content.profile;
  if (!profile) return null;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;
  const pageBottom = pageHeight - margin;
  let y = margin;

  const ink = [26, 28, 34] as const;
  const soft = [90, 96, 108] as const;
  const muted = [120, 126, 138] as const;
  const accent = [15, 118, 110] as const;
  const hairline = [223, 226, 231] as const;
  type Color = readonly [number, number, number];

  const setColor = (color: Color) => doc.setTextColor(color[0], color[1], color[2]);
  const ensureSpace = (space: number) => {
    if (y + space <= pageBottom) return;
    doc.addPage();
    y = margin;
  };
  const paragraph = (
    text: string,
    size: number,
    color: Color,
    lineHeight: number,
    style: "normal" | "italic" = "normal",
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    setColor(color);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
  };
  const section = (title: string) => {
    y += 8;
    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    setColor(accent);
    doc.text(title.toUpperCase(), margin, y, { charSpace: 1.1 });
    y += 6;
    doc.setDrawColor(hairline[0], hairline[1], hairline[2]);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;
  };
  const bullet = (text: string) => {
    const indent = 12;
    const lineHeight = 12.5;
    const lines = doc.splitTextToSize(text, contentWidth - indent) as string[];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    lines.forEach((line, index) => {
      ensureSpace(lineHeight);
      setColor(muted);
      if (index === 0) doc.text("•", margin + 2, y);
      setColor(soft);
      doc.text(line, margin + indent, y);
      y += lineHeight;
    });
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  setColor(ink);
  doc.text(profile.name, margin, y, { charSpace: 0.4 });
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  setColor(accent);
  doc.text(profile.title, margin, y);
  y += 15;

  doc.setFontSize(8.5);
  setColor(muted);
  const contact = [
    profile.links.email,
    profile.links.github?.replace(/^https?:\/\//, ""),
    profile.links.linkedin?.replace(/^https?:\/\//, ""),
    profile.links.domain?.replace(/^https?:\/\//, ""),
    profile.location,
  ]
    .filter(Boolean)
    .join("   •   ");
  doc.text(contact, margin, y);
  y += 10;
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(1.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  paragraph(profile.statement, 9.5, ink, 13);
  if (focus?.note) {
    y += 3;
    paragraph(focus.note, 9, accent, 12, "italic");
  }

  section(labels.experience);
  content.experiences.forEach((experience, index) => {
    if (index > 0) y += 10;
    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(ink);
    doc.text(experience.role, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(muted);
    doc.text(experience.period, pageWidth - margin, y, { align: "right" });
    y += 13;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setColor(soft);
    doc.text(experience.company, margin, y);
    if (experience.location) {
      doc.setFont("helvetica", "normal");
      setColor(muted);
      doc.text(experience.location, pageWidth - margin, y, { align: "right" });
    }
    y += 13;
    if (experience.summary) {
      paragraph(experience.summary, 9, soft, 12);
      y += 2;
    }
    experience.achievements.forEach(bullet);
  });

  section(labels.education);
  content.education.forEach((education, index) => {
    if (index > 0) y += 8;
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setColor(ink);
    doc.text(education.degree, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(muted);
    doc.text(education.period, pageWidth - margin, y, { align: "right" });
    y += 12;
    doc.setFontSize(9.5);
    setColor(soft);
    doc.text(education.school, margin, y);
    y += 12;
  });

  section(labels.expertise);
  orderedExpertise(content.expertise, focus).forEach((group, index) => {
    if (index > 0) y += 7;
    const label = `${group.title}:  `;
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setColor(ink);
    doc.text(label, margin, y);
    const labelWidth = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    setColor(soft);
    const lines = doc.splitTextToSize(
      group.skills.join(", "),
      contentWidth - labelWidth,
    ) as string[];
    doc.text(lines[0] ?? "", margin + labelWidth, y);
    y += 12.5;
    for (const line of lines.slice(1)) {
      ensureSpace(12.5);
      doc.text(line, margin, y);
      y += 12.5;
    }
  });

  section(labels.languages);
  paragraph(
    profile.languages.map((language) => `${language.name} (${language.level})`).join("     •     "),
    9.5,
    soft,
    13,
  );

  return doc;
}

export function downloadResumePdf(
  content: PortfolioContent,
  labels: ResumeExportLabels,
  focus?: ResumeFocus,
) {
  buildResumeDocument(content, labels, focus)?.save(
    resumeFileName("pdf", focus, content.profile?.name),
  );
}

export function printResumePdf(
  content: PortfolioContent,
  labels: ResumeExportLabels,
  focus?: ResumeFocus,
) {
  const doc = buildResumeDocument(content, labels, focus);
  if (!doc) return;
  doc.autoPrint();
  const url = String(doc.output("bloburl"));
  const opened = window.open(url, "_blank");
  if (!opened) window.location.assign(url);
}

export function buildResumeMarkdown(
  content: PortfolioContent,
  labels: ResumeExportLabels,
  focus?: ResumeFocus,
): string {
  const profile = content.profile;
  if (!profile) return "";
  const experience = content.experiences
    .map((item) => {
      const summary = item.summary ? `\n\n${item.summary}` : "";
      const achievements = item.achievements.length
        ? `\n\n${item.achievements.map((achievement) => `- ${achievement}`).join("\n")}`
        : "";
      return `### ${item.role} — ${item.company}\n_${item.period}_${summary}${achievements}`;
    })
    .join("\n\n");
  const education = content.education
    .map((item) => `- **${item.degree}** — ${item.school} (${item.period})`)
    .join("\n");
  const expertise = orderedExpertise(content.expertise, focus)
    .map((group) => `- **${group.title}:** ${group.skills.join(", ")}`)
    .join("\n");
  const languages = profile.languages
    .map((language) => `${language.name} (${language.level})`)
    .join(" · ");
  const contact = [
    profile.links.email,
    profile.links.github,
    profile.links.linkedin,
    profile.location,
  ]
    .filter(Boolean)
    .join(" · ");
  const focusLine = focus?.note ? `\n\n_${focus.note}_` : "";

  return `# ${profile.name}
${profile.title} — ${profile.disciplines.join(" · ")}

${contact}

${profile.statement}${focusLine}

## ${labels.experience}
${experience}

## ${labels.education}
${education}

## ${labels.expertise}
${expertise}

## ${labels.languages}
${languages}
`;
}

export function downloadResumeMarkdown(
  content: PortfolioContent,
  labels: ResumeExportLabels,
  focus?: ResumeFocus,
) {
  const blob = new Blob([buildResumeMarkdown(content, labels, focus)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = resumeFileName("md", focus, content.profile?.name);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
