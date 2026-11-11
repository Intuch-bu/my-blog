import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const skip = Math.max(0, Math.min(Number(new URL(request.url).searchParams.get("skip")) || 0, 10_000));
  const posts = await prisma.post.findMany({
    where: { status: "published" }, orderBy: { publishedAt: "desc" }, skip, take: 6,
    include: { _count: { select: { likes: true, comments: true } } },
  });
  return NextResponse.json(posts);
}
