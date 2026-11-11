import { connection } from "next/server";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@/components/ui/Stack";
import Typography from "@mui/material/Typography";
import { headers } from "next/headers";
import { PostFeed } from "@/components/PostFeed";
import { SiteHeader } from "@/components/SiteHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function Home() {
  await connection();
  const [posts, session] = await Promise.all([
    prisma.post.findMany({
      where: { status: "published" }, orderBy: { publishedAt: "desc" }, take: 6,
      include: { _count: { select: { likes: true, comments: true } } },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  return <>
    <SiteHeader user={session ? { name: session.user.name, role: session.user.role ?? "reader" } : null} />
    <main className="page-shell journal-page">
      <Box component="section" className="journal-intro">
        <Box className="journal-intro-main">
          <Typography className="eyebrow">Personal blog / Articles & notes</Typography>
          <Typography component="h1" variant="h1" className="hero-title">Writing<br />&amp; notes.</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 430, lineHeight: 1.85, mt: 2.5 }}>Thoughts, observations, and stories.<br />Short articles from one writer.</Typography>
          <Button href="#writing" variant="contained" sx={{ mt: 3 }}>Browse articles <span aria-hidden="true" style={{ marginLeft: 20 }}>↓</span></Button>
        </Box>
        <Box component="aside" className="journal-intro-side">
          <Typography className="eyebrow">About this space</Typography>
          <Typography sx={{ fontSize: 20, lineHeight: 1.6, mt: 2 }}>A personal space<br />for ideas and stories.</Typography>
          <Divider sx={{ my: 3 }} />
          <Typography color="text.secondary" sx={{ fontSize: 14, lineHeight: 1.9 }}>Read every article without an account. Sign in to leave a comment or like a post.</Typography>
          <Typography className="eyebrow" sx={{ mt: 4 }}>Thai / English</Typography>
        </Box>
      </Box>
      <Divider />
      <Box id="writing" component="section" sx={{ pb: { xs: 4, md: 6 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="end" sx={{ py: 2.5, px: { xs: 2, md: 3 }, borderBottom: "1px solid", borderColor: "divider", gap: 2, flexWrap: "wrap" }}>
          <Box><Typography className="eyebrow" sx={{ mb: 1 }}>01 / Journal</Typography><Typography variant="h2" sx={{ fontSize: 34 }}>Latest articles</Typography></Box>
          <Typography variant="body2" color="text.secondary">{posts.length ? "Newest first" : "No published articles yet"}</Typography>
        </Stack>
        <PostFeed initialPosts={posts.map((post) => ({ ...post, publishedAt: post.publishedAt?.toISOString() ?? null }))} initialSkip={6} />
      </Box>
    </main>
    <footer className="page-shell"><Divider /><Stack direction="row" justifyContent="space-between" sx={{ py: 3.5 }}><Typography className="wordmark" sx={{ fontSize: 18 }}>my blog.</Typography><Typography variant="caption" color="text.secondary">Personal blog / {new Date().getFullYear()}</Typography></Stack></footer>
  </>;
}
