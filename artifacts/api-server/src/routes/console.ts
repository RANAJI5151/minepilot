import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { consoleEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { sshService } from "../services/ssh.js";
import { SendCommandBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/command", requireAuth, async (req: AuthRequest, res) => {
  const parsed = SendCommandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { serverId, command } = parsed.data;

  let output = "";
  let success = false;

  if (sshService.isConnected(serverId)) {
    try {
      output = await sshService.sendCommand(serverId, command);
      success = true;
    } catch (err: unknown) {
      output = err instanceof Error ? err.message : "Command failed";
      success = false;
    }
  } else {
    output = "Not connected to server. Please connect first.";
    success = false;
  }

  await db.insert(consoleEntriesTable).values({
    serverId,
    command,
    output: output || "No output",
  });

  res.json({ output: output || "No output", success });
});

router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  const serverId = parseInt(req.query.serverId as string);
  if (isNaN(serverId)) {
    res.status(400).json({ error: "serverId required" });
    return;
  }

  const entries = await db.select().from(consoleEntriesTable)
    .where(eq(consoleEntriesTable.serverId, serverId))
    .orderBy(consoleEntriesTable.createdAt)
    .limit(100);

  res.json(entries);
});

export default router;
