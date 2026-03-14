import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { serversTable } from "./servers";

export const consoleEntriesTable = pgTable("console_entries", {
  id: serial("id").primaryKey(),
  serverId: integer("server_id").notNull().references(() => serversTable.id, { onDelete: "cascade" }),
  command: text("command").notNull(),
  output: text("output").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConsoleEntrySchema = createInsertSchema(consoleEntriesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertConsoleEntry = typeof consoleEntriesTable.$inferInsert;
export type ConsoleEntry = typeof consoleEntriesTable.$inferSelect;
