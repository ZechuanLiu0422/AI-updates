import {
  fetchNews
} from "../../../../../../chunk-HHQP57SM.mjs";
import {
  generatePDF
} from "../../../../../../chunk-UHJSMIKS.mjs";
import {
  sendEmail
} from "../../../../../../chunk-6VJ5EN34.mjs";
import {
  schedules_exports
} from "../../../../../../chunk-GT2KMGP3.mjs";
import "../../../../../../chunk-SZ6GL6S4.mjs";
import {
  __name,
  init_esm
} from "../../../../../../chunk-3VTTNDYQ.mjs";

// src/trigger/ai-news-digest/weekly-digest.ts
init_esm();
var weeklyDigest = schedules_exports.task({
  id: "ai-news-weekly-digest",
  cron: "0 1 * * 1",
  // Every Monday at 1 AM UTC (9 AM Beijing time)
  run: /* @__PURE__ */ __name(async () => {
    const endDate = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - 7);
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];
    const newsResult = await fetchNews.triggerAndWait({});
    if (!newsResult.ok) {
      throw new Error("Failed to fetch news");
    }
    const news = newsResult.output;
    console.log(`Fetched ${news.length} news items`);
    const pdfResult = await generatePDF.triggerAndWait({
      news,
      startDate: startStr,
      endDate: endStr
    });
    if (!pdfResult.ok) {
      throw new Error("Failed to generate PDF");
    }
    const { pdfPath, dateRange, summary } = pdfResult.output;
    const emailResult = await sendEmail.triggerAndWait({
      pdfPath,
      dateRange,
      summary
    });
    if (!emailResult.ok) {
      throw new Error("Failed to send email");
    }
    return {
      success: true,
      newsCount: news.length,
      recipient: emailResult.output.recipient,
      dateRange
    };
  }, "run")
});
export {
  weeklyDigest
};
//# sourceMappingURL=weekly-digest.mjs.map
