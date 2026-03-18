import { task } from "@trigger.dev/sdk/v3";
import { NewsItem } from "./fetch-news.js";
import * as fs from "fs";
import * as path from "path";

interface GeneratePDFPayload {
  news: NewsItem[];
  startDate: string;
  endDate: string;
}

export const generatePDF = task({
  id: "generate-ai-news-pdf",
  run: async (payload: GeneratePDFPayload) => {
    const { news, startDate, endDate } = payload;

    // Group news by category
    const grouped: Record<string, NewsItem[]> = {};
    for (const item of news) {
      const category = item.category || "其他";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    }

    // Limit items per category
    for (const category in grouped) {
      grouped[category] = grouped[category].slice(0, 30);
    }

    // Generate markdown content for PDF
    const markdown = generateMarkdownContent(grouped, startDate, endDate);

    // Save to temp file
    const tempDir = "/tmp";
    const mdPath = path.join(tempDir, `ai-news-${Date.now()}.md`);
    const pdfPath = path.join(tempDir, `AI-Weekly-Digest-${startDate}-to-${endDate}.pdf`);

    fs.writeFileSync(mdPath, markdown);

    // Here we would call the pdf skill to convert markdown to PDF
    // For now, return the paths
    return {
      pdfPath,
      mdPath,
      dateRange: `${startDate} 至 ${endDate}`,
      summary: generateSummary(grouped),
    };
  },
});

function generateMarkdownContent(
  grouped: Record<string, NewsItem[]>,
  startDate: string,
  endDate: string
): string {
  let md = `# AI资讯周报\n\n`;
  md += `**报告周期**: ${startDate} 至 ${endDate}\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## 本周概览\n\n`;
  for (const category in grouped) {
    md += `- **${category}**: ${grouped[category].length} 条资讯\n`;
  }
  md += `\n---\n\n`;

  // Content by category
  for (const category in grouped) {
    md += `## ${category}\n\n`;

    for (const item of grouped[category]) {
      md += `### ${item.title}\n\n`;
      md += `**来源**: ${item.source}  \n`;
      md += `**日期**: ${new Date(item.publishedAt).toLocaleDateString("zh-CN")}  \n`;
      md += `**链接**: ${item.url}\n\n`;

      if (item.summary) {
        md += `${item.summary}\n\n`;
      }

      md += `---\n\n`;
    }
  }

  return md;
}

function generateSummary(grouped: Record<string, NewsItem[]>): string {
  const total = Object.values(grouped).reduce((sum, items) => sum + items.length, 0);
  return `本周共收集到 ${total} 条AI相关资讯，涵盖${Object.keys(grouped).join("、")}等领域。`;
}
