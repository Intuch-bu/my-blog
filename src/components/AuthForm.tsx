"use client";

import { FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@/components/ui/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setLoading(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const result = mode === "login"
        ? await authClient.signIn.email({ email: String(values.email), password: String(values.password) })
        : await authClient.signUp.email({ name: String(values.name), email: String(values.email), password: String(values.password) });
      if (result.error) throw new Error(result.error.message || "Could not authenticate.");
      const next = new URLSearchParams(window.location.search).get("next");
      const destination = next ? new URL(next, window.location.origin) : new URL("/", window.location.origin);
      router.push(destination.origin === window.location.origin ? `${destination.pathname}${destination.search}${destination.hash}` : "/");
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setLoading(false); }
  };

  return <Box component="form" onSubmit={submit}>
    <Stack spacing={2.2}>
      {error && <Alert severity="error">{error}</Alert>}
      {mode === "register" && <TextField name="name" label="Display name" autoComplete="name" required fullWidth slotProps={{ htmlInput: { maxLength: 50 } }} />}
      <TextField name="email" label="Email address" type="email" autoComplete="email" required fullWidth />
      <TextField name="password" label="Password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required fullWidth slotProps={{ htmlInput: { minLength: 8 } }} />
      <Typography variant="caption" color="text.secondary">{mode === "register" ? "No email verification needed. Use a password with at least 8 characters." : "Welcome back."}</Typography>
      <Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</Button>
    </Stack>
  </Box>;
}
