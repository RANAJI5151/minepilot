import { Router, type IRouter } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { sshService } from "../services/ssh.js";
import { WriteFileBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/list", requireAuth, async (req: AuthRequest, res) => {
  const serverId = parseInt(req.query.serverId as string);
  const path = (req.query.path as string) || "/home";

  if (isNaN(serverId)) {
    res.status(400).json({ error: "serverId required" });
    return;
  }

  if (!sshService.isConnected(serverId)) {
    res.status(400).json({ error: "Not connected to server" });
    return;
  }

  try {
    const files = await sshService.listFiles(serverId, path);
    res.json(files);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to list files";
    res.status(500).json({ error: msg });
  }
});

router.get("/read", requireAuth, async (req: AuthRequest, res) => {
  const serverId = parseInt(req.query.serverId as string);
  const path = req.query.path as string;

  if (isNaN(serverId) || !path) {
    res.status(400).json({ error: "serverId and path required" });
    return;
  }

  if (!sshService.isConnected(serverId)) {
    res.status(400).json({ error: "Not connected to server" });
    return;
  }

  try {
    const content = await sshService.readFile(serverId, path);
    res.json({ path, content });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to read file";
    res.status(500).json({ error: msg });
  }
});

router.post("/write", requireAuth, async (req: AuthRequest, res) => {
  const parsed = WriteFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { serverId, path, content } = parsed.data;

  if (!sshService.isConnected(serverId)) {
    res.status(400).json({ error: "Not connected to server" });
    return;
  }

  try {
    await sshService.writeFile(serverId, path, content);
    res.json({ message: "File saved" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to write file";
    res.status(500).json({ error: msg });
  }
});

router.delete("/delete", requireAuth, async (req: AuthRequest, res) => {
  const serverId = parseInt(req.query.serverId as string);
  const path = req.query.path as string;

  if (isNaN(serverId) || !path) {
    res.status(400).json({ error: "serverId and path required" });
    return;
  }

  if (!sshService.isConnected(serverId)) {
    res.status(400).json({ error: "Not connected to server" });
    return;
  }

  try {
    await sshService.deleteFile(serverId, path);
    res.json({ message: "File deleted" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete file";
    res.status(500).json({ error: msg });
  }
});

export default router;
