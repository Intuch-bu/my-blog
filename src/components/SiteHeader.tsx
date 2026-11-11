import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@/components/ui/Stack";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export function SiteHeader({ user }: { user?: { name: string; role: string } | null }) {
  return (
    <header className="site-header">
      <div className="page-shell">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 76 }}>
          <Link href="/" className="wordmark" aria-label="My Blog home">my blog<span style={{ color: "#aa3d20" }}>.</span></Link>
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1.5 }} alignItems="center">
            {user?.role === "author" && <Button href="/manage" variant="outlined" color="inherit" size="small">Manage</Button>}
            {user ? <>
              <Box sx={{ display: { xs: "none", sm: "block" }, color: "text.secondary", fontSize: 13 }}>{user.name}</Box>
              <SignOutButton />
            </> : <Button href="/login" variant="contained" size="small">Sign in</Button>}
          </Stack>
        </Stack>
      </div>
    </header>
  );
}
