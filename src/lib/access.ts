import { auth } from "@/lib/auth";

export async function getSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export async function isAuthor(request: Request) {
  const session = await getSession(request);
  return session?.user.role === "author" ? session : null;
}
