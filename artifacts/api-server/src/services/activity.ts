import { db } from "@workspace/db";
import { activityLogsTable } from "@workspace/db";

class ActivityService {
  async log(userId: number, serverId: number | null, action: string, details?: string): Promise<void> {
    await db.insert(activityLogsTable).values({
      userId,
      serverId: serverId ?? null,
      action,
      details: details ?? null,
    });
  }
}

export const activityService = new ActivityService();
