import { Router } from "express";
import { db, usersTable, classesTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getCurrentUser } from "../middlewares/requireAuth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  let classes;
  if (user.role === "admin") {
    classes = await db
      .select({
        id: classesTable.id,
        name: classesTable.name,
        studentCount: classesTable.studentCount,
        teacherId: classesTable.teacherId,
        teacherName: usersTable.name,
        createdAt: classesTable.createdAt,
        updatedAt: classesTable.updatedAt,
      })
      .from(classesTable)
      .leftJoin(usersTable, eq(classesTable.teacherId, usersTable.id));
  } else {
    classes = await db
      .select({
        id: classesTable.id,
        name: classesTable.name,
        studentCount: classesTable.studentCount,
        teacherId: classesTable.teacherId,
        teacherName: usersTable.name,
        createdAt: classesTable.createdAt,
        updatedAt: classesTable.updatedAt,
      })
      .from(classesTable)
      .leftJoin(usersTable, eq(classesTable.teacherId, usersTable.id))
      .where(eq(classesTable.teacherId, user.id));
  }
  res.json(classes);
});

router.post("/", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const { name: className, studentCount } = req.body;
  if (!className || typeof className !== "string") {
    res.status(400).json({ error: "Название класса обязательно" });
    return;
  }

  const [created] = await db
    .insert(classesTable)
    .values({ name: className, studentCount: studentCount ?? 0, teacherId: user.id })
    .returning();
  res.status(201).json({ ...created, teacherName: user.name });
});

router.get("/:id", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const id = parseInt(req.params.id);
  const result = await db
    .select({
      id: classesTable.id,
      name: classesTable.name,
      studentCount: classesTable.studentCount,
      teacherId: classesTable.teacherId,
      teacherName: usersTable.name,
      createdAt: classesTable.createdAt,
      updatedAt: classesTable.updatedAt,
    })
    .from(classesTable)
    .leftJoin(usersTable, eq(classesTable.teacherId, usersTable.id))
    .where(eq(classesTable.id, id))
    .limit(1);

  if (!result[0]) { res.status(404).json({ error: "Класс не найден" }); return; }
  if (user.role !== "admin" && result[0].teacherId !== user.id) {
    res.status(403).json({ error: "Доступ запрещён" }); return;
  }
  res.json(result[0]);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const id = parseInt(req.params.id);
  const existing = await db.select().from(classesTable).where(eq(classesTable.id, id)).limit(1);
  if (!existing[0]) { res.status(404).json({ error: "Класс не найден" }); return; }
  if (user.role !== "admin" && existing[0].teacherId !== user.id) {
    res.status(403).json({ error: "Доступ запрещён" }); return;
  }

  const { name: className, studentCount } = req.body;
  const updates: Partial<{ name: string; studentCount: number }> = {};
  if (className) updates.name = className;
  if (studentCount !== undefined) updates.studentCount = studentCount;

  const [updated] = await db.update(classesTable).set(updates).where(eq(classesTable.id, id)).returning();
  res.json({ ...updated, teacherName: user.name });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const id = parseInt(req.params.id);
  const existing = await db.select().from(classesTable).where(eq(classesTable.id, id)).limit(1);
  if (!existing[0]) { res.status(404).json({ error: "Класс не найден" }); return; }
  if (user.role !== "admin" && existing[0].teacherId !== user.id) {
    res.status(403).json({ error: "Доступ запрещён" }); return;
  }

  await db.delete(classesTable).where(eq(classesTable.id, id));
  res.status(204).send();
});

router.get("/:id/students", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const id = parseInt(req.params.id);
  const classResult = await db.select().from(classesTable).where(eq(classesTable.id, id)).limit(1);
  if (!classResult[0]) { res.status(404).json({ error: "Класс не найден" }); return; }
  if (user.role !== "admin" && classResult[0].teacherId !== user.id) {
    res.status(403).json({ error: "Доступ запрещён" }); return;
  }

  const students = await db.select().from(studentsTable).where(eq(studentsTable.classId, id));
  res.json(students);
});

router.post("/:id/students", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const id = parseInt(req.params.id);
  const classResult = await db.select().from(classesTable).where(eq(classesTable.id, id)).limit(1);
  if (!classResult[0]) { res.status(404).json({ error: "Класс не найден" }); return; }
  if (user.role !== "admin" && classResult[0].teacherId !== user.id) {
    res.status(403).json({ error: "Доступ запрещён" }); return;
  }

  const { fullName, age, height, vision, weight } = req.body;
  if (!fullName) { res.status(400).json({ error: "ФИО обязательно" }); return; }

  const [created] = await db
    .insert(studentsTable)
    .values({ classId: id, fullName, age: age ?? null, height: height ?? null, vision: vision ?? null, weight: weight ?? null })
    .returning();
  res.status(201).json(created);
});

export default router;
