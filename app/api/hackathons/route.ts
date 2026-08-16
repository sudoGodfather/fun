import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional().or(z.literal("")),
  startDate: z.string(),
  deadline: z.string(),
  description: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const hackathons = await prisma.hackathon.findMany({
    where: {
      OR: [{ ownerId: userId }, { team: { some: { userId } } }],
    },
    include: {
      owner: { select: { id: true, name: true, username: true } },
      team: { include: { user: { select: { id: true, name: true, username: true, image: true } } } },
    },
    orderBy: { deadline: "asc" },
  });

  return NextResponse.json(hackathons);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, url, startDate, deadline, description } = parsed.data;
  const userId = (session.user as any).id;

  const hackathon = await prisma.hackathon.create({
    data: {
      name,
      url: url || null,
      startDate: new Date(startDate),
      deadline: new Date(deadline),
      description: description || null,
      ownerId: userId,
    },
  });

  return NextResponse.json(hackathon, { status: 201 });
}
