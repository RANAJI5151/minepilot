import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { serversTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { encrypt, decrypt } from "../lib/encryption.js";
import { sshService } from "../services/ssh.js";
import { activityService } from "../services/activity.js";
import {
  CreateServerBody,
  UpdateServerBody,
  SetupServerBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const servers = await db.select().from(serversTable).where(eq(serversTable.userId, req.userId!));
  res.json(servers.map(s => ({
    ...s,
    sshPasswordEncrypted: undefined,
  })));
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreateServerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { name, host, sshPort, sshUsername, sshPassword, serverType, gameMode } = parsed.data;

  const [server] = await db.insert(serversTable).values({
    userId: req.userId!,
    name,
    host,
    sshPort,
    sshUsername,
    sshPasswordEncrypted: encrypt(sshPassword),
    serverType: serverType ?? null,
    gameMode: gameMode ?? null,
    status: "offline",
  }).returning();

  await activityService.log(req.userId!, server.id, "server_added", `Added server: ${name}`);

  res.status(201).json({
    ...server,
    sshPasswordEncrypted: undefined,
  });
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [server] = await db.select().from(serversTable).where(
    and(eq(serversTable.id, id), eq(serversTable.userId, req.userId!))
  );
  if (!server) {
    res.status(404).json({ error: "Server not found" });
    return;
  }
  res.json({ ...server, sshPasswordEncrypted: undefined });
});

router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const parsed = UpdateServerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [existing] = await db.select().from(serversTable).where(
    and(eq(serversTable.id, id), eq(serversTable.userId, req.userId!))
  );
  if (!existing) {
    res.status(404).json({ error: "Server not found" });
    return;
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.sshPassword) {
    updates.sshPasswordEncrypted = encrypt(parsed.data.sshPassword);
    delete updates.sshPassword;
  }

  const [updated] = await db.update(serversTable).set(updates).where(eq(serversTable.id, id)).returning();
  res.json({ ...updated, sshPasswordEncrypted: undefined });
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [existing] = await db.select().from(serversTable).where(
    and(eq(serversTable.id, id), eq(serversTable.userId, req.userId!))
  );
  if (!existing) {
    res.status(404).json({ error: "Server not found" });
    return;
  }

  sshService.disconnect(id);
  await db.delete(serversTable).where(eq(serversTable.id, id));
  res.json({ message: "Server deleted" });
});

router.post("/:id/connect", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [server] = await db.select().from(serversTable).where(
    and(eq(serversTable.id, id), eq(serversTable.userId, req.userId!))
  );
  if (!server) {
    res.status(404).json({ error: "Server not found" });
    return;
  }

  try {
    const password = decrypt(server.sshPasswordEncrypted);
    await sshService.connect(id, {
      host: server.host,
      port: server.sshPort,
      username: server.sshUsername,
      password,
    });

    await db.update(serversTable).set({ status: "online" }).where(eq(serversTable.id, id));
    await activityService.log(req.userId!, id, "server_connected", `Connected to ${server.name}`);
    res.json({ connected: true, message: "Connected successfully" });
  } catch (err: unknown) {
    await db.update(serversTable).set({ status: "error" }).where(eq(serversTable.id, id));
    const msg = err instanceof Error ? err.message : "Connection failed";
    res.json({ connected: false, message: msg });
  }
});

router.post("/:id/disconnect", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [server] = await db.select().from(serversTable).where(
    and(eq(serversTable.id, id), eq(serversTable.userId, req.userId!))
  );
  if (!server) {
    res.status(404).json({ error: "Server not found" });
    return;
  }

  sshService.disconnect(id);
  await db.update(serversTable).set({ status: "offline" }).where(eq(serversTable.id, id));
  await activityService.log(req.userId!, id, "server_disconnected", `Disconnected from ${server.name}`);
  res.json({ message: "Disconnected" });
});

router.get("/:id/stats", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [server] = await db.select().from(serversTable).where(
    and(eq(serversTable.id, id), eq(serversTable.userId, req.userId!))
  );
  if (!server) {
    res.status(404).json({ error: "Server not found" });
    return;
  }

  const isConnected = sshService.isConnected(id);
  if (!isConnected) {
    res.json({
      online: false,
      playerCount: 0,
      maxPlayers: 0,
      ramUsed: 0,
      ramTotal: 0,
      cpuUsage: 0,
      tps: 0,
      diskUsed: 0,
      diskTotal: 0,
    });
    return;
  }

  try {
    const stats = await sshService.getStats(id);
    res.json(stats);
  } catch {
    res.json({
      online: true,
      playerCount: 0,
      maxPlayers: 20,
      ramUsed: 0,
      ramTotal: 0,
      cpuUsage: 0,
      tps: 20,
      diskUsed: 0,
      diskTotal: 0,
    });
  }
});

router.post("/:id/setup", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const parsed = SetupServerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [server] = await db.select().from(serversTable).where(
    and(eq(serversTable.id, id), eq(serversTable.userId, req.userId!))
  );
  if (!server) {
    res.status(404).json({ error: "Server not found" });
    return;
  }

  const { serverType, gameMode } = parsed.data;
  await db.update(serversTable).set({ serverType, gameMode }).where(eq(serversTable.id, id));
  await activityService.log(req.userId!, id, "server_setup", `Set up ${serverType} ${gameMode} server`);

  res.json({ message: `Server setup initiated: ${serverType} ${gameMode}` });
});

export default router;
