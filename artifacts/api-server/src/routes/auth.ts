import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getCurrentUser } from "../middlewares/requireAuth";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Логин и пароль обязательны" });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  const user = users[0];

  if (!user) {
    res.status(401).json({ error: "Неверный логин или пароль" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Неверный логин или пароль" });
    return;
  }

  req.session.userId = user.id;
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: "Не авторизован" });
    return;
  }
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

export default router;
