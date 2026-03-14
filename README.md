# MinePilot

An AI-powered Minecraft server management SaaS dashboard. Manage servers, install plugins, troubleshoot errors, and automate server setup — all from one clean, modern dashboard.

## Features

- **Authentication** — Email/password, Google OAuth, GitHub OAuth with JWT sessions
- **Server Dashboard** — Overview of all servers with status badges and activity feed
- **SSH Server Connection** — Connect to remote servers via SSH with encrypted credentials
- **Beginner Setup Wizard** — Auto-configure Paper/Spigot/Purpur servers with starter plugins
- **Plugin Marketplace** — Browse and install popular plugins (EssentialsX, LuckPerms, WorldEdit, etc.)
- **Server Console** — Terminal-style command input and history
- **File Manager** — Browse directories, edit YAML/config files over SSH
- **AI Assistant** — Chat with GPT-4o mini for plugin suggestions, performance tips, and troubleshooting
- **Error Log Analyzer** — Paste crash logs and get AI-powered diagnosis
- **Server Health Monitor** — Real-time CPU, RAM, TPS, disk usage (auto-refreshes every 10s)
- **Activity Logs** — Full history of server actions and plugin installs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, TailwindCSS, shadcn/ui |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT, bcrypt, Google OAuth, GitHub OAuth |
| AI | OpenAI GPT-4o mini |
| SSH | node-ssh |
| API | OpenAPI 3.1 + Orval codegen |

## Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file or set these in your environment:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# OpenAI (for AI Assistant & Log Analyzer)
OPENAI_API_KEY=sk-...

# Google OAuth (optional — enables Google login)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# GitHub OAuth (optional — enables GitHub login)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### OAuth Setup

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Authorized redirect URI: `https://yourdomain.com/api/auth/google/callback`

**GitHub OAuth:**
1. Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Authorization callback URL: `https://yourdomain.com/api/auth/github/callback`

### Development

```bash
# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in another terminal)
pnpm --filter @workspace/minepilot run dev

# Push database schema
pnpm --filter @workspace/db run push
```

Or in one command from root:
```bash
pnpm dev
```

### Build

```bash
# Build everything
pnpm run build

# Build only the API server
pnpm --filter @workspace/api-server run build

# Build only the frontend
pnpm --filter @workspace/minepilot run build
```

### Start (Production)

```bash
# Start the API server
node artifacts/api-server/dist/index.cjs
```

## Deployment

### Frontend (Netlify / Vercel)

1. Build command: `pnpm --filter @workspace/minepilot run build`
2. Publish directory: `artifacts/minepilot/dist`
3. Set environment variable: `VITE_API_URL=https://your-api-server.com`

### Backend (Render / Railway / Fly.io)

1. Build command: `pnpm --filter @workspace/api-server run build`
2. Start command: `node artifacts/api-server/dist/index.cjs`
3. Set all environment variables listed above

## Project Structure

```
artifacts/
  api-server/          # Express API server
    src/
      routes/          # auth, servers, plugins, console, files, ai, activity
      services/        # SSH service, activity logger
      middlewares/     # JWT auth middleware
      lib/             # JWT helpers, encryption utilities
  minepilot/           # React frontend
    src/
      pages/           # Login, Register, Dashboard, Servers, Marketplace, etc.
      components/      # Layout, shared UI components
      lib/             # Auth context, utilities

lib/
  api-spec/            # OpenAPI 3.1 spec + Orval codegen config
  api-client-react/    # Generated React Query hooks
  api-zod/             # Generated Zod validation schemas
  db/                  # Drizzle ORM schema + DB connection
    src/schema/        # users, servers, plugins, console, activity tables
```

## Security

- Passwords are hashed with bcrypt (12 rounds)
- SSH passwords are encrypted with AES-256-CBC before storage
- JWT tokens expire after 30 days
- All API routes (except auth) require a valid JWT token
- Input validation with Zod on all endpoints
- CORS configured for production domains
