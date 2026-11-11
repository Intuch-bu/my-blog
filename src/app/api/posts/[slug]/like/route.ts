import { NextResponse } from "next/server";
import { getSession } from "@/lib/access";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ slug: string }> };

export async function POST(request: Request, ctx: Context) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Sign in to like this article." }, { status: 401 });
  const { slug } = await ctx.params;
  const post = await prisma.post.findFirst({ where: { slug, status: "published" }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Article not found." }, { status: 404 });
  const existing = await prisma.like.findUnique({ where: { userId_postId: { userId: session.user.id, postId: post.id } } });
  const liked = existing
    ? (await prisma.like.delete({ where: { id: existing.id } }), false)
    : (await prisma.like.create({ data: { userId: session.user.id, postId: post.id } }), true);
  const count = await prisma.like.count({ where: { postId: post.id } });
  return NextResponse.json({ liked, count });
}
