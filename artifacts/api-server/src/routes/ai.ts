import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { AiChatBody, AnalyzeLogBody, SuggestConfigBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  const url = baseUrl
    ? `${baseUrl}/chat/completions`
    : "https://api.openai.com/v1/chat/completions";

  if (!apiKey) throw new Error("OpenAI API key not configured");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      messages,
      max_completion_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI service error: ${err}`);
  }

  const data = await response.json() as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content || "No response";
}

router.post("/chat", requireAuth, async (req, res) => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { messages } = parsed.data;
  const systemMessage = {
    role: "system" as const,
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
    const reply = await callOpenAI([systemMessage, ...messages]);
    res.json({ message: reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI service error";
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
      role: "system" as const,
      content: `You are a Minecraft server crash log expert. Analyze the provided crash log or error log and provide:
1. **Root Cause**: What caused the crash/error
2. **Affected Components**: Plugins, mods, or server components involved
3. **Fix Steps**: Numbered list of steps to resolve the issue
4. **Prevention**: How to prevent this in the future

Be specific about plugin names, version conflicts, and missing dependencies. Format with markdown.`,
    },
    {
      role: "user" as const,
      content: `Please analyze this Minecraft server log:\n\n${log}`,
    },
  ];

  try {
    const reply = await callOpenAI(messages);
    res.json({ message: reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI service error";
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
      role: "system" as const,
      content: `You are a Minecraft plugin configuration expert. Provide recommended configurations for plugins.`,
    },
    {
      role: "user" as const,
      content: `Provide a recommended starter configuration for the Minecraft plugin: ${pluginName}. 
Include:
1. Suggested rank/group structure (if applicable)
2. Recommended settings with explanations
3. YAML config snippets
4. Common pitfalls to avoid`,
    },
  ];

  try {
    const reply = await callOpenAI(messages);
    res.json({ message: reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI service error";
    res.status(500).json({ error: msg });
  }
});

export default router;
