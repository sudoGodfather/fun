import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const addSchema = z.object({
  // Provide either a username (for a registered user) or a name/email pair
  username: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hackathon = await prisma.hackathon.findUnique({ where: { id: params.id } });
  if (!hackathon) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (hackathon.ownerId !== (session.user as any).id) {
    return NextResponse.json({ error: "Only the owner can add teammates" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { username, name, email } = parsed.data;

  if (username) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: `No registered user found with username "${username}"` }, { status: 404 });
    }

    const already = await prisma.teamMember.findUnique({
      where: { hackathonId_userId: { hackathonId: params.id, userId: user.id } },
    });
    if (already) return NextResponse.json({ error: "Already on the team" }, { status: 409 });

    const member = await prisma.teamMember.create({
      data: { hackathonId: params.id, userId: user.id },
      include: { user: { select: { id: true, name: true, username: true, image: true } } },
    });
    return NextResponse.json(member, { status: 201 });
  }

  if (name || email) {
    const member = await prisma.teamMember.create({
      data: { hackathonId: params.id, name: name || null, email: email || null },
    });
    return NextResponse.json(member, { status: 201 });
  }

  return NextResponse.json({ error: "Provide a username, or a name/email" }, { status: 400 });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hackathon = await prisma.hackathon.findUnique({ where: { id: params.id } });
  if (!hackathon) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (hackathon.ownerId !== (session.user as any).id) {
    return NextResponse.json({ error: "Only the owner can remove teammates" }, { status: 403 });
  }

  const { memberId } = await req.json();
  await prisma.teamMember.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
