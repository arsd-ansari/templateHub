import type { FaqItem } from "@/types";

export function extractFaqsFromMarkdown(markdown: string): FaqItem[] {
  const headingMatch = markdown.match(/^##\s+(FAQ|Frequently Asked Questions).*$/im);
  if (!headingMatch || headingMatch.index === undefined) return [];

  const start = headingMatch.index + headingMatch[0].length;
  const rest = markdown.slice(start);
  const nextH2 = rest.match(/^##\s+(?!#)/m);
  const section = nextH2 && nextH2.index !== undefined ? rest.slice(0, nextH2.index) : rest;

  const faqs: FaqItem[] = [];
  const questionRegex = /^###\s+(.+?)\s*$/gm;
  const matches = [...section.matchAll(questionRegex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const question = match[1].trim();
    const answerStart = (match.index ?? 0) + match[0].length;
    const answerEnd = i + 1 < matches.length ? matches[i + 1].index ?? section.length : section.length;
    const answer = section
      .slice(answerStart, answerEnd)
      .replace(/^\s+|\s+$/g, "")
      .replace(/\s+/g, " ");
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}
