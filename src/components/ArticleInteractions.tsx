"use client";

import { FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@/components/ui/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";

export type CommentItem = { id: string; content: string; createdAt: string; name: string; userId: string };

function shortDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function ArticleInteractions({
  slug, initialComments, initialLiked, initialLikeCount, user,
}: {
  slug: string; initialComments: CommentItem[]; initialLiked: boolean; initialLikeCount: number;
  user: { id: string; name: string; role: string } | null;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [draft, setDraft] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/posts/${slug}`;

  const requireLogin = () => { router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`); };
  const toggleLike = async () => {
    if (!user) return requireLogin();
    setBusy(true); setError("");
    try {
      const response = await fetch(`${endpoint}/like`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setLiked(data.liked); setLikeCount(data.count);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update your like."); }
    finally { setBusy(false); }
  };
  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return requireLogin();
    const response = await fetch(`${endpoint}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error); return; }
    setComments((current) => [...current, data]); setDraft(""); setError("");
  };
  const saveEdit = async (id: string) => {
    const response = await fetch(`${endpoint}/comments`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, content: editText }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error); return; }
    setComments((current) => current.map((comment) => comment.id === id ? data : comment)); setEditId(null); setError("");
  };
  const deleteComment = async (id: string) => {
    if (!window.confirm("Delete this comment?")) return;
    const response = await fetch(`${endpoint}/comments`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error); return; }
    setComments((current) => current.filter((comment) => comment.id !== id));
  };

  return <Box>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4 }}>
      <IconButton aria-label={liked ? "Unlike this article" : "Like this article"} onClick={toggleLike} disabled={busy} color={liked ? "secondary" : "default"} sx={{ border: "1px solid", borderColor: "divider" }}>
        {liked ? <FavoriteRounded /> : <FavoriteBorderRounded />}
      </IconButton>
      <Typography variant="body2" color="text.secondary">{likeCount} {likeCount === 1 ? "like" : "likes"}</Typography>
    </Stack>
    <Divider sx={{ mb: 4 }} />
    <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2.5 }}>
      <Typography variant="h3" sx={{ fontSize: 28 }}>Conversation</Typography>
      <Typography variant="body2" color="text.secondary">{comments.length} {comments.length === 1 ? "comment" : "comments"}</Typography>
    </Stack>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {user ? <Box component="form" onSubmit={submitComment} sx={{ mb: 3.5 }}>
      <TextField multiline minRows={3} fullWidth value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Leave a thoughtful note…" slotProps={{ htmlInput: { maxLength: 1000 } }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">Commenting as {user.name}</Typography><Button type="submit" variant="contained" disabled={!draft.trim()}>Post comment</Button>
      </Stack>
    </Box> : <Alert severity="info" sx={{ mb: 3 }}>Sign in to join the conversation. <a href={`/login?next=${encodeURIComponent(`/posts/${slug}`)}`} style={{ textDecoration: "underline", fontWeight: 600 }}>Sign in</a></Alert>}
    <Stack divider={<Divider flexItem />}>
      {comments.map((comment) => {
        const canEdit = user?.id === comment.userId;
        // The author may remove any comment; its owner may also edit or remove it.
        const canDelete = canEdit || user?.role === "author";
        return <Stack key={comment.id} direction="row" spacing={1.5} sx={{ py: 2.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "#e4e9e1", color: "primary.dark", fontSize: 13 }}>{comment.name.trim().slice(0, 1).toUpperCase()}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}><Typography variant="subtitle2">{comment.name}</Typography><Typography variant="caption" color="text.secondary">{shortDate(comment.createdAt)}</Typography></Stack>
            {editId === comment.id ? <><TextField multiline minRows={2} fullWidth value={editText} onChange={(e) => setEditText(e.target.value)} slotProps={{ htmlInput: { maxLength: 1000 } }} /><Stack direction="row" spacing={1} justifyContent="end" sx={{ mt: 1 }}><Button size="small" onClick={() => setEditId(null)}>Cancel</Button><Button size="small" variant="contained" onClick={() => saveEdit(comment.id)}>Save</Button></Stack></> : <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{comment.content}</Typography>}
            {(canEdit || canDelete) && editId !== comment.id && <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
              {canEdit && <Button size="small" sx={{ minWidth: 0, px: 0.5 }} onClick={() => { setEditId(comment.id); setEditText(comment.content); }}>Edit</Button>}
              {canDelete && <Button size="small" color="error" sx={{ minWidth: 0, px: 0.5 }} onClick={() => deleteComment(comment.id)}>Delete</Button>}
            </Stack>}
          </Box>
        </Stack>;
      })}
      {comments.length === 0 && <Typography color="text.secondary" sx={{ py: 3 }}>Be the first to leave a comment.</Typography>}
    </Stack>
  </Box>;
}
