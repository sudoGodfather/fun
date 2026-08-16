import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "re_missing_key_placeholder");
  }
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "Hackathon Tracker <onboarding@resend.dev>";

export async function sendMagicLinkEmail(to: string, url: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Sign in to Hackathon Tracker",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#2B2E3D;">Sign in to Hackathon Tracker</h2>
        <p style="color:#6B7186;">Click the button below to sign in. This link expires in 24 hours.</p>
        <a href="${url}" style="display:inline-block; margin-top:16px; padding:12px 24px; background:#7C6CF5; color:white; border-radius:12px; text-decoration:none;">Sign in</a>
        <p style="color:#9096ab; font-size:12px; margin-top:24px;">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendOtpEmail(to: string, code: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `${code} is your Hackathon Tracker code`,
    html: `<p style="font-family:sans-serif;font-size:16px;">Your verification code is <b style="font-size:22px;letter-spacing:4px;">${code}</b>. It expires in 10 minutes.</p>`,
  });
}

export async function sendDeadlineReminderEmail(
  to: string,
  params: { hackathonName: string; hackathonUrl?: string | null; deadline: Date; recipientName?: string | null }
) {
  const { hackathonName, hackathonUrl, deadline, recipientName } = params;
  const formatted = deadline.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `⏰ ${hackathonName} deadline is tomorrow`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#2B2E3D;">Deadline reminder</h2>
        <p style="color:#6B7186;">Hi${recipientName ? " " + recipientName : ""}, this is a reminder that
        <b>${hackathonName}</b> is due in about 24 hours.</p>
        <p style="color:#2B2E3D;"><b>Deadline:</b> ${formatted}</p>
        ${hackathonUrl ? `<a href="${hackathonUrl}" style="display:inline-block; margin-top:12px; padding:10px 20px; background:#7C6CF5; color:white; border-radius:12px; text-decoration:none;">View hackathon</a>` : ""}
        <p style="color:#9096ab; font-size:12px; margin-top:24px;">Sent by Hackathon Tracker.</p>
      </div>
    `,
  });
}
