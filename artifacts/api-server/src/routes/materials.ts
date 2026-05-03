import { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { db, materialsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, getCurrentUser } from "../middlewares/requireAuth";
import { requireAdmin } from "../middlewares/requireAuth";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const materials = await db
    .select({
      id: materialsTable.id,
      title: materialsTable.title,
      content: materialsTable.content,
      fileName: materialsTable.fileName,
      filePath: materialsTable.filePath,
      fileSize: materialsTable.fileSize,
      fileType: materialsTable.fileType,
      createdById: materialsTable.createdById,
      createdAt: materialsTable.createdAt,
      authorName: usersTable.name,
    })
    .from(materialsTable)
    .leftJoin(usersTable, eq(materialsTable.createdById, usersTable.id))
    .orderBy(desc(materialsTable.createdAt));
  res.json(materials);
});

router.post("/", requireAuth, requireAdmin, upload.single("file"), async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Не авторизован" }); return; }

  const { title, content } = req.body;
  if (!title?.trim()) {
    res.status(400).json({ error: "Заголовок обязателен" });
    return;
  }

  const file = req.file;

  const [created] = await db
    .insert(materialsTable)
    .values({
      title: title.trim(),
      content: content?.trim() || null,
      fileName: file ? file.originalname : null,
      filePath: file ? file.filename : null,
      fileSize: file ? file.size : null,
      fileType: file ? file.mimetype : null,
      createdById: user.id,
    })
    .returning();

  res.status(201).json({ ...created, authorName: user.name });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await db.select().from(materialsTable).where(eq(materialsTable.id, id)).limit(1);
  if (!existing[0]) { res.status(404).json({ error: "Материал не найден" }); return; }

  if (existing[0].filePath) {
    const fullPath = path.join(UPLOADS_DIR, existing[0].filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }

  await db.delete(materialsTable).where(eq(materialsTable.id, id));
  res.status(204).send();
});

export default router;
