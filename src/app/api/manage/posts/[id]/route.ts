import { NextResponse } from "next/server";
import { isAuthor } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/slug";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Context) {
  if (!await isAuthor(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  let body: { title?: unknown; content?: unknown; status?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const current = await prisma.post.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Article not found." }, { status: 404 });
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : current.title;
  const content = typeof body.content === "string" ? body.content.slice(0, 20_000) : current.content;
  const status = body.status === "published" ? "published" : body.status === "draft" ? "draft" : current.status;
  if (status === "published" && (!title || !content.trim())) return NextResponse.json({ error: "Add a title and some writing before publishing." }, { status: 400 });
  const post = await prisma.post.update({ where: { id }, data: {
    title: title || "Untitled draft", content, status,
    slug: `${makeSlug(title || "untitled")}-${id.slice(-6)}`,
    publishedAt: status === "published" ? current.publishedAt ?? new Date() : null,
  } });
  return NextResponse.json(post);
}

export async function DELETE(request: Request, ctx: Context) {
  if (!await isAuthor(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Article not found." }, { status: 404 });
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
