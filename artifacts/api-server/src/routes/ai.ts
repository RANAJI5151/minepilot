import { Router, type IRouter } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "../middlewares/auth.js";
import { AiChatBody, AnalyzeLogBody, SuggestConfigBody } from "@workspace/api-zod";

const router: IRouter = Router();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY not configured");
}

const genAI = new GoogleGenerativeAI(apiKey);

async function callGemini(messages: { role: string; content: string }[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = messages
    .map((msg) => `${msg.role.toUpperCase()}:\n${msg.content}`)
    .join("\n\n");

  const result = await model.generateContent(prompt);
  const reply = result.response.text();

  return reply || "No response";
}

router.post("/chat", requireAuth, async (req, res) => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { messages } = parsed.data;
  const systemMessage = {
    role: "system",
    content: `You are MinePilot AI, an expert Minecraft server management assistant.
You help server administrators with:
- Plugin recommendations and troubleshooting for Paper, Spigot, PocketMine-MP, BungeeCord, Velocity
- Server performance optimization
- Error diagnosis and fixes
- Configuration help (YAML, permissions, etc.)
- Crash log analysis
- General Minecraft server management

Be concise, practical, and technical. Format responses with markdown when helpful.`,
  };

  try {
    const reply = await callGemini([systemMessage, ...messages]);
    res.json({ message: reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI service error";
    console.error("Gemini /chat error:", err);
    res.status(500).json({ error: msg });
  }
});

router.post("/analyze-log", requireAuth, async (req, res) => {
  const parsed = AnalyzeLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { log } = parsed.data;
  const messages = [
    {
      role: "system",
      content: `You are a Minecraft server crash log expert. Analyze the provided crash log or error log and provide:
1. Root Cause: What caused the crash/error
2. Affected Components: Plugins, mods, or server components involved
3. Fix Steps: Numbered list of steps to resolve the issue
4. Prevention: How to prevent this in the future

Be specific about plugin names, version conflicts, and missing dependencies. Format with markdown.`,
    },
    {
      role: "user",
      content: `Please analyze this Minecraft server log:\n\n${log}`,
    },
  ];

  try {
    const reply = await callGemini(messages);
    res.json({ message: reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI service error";
    console.error("Gemini /analyze-log error:", err);
    res.status(500).json({ error: msg });
  }
});

router.post("/suggest-config", requireAuth, async (req, res) => {
  const parsed = SuggestConfigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { pluginName } = parsed.data;
  const messages = [
    {
      role: "system",
      content: `You are a Minecraft plugin configuration expert. Provide recommended configurations for plugins.`,
    },
    {
      role: "user",
      content: `Provide a recommended starter configuration for the Minecraft plugin: ${pluginName}.
Include:
1. Suggested rank/group structure (if applicable)
2. Recommended settings with explanations
3. YAML config snippets
4. Common pitfalls to avoid`,
    },
  ];

  try {
    const reply = await callGemini(messages);
    res.json({ message: reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI service error";
    console.error("Gemini /suggest-config error:", err);
    res.status(500).json({ error: msg });
  }
});

export default router;