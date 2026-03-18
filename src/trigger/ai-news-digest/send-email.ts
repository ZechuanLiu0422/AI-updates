import { task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import * as fs from "fs";

interface EmailPayload {
  pdfPath: string;
  dateRange: string;
  summary: string;
}

export const sendEmail = task({
  id: "send-ai-news-email",
  run: async (payload: EmailPayload) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.RECIPIENT_EMAIL;

    if (!resendApiKey || !recipient) {
      throw new Error("Missing RESEND_API_KEY or RECIPIENT_EMAIL");
    }

    const resend = new Resend(resendApiKey);

    const pdfBuffer = fs.readFileSync(payload.pdfPath);

    await resend.emails.send({
      from: "AI News <onboarding@resend.dev>",
      to: recipient,
      subject: `AI资讯周报 - ${payload.dateRange}`,
      text: `您好！\n\n这是本周的AI资讯周报（${payload.dateRange}）。\n\n${payload.summary}\n\n详细内容请查看附件PDF报告。\n\n祝好！`,
      attachments: [
        {
          filename: `AI-Weekly-Digest-${payload.dateRange}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return { success: true, recipient };
  },
});
