import { prisma } from "./prisma";
import twilio from "twilio";

const client =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function issueOtp(target: string) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otpCode.create({ data: { target, code, expiresAt } });

  if (client && process.env.TWILIO_PHONE_NUMBER) {
    await client.messages.create({
      to: target,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: `${code} is your Hackathon Tracker verification code. It expires in 10 minutes.`,
    });
  } else {
    // No Twilio configured — log to server console so local dev still works.
    console.log(`[dev] OTP for ${target}: ${code}`);
  }

  return code;
}

export async function verifyOtp(target: string, code: string) {
  const record = await prisma.otpCode.findFirst({
    where: { target, code, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return false;

  await prisma.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
  return true;
}
