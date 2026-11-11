"use client";

import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return <Button color="inherit" size="small" onClick={async () => { await authClient.signOut(); router.push("/"); }}>Sign out</Button>;
}
