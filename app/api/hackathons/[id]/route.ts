import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertOwner(hackathonId: string, userId: string) {
  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
  if (!hackathon) return null;
  if (hackathon.ownerId !== userId) return "forbidden";
  return hackathon;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, username: true } },
      team: { include: { user: { select: { id: true, name: true, username: true, image: true } } } },
    },
  });
  if (!hackathon) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(hackathon);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertOwner(params.id, (session.user as any).id);
  if (check === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (check === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const data: any = {};
  if (body.name) data.name = body.name;
  if (body.url !== undefined) data.url = body.url || null;
  if (body.startDate) data.startDate = new Date(body.startDate);
  if (body.deadline) {
    data.deadline = new Date(body.deadline);
    data.reminderSentAt = null; // deadline changed, allow reminder to fire again
  }
  if (body.description !== undefined) data.description = body.description;

  const updated = await prisma.hackathon.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertOwner(params.id, (session.user as any).id);
  if (check === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (check === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.hackathon.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
