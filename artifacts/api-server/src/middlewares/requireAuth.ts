import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET ?? "school-desk-secret";

export function getUserIdFromRequest(req: Request): number | null {
  const auth = req.headers["authorization"];
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
      if (payload?.userId) return payload.userId;
    } catch {
      // invalid token
    }
  }
  if (req.session?.userId) return req.session.userId;
  return null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Не авторизован" });
    return;
  }
  req.session.userId = userId;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Не авторизован" });
    return;
  }
  req.session.userId = userId;
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user[0] || user[0].role !== "admin") {
    res.status(403).json({ error: "Доступ запрещён" });
    return;
  }
  next();
}

export async function getCurrentUser(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return null;
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return users[0] ?? null;
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
