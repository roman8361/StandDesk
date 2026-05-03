import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, classesTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, resolveCurrentUser } from "../middlewares/requireAuth";

const router = Router();

// Get student
router.get("/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await resolveCurrentUser(userId);

  const id = parseInt(req.params.id);
  const student = await db.select().from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
  if (!student[0]) { res.status(404).json({ error: "Student not found" }); return; }

  const classResult = await db.select().from(classesTable).where(eq(classesTable.id, student[0].classId)).limit(1);
  if (user.role !== "admin" && classResult[0]?.teacherId !== user.id) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  res.json(student[0]);
});

// Update student
router.patch("/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await resolveCurrentUser(userId);

  const id = parseInt(req.params.id);
  const student = await db.select().from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
  if (!student[0]) { res.status(404).json({ error: "Student not found" }); return; }

  const classResult = await db.select().from(classesTable).where(eq(classesTable.id, student[0].classId)).limit(1);
  if (user.role !== "admin" && classResult[0]?.teacherId !== user.id) {
    res.status(403).json({ error: "Forbidden" }); return;
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

// Delete student
router.delete("/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = await resolveCurrentUser(userId);

  const id = parseInt(req.params.id);
  const student = await db.select().from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
  if (!student[0]) { res.status(404).json({ error: "Student not found" }); return; }

  const classResult = await db.select().from(classesTable).where(eq(classesTable.id, student[0].classId)).limit(1);
  if (user.role !== "admin" && classResult[0]?.teacherId !== user.id) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(studentsTable).where(eq(studentsTable.id, id));
  res.status(204).send();
});

export default router;
