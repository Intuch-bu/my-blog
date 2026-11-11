import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PostManager } from "@/components/PostManager";
import { auth } from "@/lib/auth";

export const instant = false;

export default async function ManagePage() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?next=%2Fmanage");
  if (session.user.role !== "author") redirect("/");
  return <PostManager name={session.user.name} />;
}
