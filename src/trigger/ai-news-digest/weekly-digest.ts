import { schedules } from "@trigger.dev/sdk/v3";
import { fetchNews } from "./fetch-news.js";
import { generatePDF } from "./generate-pdf.js";
import { sendEmail } from "./send-email.js";

export const weeklyDigest = schedules.task({
  id: "ai-news-weekly-digest",
  cron: "0 1 * * 1", // Every Monday at 1 AM UTC (9 AM Beijing time)
  run: async () => {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    // Step 1: Fetch news
    const newsResult = await fetchNews.triggerAndWait({});
    if (!newsResult.ok) {
      throw new Error("Failed to fetch news");
    }

    const news = newsResult.output;
    console.log(`Fetched ${news.length} news items`);

    // Step 2: Generate PDF
    const pdfResult = await generatePDF.triggerAndWait({
      news,
      startDate: startStr,
      endDate: endStr,
    });

    if (!pdfResult.ok) {
      throw new Error("Failed to generate PDF");
    }

    const { pdfPath, dateRange, summary } = pdfResult.output;

    // Step 3: Send email
    const emailResult = await sendEmail.triggerAndWait({
      pdfPath,
      dateRange,
      summary,
    });

    if (!emailResult.ok) {
      throw new Error("Failed to send email");
    }

    return {
      success: true,
      newsCount: news.length,
      recipient: emailResult.output.recipient,
      dateRange,
    };
  },
});
