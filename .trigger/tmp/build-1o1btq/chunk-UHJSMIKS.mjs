import {
  task
} from "./chunk-GT2KMGP3.mjs";
import {
  __name,
  init_esm
} from "./chunk-3VTTNDYQ.mjs";

// src/trigger/ai-news-digest/generate-pdf.ts
init_esm();
import * as fs from "fs";
import * as path from "path";
var generatePDF = task({
  id: "generate-ai-news-pdf",
  run: /* @__PURE__ */ __name(async (payload) => {
    const { news, startDate, endDate } = payload;
    const grouped = {};
    for (const item of news) {
      const category = item.category || "其他";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    }
    for (const category in grouped) {
      grouped[category] = grouped[category].slice(0, 30);
    }
    const markdown = generateMarkdownContent(grouped, startDate, endDate);
    const tempDir = "/tmp";
    const mdPath = path.join(tempDir, `ai-news-${Date.now()}.md`);
    const pdfPath = path.join(tempDir, `AI-Weekly-Digest-${startDate}-to-${endDate}.pdf`);
    fs.writeFileSync(mdPath, markdown);
    return {
      pdfPath,
      mdPath,
      dateRange: `${startDate} 至 ${endDate}`,
      summary: generateSummary(grouped)
    };
  }, "run")
});
function generateMarkdownContent(grouped, startDate, endDate) {
  let md = `# AI资讯周报

`;
  md += `**报告周期**: ${startDate} 至 ${endDate}

`;
  md += `---

`;
  md += `## 本周概览

`;
  for (const category in grouped) {
    md += `- **${category}**: ${grouped[category].length} 条资讯
`;
  }
  md += `
---

`;
  for (const category in grouped) {
    md += `## ${category}

`;
    for (const item of grouped[category]) {
      md += `### ${item.title}

`;
      md += `**来源**: ${item.source}  
`;
      md += `**日期**: ${new Date(item.publishedAt).toLocaleDateString("zh-CN")}  
`;
      md += `**链接**: ${item.url}

`;
      if (item.summary) {
        md += `${item.summary}

`;
      }
      md += `---

`;
    }
  }
  return md;
}
__name(generateMarkdownContent, "generateMarkdownContent");
function generateSummary(grouped) {
  const total = Object.values(grouped).reduce((sum, items) => sum + items.length, 0);
  return `本周共收集到 ${total} 条AI相关资讯，涵盖${Object.keys(grouped).join("、")}等领域。`;
}
__name(generateSummary, "generateSummary");

export {
  generatePDF
};
//# sourceMappingURL=chunk-UHJSMIKS.mjs.map
