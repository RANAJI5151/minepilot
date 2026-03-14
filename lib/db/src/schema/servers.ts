import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const serversTable = pgTable("servers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  host: text("host").notNull(),
  sshPort: integer("ssh_port").notNull().default(22),
  sshUsername: text("ssh_username").notNull(),
  sshPasswordEncrypted: text("ssh_password_encrypted").notNull(),
  serverType: text("server_type"),
  gameMode: text("game_mode"),
  status: text("status").notNull().default("offline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertServerSchema = createInsertSchema(serversTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServer = typeof serversTable.$inferInsert;
export type Server = typeof serversTable.$inferSelect;
