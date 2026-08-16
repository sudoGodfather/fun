import { NextResponse } from "next/server";
import { z } from "zod";
import { issueOtp } from "@/lib/otp";

const schema = z.object({ phone: z.string().min(8) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }

  await issueOtp(parsed.data.phone);
  return NextResponse.json({ ok: true });
}
