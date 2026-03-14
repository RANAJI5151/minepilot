import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { activityLogsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const serverId = req.query.serverId ? parseInt(req.query.serverId as string) : undefined;
  const limit = parseInt((req.query.limit as string) || "50");

  const whereClause = serverId
    ? and(eq(activityLogsTable.userId, req.userId!), eq(activityLogsTable.serverId, serverId))
    : eq(activityLogsTable.userId, req.userId!);

  const logs = await db.select().from(activityLogsTable)
    .where(whereClause)
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(Math.min(limit, 100));

  res.json(logs);
});

export default router;
