import { getApiClient } from "@/lib/api";
import { careerYears, normalizeContent, type PortfolioContent } from "@/lib/content";

function fileStem(name: string): string {
  return (
    name
      .trim()
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "portfolio"
  );
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadCanonicalResume(name: string) {
  const anchor = document.createElement("a");
  anchor.href = "/files/ahmed-sghaier-resume.pdf";
  anchor.download = `${fileStem(name)}-resume.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function buildBioMarkdown(content: PortfolioContent): string {
  const profile = content.profile;
  if (!profile) return "";

  const roles = content.experiences
    .filter((experience) => experience.featured)
    .map(
      (experience) =>
        `- **${experience.role}**, ${experience.company} — ${experience.period}${
          experience.summary ? `\n  ${experience.summary}` : ""
        }`,
    )
    .join("\n");
  const education = content.education
    .map((item) => `- ${item.degree}, ${item.school} (${item.period})`)
    .join("\n");
  const focus = content.expertise
    .slice(0, 6)
    .map((item) => item.title)
    .join(" · ");
  const languages = profile.languages
    .map((language) => `${language.name} (${language.level})`)
    .join(", ");
  const links = [
    profile.links.github ? `- GitHub: ${profile.links.github}` : "",
    profile.links.linkedin ? `- LinkedIn: ${profile.links.linkedin}` : "",
    profile.links.email ? `- Email: mailto:${profile.links.email}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `# ${profile.name}
${profile.title} · ${profile.location}

${profile.positioning}

${profile.statement}

**Experience:** ${careerYears(content.experiences)}+ years across enterprise and data-intensive systems.
**Focus:** ${focus}
**Languages:** ${languages}
**Availability:** ${profile.availability}
${profile.workAuthorization ? `**Work authorization:** ${profile.workAuthorization}\n` : ""}
## Selected roles
${roles}

## Education
${education}

## Links
${links}

_Generated from ${profile.links.domain ?? "this portfolio"} — verified information only._
`;
}

export function downloadBioMarkdown(content: PortfolioContent) {
  const profile = content.profile;
  if (!profile) return;
  saveBlob(
    new Blob([buildBioMarkdown(content)], { type: "text/markdown;charset=utf-8" }),
    `${fileStem(profile.name)}-bio.md`,
  );
}

interface PdfLine {
  text: string;
  size?: number;
  bold?: boolean;
  gap?: number;
}

function plainAscii(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[—–]/g, "-")
    .replace(/[•·]/g, "|")
    .replace(/[^\x20-\x7e]/g, "?");
}

function pdfText(value: string): string {
  return plainAscii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(value: string, width: number): string[] {
  const words = plainAscii(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function createPdf(lines: PdfLine[]): Blob {
  let y = 792;
  const commands: string[] = ["BT", "0.11 0.12 0.15 rg"];

  for (const line of lines) {
    const size = line.size ?? 9;
    if (y < 45) break;
    commands.push(`/${line.bold ? "F2" : "F1"} ${size} Tf`);
    commands.push(`1 0 0 1 48 ${y} Tm`);
    commands.push(`(${pdfText(line.text)}) Tj`);
    y -= line.gap ?? size + 4;
  }
  commands.push("ET");
  const stream = commands.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let document = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(document.length);
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = document.length;
  document += `xref\n0 ${objects.length + 1}\n`;
  document += "0000000000 65535 f \n";
  document += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([document], { type: "application/pdf" });
}

export async function downloadBioPdf(content: PortfolioContent, locale = "en") {
  let pdfContent = content;
  if (locale !== "en") {
    try {
      pdfContent = normalizeContent(await getApiClient().getPublicContent("en"));
    } catch {
      downloadCanonicalResume(content.profile?.name ?? "resume");
      return;
    }
  }

  const profile = pdfContent.profile;
  if (!profile) return;

  const lines: PdfLine[] = [
    { text: profile.name, size: 22, bold: true, gap: 26 },
    {
      text: `${profile.title} - ${profile.location}`,
      size: 11,
      gap: 20,
    },
    ...wrap(profile.positioning, 78).map((text) => ({
      text,
      size: 11,
      bold: true,
      gap: 15,
    })),
    { text: "", gap: 5 },
    ...wrap(profile.statement, 96).map((text) => ({ text, size: 9, gap: 12 })),
    { text: "PROFILE", size: 10, bold: true, gap: 16 },
    {
      text: `Experience: ${careerYears(pdfContent.experiences)}+ years across enterprise and data-intensive systems`,
    },
    {
      text: `Focus: ${pdfContent.expertise
        .slice(0, 6)
        .map((item) => item.title)
        .join(" | ")}`,
    },
    {
      text: `Languages: ${profile.languages
        .map((language) => `${language.name} (${language.level})`)
        .join(", ")}`,
    },
    { text: "SELECTED ROLES", size: 10, bold: true, gap: 16 },
  ];

  pdfContent.experiences
    .filter((experience) => experience.featured)
    .slice(0, 5)
    .forEach((experience) => {
      lines.push({
        text: `${experience.role} - ${experience.company} | ${experience.period}`,
        bold: true,
        size: 9,
        gap: 12,
      });
      if (experience.summary) {
        lines.push(
          ...wrap(experience.summary, 102)
            .slice(0, 2)
            .map((text) => ({ text, size: 8, gap: 11 })),
        );
      }
      lines.push({ text: "", gap: 4 });
    });

  lines.push({ text: "EDUCATION", size: 10, bold: true, gap: 16 });
  pdfContent.education.forEach((item) => {
    lines.push({ text: `${item.degree} - ${item.school} | ${item.period}`, size: 8.5 });
  });
  lines.push({ text: "LINKS", size: 10, bold: true, gap: 16 });
  if (profile.links.email) lines.push({ text: `Email: ${profile.links.email}`, size: 8.5 });
  if (profile.links.github) lines.push({ text: `GitHub: ${profile.links.github}`, size: 8.5 });
  if (profile.links.linkedin)
    lines.push({ text: `LinkedIn: ${profile.links.linkedin}`, size: 8.5 });

  saveBlob(createPdf(lines), `${fileStem(profile.name)}-bio.pdf`);
}
