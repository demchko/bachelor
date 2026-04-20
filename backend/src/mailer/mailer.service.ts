import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';

    if (!host || !user || !pass) {
      this.transporter = null;
      this.logger.warn(
        'SMTP is not fully configured. Verification emails will be logged instead of sent.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const from = this.configService.get<string>('MAIL_FROM') ?? 'no-reply@lpnu.ua';
    const frontendBaseUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    const verifyUrl = `${frontendBaseUrl}/verify-email?token=${encodeURIComponent(
      token,
    )}&email=${encodeURIComponent(email)}`;

    if (!this.transporter) {
      this.logger.log(`Verification token for ${email}: ${token}`);
      return;
    }

    const html = this.buildVerificationEmailHtml(verifyUrl, email);
    const text =
      `IRB Explorer - Email Verification\n\n` +
      `Hello,\n\n` +
      `Use this link to verify your account:\n${verifyUrl}\n\n` +
      `If you did not create an account, ignore this email.\n`;

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'IRB Explorer - verify your email',
        text,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}. Falling back to console token.`,
      );
      this.logger.log(`Verification token for ${email}: ${token}`);
      this.logger.error(error as Error);
    }
  }

  private buildVerificationEmailHtml(verifyUrl: string, email: string): string {
    return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>IRB Explorer Email Verification</title>
  </head>
  <body style="margin:0;background:#f4f6fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:#0c1730;padding:20px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="color:#f9fafb;font-size:20px;font-weight:700;">IRB Explorer</td>
                    <td align="right" style="color:#9ca3af;font-size:13px;">Account Security</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 14px 24px;">
                <div style="font-size:22px;line-height:1.35;font-weight:700;color:#0f172a;">Verify your email</div>
                <div style="margin-top:12px;font-size:15px;line-height:1.6;color:#334155;">
                  We received a registration request for <strong style="color:#0f172a;">${email}</strong>.
                  Confirm your account to continue using IRB Explorer.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 8px 24px;">
                <a href="${verifyUrl}" style="display:inline-block;background:#f59e0b;color:#111827;text-decoration:none;font-weight:700;font-size:15px;padding:12px 18px;border-radius:10px;">
                  Verify Account
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 0 24px;font-size:13px;color:#64748b;line-height:1.6;">
                If the button does not work, open this link manually:
              </td>
            </tr>
            <tr>
              <td style="padding:6px 24px 18px 24px;">
                <a href="${verifyUrl}" style="font-size:13px;line-height:1.5;color:#2563eb;word-break:break-word;">${verifyUrl}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 22px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;line-height:1.6;">
                If you did not create this account, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  }
}
