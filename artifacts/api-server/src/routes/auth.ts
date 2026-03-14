import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import axios from "axios";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import {
  RegisterBody,
  LoginBody,
  ChangePasswordBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password, name } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    email,
    name,
    passwordHash,
    provider: "email",
  }).returning();

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
      createdAt: user.createdAt,
    },
  });
});

router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
      createdAt: user.createdAt,
    },
  });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    provider: user.provider,
    createdAt: user.createdAt,
  });
});

router.post("/change-password", requireAuth, async (req: AuthRequest, res) => {
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { currentPassword, newPassword } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user || !user.passwordHash) {
    res.status(400).json({ error: "Cannot change password for OAuth account" });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, req.userId!));
  res.json({ message: "Password changed successfully" });
});

router.delete("/delete-account", requireAuth, async (req: AuthRequest, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, req.userId!));
  res.json({ message: "Account deleted" });
});

// Google OAuth
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: "Google OAuth not configured" });
    return;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl(req, "google"),
    response_type: "code",
    scope: "openid email profile",
    state: "google_oauth",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query as { code: string };
  if (!code) {
    res.redirect("/?error=oauth_failed");
    return;
  }

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: getCallbackUrl(req, "google"),
      grant_type: "authorization_code",
    });

    const userRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    });

    const { email, name, picture, sub } = userRes.data;
    const token = await upsertOAuthUser({ email, name, avatarUrl: picture, provider: "google", providerId: sub });
    res.redirect(`/?token=${token}`);
  } catch {
    res.redirect("/?error=oauth_failed");
  }
});

// GitHub OAuth
router.get("/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: "GitHub OAuth not configured" });
    return;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl(req, "github"),
    scope: "user:email",
    state: "github_oauth",
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get("/github/callback", async (req, res) => {
  const { code } = req.query as { code: string };
  if (!code) {
    res.redirect("/?error=oauth_failed");
    return;
  }

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: getCallbackUrl(req, "github"),
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let email = userRes.data.email;
    if (!email) {
      const emailsRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const primary = emailsRes.data.find((e: { primary: boolean; email: string }) => e.primary);
      email = primary?.email;
    }

    const { login, avatar_url, id } = userRes.data;
    const token = await upsertOAuthUser({
      email: email || `${login}@github.com`,
      name: userRes.data.name || login,
      avatarUrl: avatar_url,
      provider: "github",
      providerId: String(id),
    });
    res.redirect(`/?token=${token}`);
  } catch {
    res.redirect("/?error=oauth_failed");
  }
});

async function upsertOAuthUser(data: {
  email: string;
  name: string;
  avatarUrl: string;
  provider: string;
  providerId: string;
}): Promise<string> {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, data.email)).limit(1);

  let user;
  if (existing.length > 0) {
    [user] = await db.update(usersTable)
      .set({ avatarUrl: data.avatarUrl, provider: data.provider, providerId: data.providerId })
      .where(eq(usersTable.email, data.email))
      .returning();
  } else {
    [user] = await db.insert(usersTable).values({
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      provider: data.provider,
      providerId: data.providerId,
    }).returning();
  }

  return signToken({ userId: user.id, email: user.email });
}

function getCallbackUrl(req: AuthRequest, provider: string): string {
  const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domains) {
    return `https://${domains}/api/auth/${provider}/callback`;
  }
  const host = req.get("host") || "localhost:80";
  const protocol = req.protocol || "http";
  return `${protocol}://${host}/api/auth/${provider}/callback`;
}

export default router;
