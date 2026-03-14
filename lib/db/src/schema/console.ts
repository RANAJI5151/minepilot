import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
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

export type InsertConsoleEntry = z.infer<typeof insertConsoleEntrySchema>;
export type ConsoleEntry = typeof consoleEntriesTable.$inferSelect;
