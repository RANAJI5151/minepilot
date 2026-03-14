import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import serversRouter from "./servers.js";
import pluginsRouter from "./plugins.js";
import consoleRouter from "./console.js";
import filesRouter from "./files.js";
import aiRouter from "./ai.js";
import activityRouter from "./activity.js";

const router: IRouter = Router();

router.use("/", healthRouter);
router.use("/auth", authRouter);
router.use("/servers", serversRouter);
router.use("/plugins", pluginsRouter);
router.use("/console", consoleRouter);
router.use("/files", filesRouter);
router.use("/ai", aiRouter);
router.use("/activity", activityRouter);

export default router;
