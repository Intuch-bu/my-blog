import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.BLOG_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.BLOG_OWNER_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("Set BLOG_OWNER_EMAIL and a BLOG_OWNER_PASSWORD of at least 12 characters first.");
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("An account already uses BLOG_OWNER_EMAIL. Choose the owner account before opening registration.");

    const result = await auth.api.signUpEmail({ body: { email, password, name: "Blog author" } });
    if (!result || "error" in result) throw new Error("Could not create the owner account.");
    await prisma.user.update({ where: { id: result.user.id }, data: { role: "author" } });
    console.log(`Owner account created for ${email}. Sign in with its email and password.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
