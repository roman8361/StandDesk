import { Router } from "express";
import { db, classesTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getCurrentUser } from "../middlewares/requireAuth";

const router = Router();

router.get("/:id", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const id = parseInt(req.params.id);
  const student = await db.select().from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
  if (!student[0]) { res.status(404).json({ error: "Ученик не найден" }); return; }

  const classResult = await db.select().from(classesTable).where(eq(classesTable.id, student[0].classId)).limit(1);
  if (user.role !== "admin" && classResult[0]?.teacherId !== user.id) {
    res.status(403).json({ error: "Доступ запрещён" }); return;
  }
  res.json(student[0]);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const id = parseInt(req.params.id);
  const student = await db.select().from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
  if (!student[0]) { res.status(404).json({ error: "Ученик не найден" }); return; }

  const classResult = await db.select().from(classesTable).where(eq(classesTable.id, student[0].classId)).limit(1);
  if (user.role !== "admin" && classResult[0]?.teacherId !== user.id) {
    res.status(403).json({ error: "Доступ запрещён" }); return;
  }

  const { fullName, age, height, vision, weight } = req.body;
  const updates: Partial<{ fullName: string; age: number | null; height: number | null; vision: string | null; weight: number | null }> = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (age !== undefined) updates.age = age;
  if (height !== undefined) updates.height = height;
  if (vision !== undefined) updates.vision = vision;
  if (weight !== undefined) updates.weight = weight;

  const [updated] = await db.update(studentsTable).set(updates).where(eq(studentsTable.id, id)).returning();
  res.json(updated);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const id = parseInt(req.params.id);
  const student = await db.select().from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
  if (!student[0]) { res.status(404).json({ error: "Ученик не найден" }); return; }

  const classResult = await db.select().from(classesTable).where(eq(classesTable.id, student[0].classId)).limit(1);
  if (user.role !== "admin" && classResult[0]?.teacherId !== user.id) {
    res.status(403).json({ error: "Доступ запрещён" }); return;
  }

  await db.delete(studentsTable).where(eq(studentsTable.id, id));
  res.status(204).send();
});

export default router;
