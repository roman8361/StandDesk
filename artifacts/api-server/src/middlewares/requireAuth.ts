import { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId)).limit(1);
  if (!user[0] || user[0].role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

export function resolveClerkName(clerkUser: { firstName?: string | null; lastName?: string | null; emailAddresses: Array<{ emailAddress: string }> }): string {
  const fullName = [clerkUser.firstName ?? "", clerkUser.lastName ?? ""].join(" ").trim();
  return fullName || (clerkUser.emailAddresses[0]?.emailAddress ?? "User");
}

export async function getOrCreateUser(clerkId: string, name: string, email: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db.insert(usersTable).values({ clerkId, name, email, role: "teacher" }).returning();
  return created;
}

export async function resolveCurrentUser(clerkId: string) {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);
  const name = resolveClerkName(clerkUser);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  return getOrCreateUser(clerkId, name, email);
}
