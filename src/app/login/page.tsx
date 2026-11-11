import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@/components/ui/Stack";
import Typography from "@mui/material/Typography";
import { AuthForm } from "@/components/AuthForm";
import { SiteHeader } from "@/components/SiteHeader";
import { auth } from "@/lib/auth";

export const instant = false;

export default async function LoginPage() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");
  return <><SiteHeader user={null} /><main className="page-shell" style={{ maxWidth: 540 }}>
    <Box sx={{ py: { xs: 7, md: 11 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, bgcolor: "background.paper" }}>
        <Typography className="eyebrow" sx={{ mb: 1 }}>Your account</Typography>
        <Typography variant="h2" sx={{ fontSize: 40, mb: 1 }}>Welcome back.</Typography>
        <Typography color="text.secondary" sx={{ mb: 3.5 }}>Sign in to join the conversation.</Typography>
        <AuthForm mode="login" />
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mt: 2.5 }}>
          <Typography variant="body2" color="text.secondary">New here?</Typography><Button href="/register" size="small">Create an account</Button>
        </Stack>
      </Paper>
    </Box>
  </main></>;
}
