import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const SEED_USERS = [
  { username: "admin", name: "Администратор", email: "admin@school.local", password: "admin", role: "admin" as const },
  { username: "teach", name: "Учитель", email: "teach@school.local", password: "teach", role: "teacher" as const },
];

export async function seedUsers() {
  for (const u of SEED_USERS) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, u.username)).limit(1);
    if (!existing[0]) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await db.insert(usersTable).values({
        username: u.username,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
      });
      logger.info(`Создан пользователь: ${u.username} (${u.role})`);
    }
  }
}
