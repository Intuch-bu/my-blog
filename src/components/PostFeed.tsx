"use client";

import { useState } from "react";
import removeMarkdown from "remove-markdown";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@/components/ui/Stack";
import Typography from "@mui/material/Typography";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";

export type FeedPost = {
  id: string; title: string; slug: string; content: string; publishedAt: string | null;
  _count: { likes: number; comments: number };
};

function dateLabel(date: string | null) {
  return date ? new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(date)) : "";
}

export function PostFeed({ initialPosts, initialSkip }: { initialPosts: FeedPost[]; initialSkip: number }) {
  const [posts, setPosts] = useState(initialPosts);
  const [skip, setSkip] = useState(initialSkip);
  const [hasMore, setHasMore] = useState(initialPosts.length === initialSkip);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMore = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/posts?skip=${skip}`);
      if (!response.ok) throw new Error("Could not load more articles.");
      const data: FeedPost[] = await response.json();
      setPosts((current) => [...current, ...data]);
      setSkip((current) => current + data.length);
      setHasMore(data.length === initialSkip);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setLoading(false); }
  };

  if (posts.length === 0) return <Box className="journal-empty"><Typography className="eyebrow">No entries yet</Typography><Typography variant="h3" sx={{ fontSize: 28, mt: 2 }}>No articles yet</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Published articles will appear here.</Typography></Box>;

  return <>
    <Box className="post-grid">
      {posts.map((post, index) => <Box key={post.id}>
        <Card component="a" href={`/posts/${post.slug}`} variant="outlined" className="post-card" sx={{ height: "100%", border: 0, borderRadius: 0, bgcolor: "background.paper", borderColor: "divider", color: "inherit", display: "block" }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography className="eyebrow">{String(index + 1).padStart(2, "0")} / {dateLabel(post.publishedAt)}</Typography>
              <ArrowOutwardRounded sx={{ color: "text.secondary", fontSize: 18 }} />
            </Stack>
            <Typography variant="h3" sx={{ fontSize: { xs: 27, md: 31 }, lineHeight: 1.15, mb: 1.5 }}>{post.title}</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.75, minHeight: 58 }}>
              {removeMarkdown(post.content).replace(/\s+/g, " ").trim().slice(0, 150)}{removeMarkdown(post.content).length > 150 ? "…" : ""}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3.5, pt: 2, borderTop: "1px solid", borderColor: "divider", color: "text.secondary" }}>
              <Stack direction="row" spacing={0.6} alignItems="center"><FavoriteBorderRounded sx={{ fontSize: 16 }} /><Typography variant="caption">{post._count.likes}</Typography></Stack>
              <Typography variant="caption">{post._count.comments} comments</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>)}
    </Box>
    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    {hasMore && <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><Button onClick={loadMore} disabled={loading} variant="outlined" color="inherit">{loading ? "Loading…" : "Load more"}</Button></Box>}
  </>;
}
