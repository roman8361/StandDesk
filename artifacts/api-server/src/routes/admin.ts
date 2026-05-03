import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, classesTable, studentsTable } from "@workspace/db";
import { count, eq, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAuth";

const router = Router();

router.get("/teachers", requireAdmin, async (req, res) => {
  const teachers = await db.select().from(usersTable).where(eq(usersTable.role, "teacher"));
  res.json(
    teachers.map((t) => ({
      id: t.id,
      username: t.username,
      name: t.name,
      email: t.email,
      role: t.role,
      createdAt: t.createdAt,
    })),
  );
});

router.post("/teachers", requireAdmin, async (req, res) => {
  const { username, password, name, email } = req.body;
  if (!username || !password || !name) {
    res.status(400).json({ error: "Логин, пароль и имя обязательны" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existing[0]) {
    res.status(409).json({ error: "Логин уже занят" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await db
    .insert(usersTable)
    .values({
      username,
      passwordHash,
      name,
      email: email || `${username}@school.local`,
      role: "teacher",
    })
    .returning();

  res.status(201).json({
    id: created.id,
    username: created.username,
    name: created.name,
    email: created.email,
    role: created.role,
    createdAt: created.createdAt,
  });
});

router.patch("/teachers/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Некорректный идентификатор учителя" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!existing[0]) {
    res.status(404).json({ error: "Учитель не найден" });
    return;
  }
  if (existing[0].role !== "teacher") {
    res.status(400).json({ error: "Редактировать можно только учителей" });
    return;
  }

  const { username, password, name, email } = req.body;
  const updates: Partial<{ username: string; passwordHash: string; name: string; email: string }> = {};

  if (typeof username === "string" && username.trim()) {
    const duplicate = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.trim()))
      .limit(1);
    if (duplicate[0] && duplicate[0].id !== id) {
      res.status(409).json({ error: "Логин уже занят" });
      return;
    }
    updates.username = username.trim();
  }

  if (typeof password === "string" && password.trim()) {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof email === "string") updates.email = email.trim() || `${existing[0].username}@school.local`;

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  res.json({
    id: updated.id,
    username: updated.username,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    createdAt: updated.createdAt,
  });
});

router.delete("/teachers/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Некорректный идентификатор учителя" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!existing[0]) {
    res.status(404).json({ error: "Учитель не найден" });
    return;
  }
  if (existing[0].role !== "teacher") {
    res.status(400).json({ error: "Удалять можно только учителей" });
    return;
  }

  await db.delete(classesTable).where(eq(classesTable.teacherId, id));
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

router.get("/stats", requireAdmin, async (req, res) => {
  const [teacherCount] = await db.select({ value: count() }).from(usersTable).where(eq(usersTable.role, "teacher"));
  const [classCount] = await db.select({ value: count() }).from(classesTable);
  const [studentCount] = await db.select({ value: count() }).from(studentsTable);
  res.json({
    totalTeachers: teacherCount?.value ?? 0,
    totalClasses: classCount?.value ?? 0,
    totalStudents: studentCount?.value ?? 0,
  });
});

export default router;
