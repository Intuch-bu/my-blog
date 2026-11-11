import { NextResponse } from "next/server";
import { getSession } from "@/lib/access";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, ctx: Context) {
  const { slug } = await ctx.params;
  const post = await prisma.post.findFirst({ where: { slug, status: "published" }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  const comments = await prisma.comment.findMany({
    where: { postId: post.id }, orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json(comments.map(({ id, content, createdAt, userId, user }) => ({ id, content, createdAt, userId, name: user.name })));
}

export async function POST(request: Request, ctx: Context) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  const { slug } = await ctx.params;
  const post = await prisma.post.findFirst({ where: { slug, status: "published" }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const recentCount = await prisma.comment.count({
    where: { userId: session.user.id, createdAt: { gte: new Date(Date.now() - 60_000) } },
  });
  if (recentCount >= 5) return NextResponse.json({ error: "Please wait a minute before commenting again." }, { status: 429 });

  let body: { content?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content || content.length > 1000) return NextResponse.json({ error: "Comments must be between 1 and 1,000 characters." }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { content, postId: post.id, userId: session.user.id },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json({ id: comment.id, content: comment.content, createdAt: comment.createdAt, userId: comment.userId, name: comment.user.name }, { status: 201 });
}

export async function PATCH(request: Request, ctx: Context) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Sign in to edit comments." }, { status: 401 });
  const { slug } = await ctx.params;
  let body: { id?: unknown; content?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (typeof body.id !== "string" || !content || content.length > 1000) return NextResponse.json({ error: "Invalid comment." }, { status: 400 });
  const comment = await prisma.comment.findFirst({
    where: { id: body.id, userId: session.user.id, post: { slug, status: "published" } },
  });
  if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  const updated = await prisma.comment.update({ where: { id: comment.id }, data: { content } });
  return NextResponse.json({ id: updated.id, content: updated.content, createdAt: updated.createdAt, userId: session.user.id, name: session.user.name });
}

export async function DELETE(request: Request, ctx: Context) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Sign in to delete comments." }, { status: 401 });
  const { slug } = await ctx.params;
  let body: { id?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.id !== "string") return NextResponse.json({ error: "Invalid comment." }, { status: 400 });
  const comment = await prisma.comment.findFirst({
    where: { id: body.id, post: { slug, status: "published" } },
    include: { post: { select: { id: true } } },
  });
  if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  if (comment.userId !== session.user.id && session.user.role !== "author") return NextResponse.json({ error: "You cannot delete this comment." }, { status: 403 });
  await prisma.comment.delete({ where: { id: comment.id } });
  return NextResponse.json({ ok: true });
}
