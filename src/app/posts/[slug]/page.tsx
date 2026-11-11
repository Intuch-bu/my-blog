import { connection } from "next/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@/components/ui/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { ArticleInteractions } from "@/components/ArticleInteractions";
import { SiteHeader } from "@/components/SiteHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MarkdownContent } from "@/components/MarkdownContent";

export const instant = false;

function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const [post, session] = await Promise.all([
    prisma.post.findFirst({
      where: { slug, status: "published" },
      include: {
        comments: { orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, name: true } } } },
        _count: { select: { likes: true } },
      },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);
  if (!post) notFound();
  const liked = session ? Boolean(await prisma.like.findUnique({ where: { userId_postId: { userId: session.user.id, postId: post.id } } })) : false;

  return <>
    <SiteHeader user={session ? { name: session.user.name, role: session.user.role ?? "reader" } : null} />
    <main className="page-shell" style={{ maxWidth: 760 }}>
      <Box sx={{ pt: { xs: 4, md: 6 }, pb: 10 }}>
        <Button href="/" startIcon={<ArrowBackRounded />} color="inherit" sx={{ mb: 5, pl: 0 }}>All writing</Button>
        <Typography className="eyebrow" sx={{ mb: 2 }}>{dateLabel(post.publishedAt ?? post.createdAt)}</Typography>
        <Typography component="h1" variant="h1" sx={{ fontSize: { xs: 44, sm: 58, md: 66 }, lineHeight: 1.06, mb: 3.5 }}>{post.title}</Typography>
        <Divider sx={{ mb: 4 }} />
        <MarkdownContent content={post.content} />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 4, color: "text.secondary" }}>
          <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "#e4e9e1" }} />
          <Typography variant="body2">A note by the author</Typography>
        </Stack>
        <Divider sx={{ my: 5 }} />
        <ArticleInteractions
          slug={post.slug}
          initialComments={post.comments.map((comment) => ({ id: comment.id, content: comment.content, createdAt: comment.createdAt.toISOString(), userId: comment.userId, name: comment.user.name }))}
          initialLiked={liked}
          initialLikeCount={post._count.likes}
          user={session ? { id: session.user.id, name: session.user.name, role: session.user.role ?? "reader" } : null}
        />
      </Box>
    </main>
  </>;
}
