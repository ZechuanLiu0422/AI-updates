// 简单的邮件发送测试脚本
import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('正在发送测试邮件...');

    const result = await resend.emails.send({
      from: 'AI News <onboarding@resend.dev>',
      to: process.env.RECIPIENT_EMAIL,
      subject: 'AI资讯周报 - 测试邮件',
      text: `您好！

这是一封测试邮件，用于验证AI资讯周报系统的邮件发送功能。

系统配置：
- 收件人：${process.env.RECIPIENT_EMAIL}
- 发送时间：${new Date().toLocaleString('zh-CN')}

如果您收到这封邮件，说明邮件发送功能正常工作！

下一步：
1. 系统会在每周一早上9点（北京时间）自动运行
2. 届时会发送包含PDF附件的完整周报

祝好！`,
    });

    console.log('✅ 邮件发送成功！');
    console.log('邮件ID:', result.data?.id);
    console.log('请检查邮箱:', process.env.RECIPIENT_EMAIL);
  } catch (error) {
    console.error('❌ 邮件发送失败:', error.message);
  }
}

testEmail();
