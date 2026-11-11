import { NextResponse } from "next/server";
import { isAuthor } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/slug";

export async function GET(request: Request) {
  if (!await isAuthor(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  if (!await isAuthor(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: { title?: unknown; content?: unknown; status?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
  const content = typeof body.content === "string" ? body.content.slice(0, 20_000) : "";
  const status = body.status === "published" ? "published" : "draft";
  if (status === "published" && (!title || !content.trim())) return NextResponse.json({ error: "Add a title and some writing before publishing." }, { status: 400 });
  const post = await prisma.post.create({
    data: {
      title: title || "Untitled draft", content, status,
      slug: `${makeSlug(title || "untitled")}-${crypto.randomUUID().slice(0, 6)}`,
      publishedAt: status === "published" ? new Date() : null,
    },
  });
  return NextResponse.json(post, { status: 201 });
}
