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

export default async function RegisterPage() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");
  return <><SiteHeader user={null} /><main className="page-shell" style={{ maxWidth: 540 }}>
    <Box sx={{ py: { xs: 7, md: 11 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, bgcolor: "background.paper" }}>
        <Typography className="eyebrow" sx={{ mb: 1 }}>Join the conversation</Typography>
        <Typography variant="h2" sx={{ fontSize: 40, mb: 1 }}>Make yourself at home.</Typography>
        <Typography color="text.secondary" sx={{ mb: 3.5 }}>Create an account to leave a note or like a story.</Typography>
        <AuthForm mode="register" />
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mt: 2.5 }}>
          <Typography variant="body2" color="text.secondary">Already have an account?</Typography><Button href="/login" size="small">Sign in</Button>
        </Stack>
      </Paper>
    </Box>
  </main></>;
}
