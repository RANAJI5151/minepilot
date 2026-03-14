import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serversTable } from "./servers";
import { usersTable } from "./users";

export const installedPluginsTable = pgTable("installed_plugins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  serverId: integer("server_id").references(() => serversTable.id, { onDelete: "cascade" }),
  pluginId: text("plugin_id").notNull(),
  pluginName: text("plugin_name").notNull(),
  version: text("version").notNull(),
  serverType: text("server_type").notNull().default("paper"),
  installedAt: timestamp("installed_at").defaultNow().notNull(),
});

export const insertInstalledPluginSchema = createInsertSchema(installedPluginsTable).omit({
  id: true,
  installedAt: true,
});

export type InsertInstalledPlugin = z.infer<typeof insertInstalledPluginSchema>;
export type InstalledPlugin = typeof installedPluginsTable.$inferSelect;
