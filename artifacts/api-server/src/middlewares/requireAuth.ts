import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session?.userId ?? Number(req.headers["x-user-id"]);
  if (!userId) {
    res.status(401).json({ error: "Не авторизован" });
    return;
  }
  req.session.userId = userId;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session?.userId ?? Number(req.headers["x-user-id"]);
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
  const userId = req.session?.userId ?? Number(req.headers["x-user-id"]);
  if (!userId) return null;
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return users[0] ?? null;
}
