"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@/components/ui/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import { SiteHeader } from "@/components/SiteHeader";
import { MarkdownContent } from "@/components/MarkdownContent";

type ManagedPost = { id: string; title: string; content: string; status: string; slug: string; publishedAt: string | null; updatedAt: string };
type Filter = "all" | "draft" | "published";

export function PostManager({ name }: { name: string }) {
  const [posts, setPosts] = useState<ManagedPost[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const selected = posts.find((post) => post.id === selectedId);
  const visiblePosts = useMemo(() => posts.filter((post) => filter === "all" || post.status === filter), [posts, filter]);

  useEffect(() => {
    let active = true;
    fetch("/api/manage/posts", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load your posts.");
      if (active) setPosts(data);
    }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const selectPost = (post: ManagedPost) => {
    setSelectedId(post.id); setTitle(post.title); setContent(post.content); setMessage(""); setError("");
  };

  const persist = async (status = selected?.status ?? "draft", quiet = false) => {
    if (!selectedId) return;
    if (!quiet) { setError(""); setMessage(""); }
    const response = await fetch(`/api/manage/posts/${selectedId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, status }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Could not save this article."); setMessage(""); return; }
    setPosts((current) => current.map((post) => post.id === data.id ? data : post));
    if (!quiet) setMessage(status === "published" ? "Published" : "Saved as draft");
    else setMessage("All changes saved");
  };

  useEffect(() => {
    if (!selected || (title === selected.title && content === selected.content)) return;
    const timer = window.setTimeout(() => { void persist(selected.status, true); }, 750);
    return () => window.clearTimeout(timer);
    // Autosave when the text changes; status is saved by the buttons.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, selectedId]);

  const createPost = async () => {
    setError(""); setMessage("");
    const response = await fetch("/api/manage/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "", content: "", status: "draft" }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Could not start a new draft."); return; }
    setPosts((current) => [data, ...current]);
    setSelectedId(data.id); setTitle(data.title); setContent(data.content); setMessage("Draft created");
  };

  const deletePost = async () => {
    if (!selected) return;
    const response = await fetch(`/api/manage/posts/${selected.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Could not delete this article."); return; }
    const remaining = posts.filter((post) => post.id !== selected.id);
    setPosts(remaining); setSelectedId(""); setTitle(""); setContent(""); setDeleteOpen(false); setMessage("");
  };

  return <>
    <SiteHeader user={{ name, role: "author" }} />
    <main className="page-shell">
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} sx={{ pt: { xs: 5, md: 8 }, pb: 4 }}>
        <Box><Typography className="eyebrow" sx={{ mb: 1 }}>Your workspace</Typography><Typography variant="h1" sx={{ fontSize: { xs: 44, md: 58 } }}>The writing desk</Typography></Box>
        <Typography color="text.secondary" sx={{ mt: { xs: 1.5, sm: 0 } }}>A quiet corner to shape your next note.</Typography>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined" sx={{ mb: 9, overflow: "hidden", bgcolor: "background.paper" }}>
        <Stack direction={{ xs: "column", md: "row" }} sx={{ minHeight: 650 }}>
          <Box sx={{ width: { xs: "100%", md: 310 }, flexShrink: 0, borderRight: { md: "1px solid" }, borderBottom: { xs: "1px solid", md: 0 }, borderColor: "divider" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 650 }}>Your posts <Typography component="span" color="text.secondary">({posts.length})</Typography></Typography>
              <IconButton aria-label="Create a new draft" onClick={createPost} color="primary"><AddRounded /></IconButton>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ px: 2, pb: 1.5 }}>
              {(["all", "published", "draft"] as Filter[]).map((value) => <Button key={value} size="small" onClick={() => setFilter(value)} variant={filter === value ? "contained" : "text"} color={filter === value ? "primary" : "inherit"} sx={{ px: 1.3 }}>{value === "all" ? "All" : value === "draft" ? "Drafts" : "Live"}</Button>)}
            </Stack>
            <Divider />
            <Box sx={{ maxHeight: 520, overflowY: "auto" }} className="subtle-scrollbar">
              {loading ? <Typography color="text.secondary" sx={{ p: 2.5 }}>Loading your writing…</Typography> : visiblePosts.map((post) => <Box key={post.id} component="button" onClick={() => selectPost(post)} sx={{ width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid", borderColor: "divider", bgcolor: selectedId === post.id ? "#f3f5f0" : "transparent", p: 2.2, cursor: "pointer", color: "inherit", "&:hover": { bgcolor: "#f7f8f5" } }}>
                <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center"><Typography sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title || "Untitled draft"}</Typography><Box sx={{ width: 7, height: 7, flexShrink: 0, borderRadius: "50%", bgcolor: post.status === "published" ? "primary.main" : "#c8a26b" }} /></Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.7 }}>{post.status === "published" ? "Published" : "Draft"} · {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(post.updatedAt))}</Typography>
              </Box>)}
              {!loading && visiblePosts.length === 0 && <Box sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary">{filter === "all" ? "Your writing will show up here." : `No ${filter === "draft" ? "drafts" : "published posts"} yet.`}</Typography></Box>}
            </Box>
            <Box sx={{ p: 2.2, borderTop: "1px solid", borderColor: "divider" }}><Button href="/" color="inherit" size="small">← View your blog</Button></Box>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2.5, sm: 4, md: 5 } }}>
            {selected ? <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Stack direction="row" spacing={1} alignItems="center"><Chip size="small" label={selected.status === "published" ? "Published" : "Draft"} color={selected.status === "published" ? "primary" : "default"} variant={selected.status === "published" ? "filled" : "outlined"} /><Typography variant="caption" color="text.secondary">{message || "Autosaves as you write"}</Typography></Stack>
                <IconButton aria-label="Delete article" onClick={() => setDeleteOpen(true)} color="inherit"><DeleteOutlineRounded /></IconButton>
              </Stack>
              <TextField value={title} onChange={(e) => { setTitle(e.target.value); setMessage("Unsaved changes"); }} placeholder="Give this note a title…" variant="standard" fullWidth slotProps={{ htmlInput: { maxLength: 160 } }} sx={{ mb: 3.5, "& .MuiInputBase-input": { fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: { xs: 30, sm: 40 }, lineHeight: 1.2 } }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, gap: 1, flexWrap: "wrap" }}>
                <Typography variant="caption" color="text.secondary">Markdown supported</Typography>
                <Stack direction="row" spacing={0.5}>
                  <Button size="small" aria-pressed={!preview} variant={!preview ? "contained" : "text"} onClick={() => setPreview(false)}>Write</Button>
                  <Button size="small" aria-pressed={preview} variant={preview ? "contained" : "text"} onClick={() => setPreview(true)}>Preview</Button>
                </Stack>
              </Stack>
              {preview ? <Box sx={{ minHeight: 400 }}><MarkdownContent content={content || "Nothing to preview yet."} /></Box> : <TextField className="editor-area" value={content} onChange={(e) => { setContent(e.target.value); setMessage("Unsaved changes"); }} placeholder="Write in Markdown…" helperText="Use ## headings, **bold**, [links](https://example.com), lists, and fenced code blocks." variant="standard" multiline minRows={16} fullWidth slotProps={{ htmlInput: { maxLength: 20000, "aria-label": "Article content in Markdown" } }} sx={{ "& .MuiInputBase-input": { fontSize: 16, lineHeight: 1.8, fontFamily: "ui-monospace, monospace" } }} />}
              <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mt: 4, pt: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary">{content.trim().split(/\s+/).filter(Boolean).length} words · {content.length}/20,000</Typography>
                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                  {selected.status === "published" && <Button href={`/posts/${selected.slug}`} target="_blank" endIcon={<OpenInNewRounded />} color="inherit">View</Button>}
                  {selected.status === "published" ? <Button variant="outlined" color="inherit" onClick={() => void persist("draft")}>Move to drafts</Button> : <Button variant="contained" onClick={() => void persist("published")}>Publish</Button>}
                </Stack>
              </Stack>
            </> : <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 550, textAlign: "center", px: 3 }}>
              <Box sx={{ width: 58, height: 58, borderRadius: "50%", bgcolor: "#edf1eb", display: "grid", placeItems: "center", color: "primary.main", mb: 2 }}><AddRounded /></Box>
              <Typography variant="h3" sx={{ fontSize: 29, mb: 1 }}>A fresh page awaits.</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 330, mb: 2.5 }}>Start a new note. It will save quietly while you write.</Typography>
              <Button variant="contained" startIcon={<AddRounded />} onClick={createPost}>New draft</Button>
            </Stack>}
          </Box>
        </Stack>
      </Paper>
    </main>
    <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
      <DialogTitle>Delete this article?</DialogTitle>
      <DialogContent><Typography color="text.secondary">This will permanently remove “{selected?.title || "Untitled draft"}” and its comments and likes.</Typography></DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}><Button onClick={() => setDeleteOpen(false)} color="inherit">Keep it</Button><Button onClick={deletePost} color="error" variant="contained">Delete permanently</Button></DialogActions>
    </Dialog>
  </>;
}
