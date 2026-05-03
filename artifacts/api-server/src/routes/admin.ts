import { Router } from "express";
import { db, usersTable, classesTable, studentsTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAuth";

const router = Router();

router.get("/teachers", requireAdmin, async (req, res) => {
  const teachers = await db.select().from(usersTable);
  res.json(teachers.map(t => ({
    id: t.id,
    username: t.username,
    name: t.name,
    email: t.email,
    role: t.role,
    createdAt: t.createdAt,
  })));
});

router.get("/stats", requireAdmin, async (req, res) => {
  const [teacherCount] = await db.select({ value: count() }).from(usersTable);
  const [classCount] = await db.select({ value: count() }).from(classesTable);
  const [studentCount] = await db.select({ value: count() }).from(studentsTable);
  res.json({
    totalTeachers: teacherCount?.value ?? 0,
    totalClasses: classCount?.value ?? 0,
    totalStudents: studentCount?.value ?? 0,
  });
});

export default router;
