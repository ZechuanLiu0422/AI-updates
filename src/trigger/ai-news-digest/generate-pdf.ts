import { task } from "@trigger.dev/sdk/v3";
import { NewsItem } from "./fetch-news.js";
import puppeteer from "puppeteer";

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

    // Generate HTML content
    const html = generateHTMLContent(grouped, startDate, endDate);

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return {
      pdfBuffer: Buffer.from(pdfBuffer).toString('base64'),
      dateRange: `${startDate} 至 ${endDate}`,
      summary: generateSummary(grouped),
    };
  },
});

function generateHTMLContent(
  grouped: Record<string, NewsItem[]>,
  startDate: string,
  endDate: string
): string {
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');
    body { font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; border-left: 4px solid #3498db; padding-left: 10px; }
    h3 { color: #555; margin-top: 20px; }
    .meta { color: #7f8c8d; font-size: 0.9em; }
    .summary { background: #ecf0f1; padding: 10px; border-radius: 5px; margin: 10px 0; }
    hr { border: none; border-top: 1px solid #bdc3c7; margin: 20px 0; }
  </style></head><body>`;

  html += `<h1>AI资讯周报</h1>`;
  html += `<p><strong>报告周期</strong>: ${startDate} 至 ${endDate}</p><hr>`;

  html += `<h2>本周概览</h2><ul>`;
  for (const category in grouped) {
    html += `<li><strong>${category}</strong>: ${grouped[category].length} 条资讯</li>`;
  }
  html += `</ul><hr>`;

  for (const category in grouped) {
    html += `<h2>${category}</h2>`;
    for (const item of grouped[category]) {
      html += `<h3>${item.title}</h3>`;
      html += `<p class="meta"><strong>来源</strong>: ${item.source} | <strong>日期</strong>: ${new Date(item.publishedAt).toLocaleDateString("zh-CN")} | <strong>链接</strong>: <a href="${item.url}">${item.url}</a></p>`;
      if (item.summary) {
        html += `<div class="summary">${item.summary}</div>`;
      }
      html += `<hr>`;
    }
  }

  html += `</body></html>`;
  return html;
}

function generateSummary(grouped: Record<string, NewsItem[]>): string {
  const total = Object.values(grouped).reduce((sum, items) => sum + items.length, 0);
  return `本周共收集到 ${total} 条AI相关资讯，涵盖${Object.keys(grouped).join("、")}等领域。`;
}
