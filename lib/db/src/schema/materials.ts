import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const materialsTable = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  fileName: text("file_name"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  createdById: integer("created_by_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Material = typeof materialsTable.$inferSelect;
