import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Не авторизован" });
    return;
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Не авторизован" });
    return;
  }
  const user = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user[0] || user[0].role !== "admin") {
    res.status(403).json({ error: "Доступ запрещён" });
    return;
  }
  next();
}

export async function getCurrentUser(req: Request) {
  if (!req.session?.userId) return null;
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  return users[0] ?? null;
}
