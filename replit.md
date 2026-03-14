# MinePilot

AI-powered Minecraft server management SaaS dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS v4, shadcn/ui
- **Auth**: JWT + bcrypt + Google OAuth + GitHub OAuth
- **AI**: OpenAI GPT-4o mini
- **SSH**: node-ssh

## Structure

```text
artifacts/
  api-server/          # Express 5 API server
    src/
      routes/          # auth, servers, plugins, console, files, ai, activity
      services/        # SSH service, activity logger
      middlewares/     # JWT auth middleware
      lib/             # JWT helpers, AES-256 encryption utilities
  minepilot/           # React + Vite frontend (preview at /)
    src/
      pages/           # Login, Register, Dashboard, Servers, ServerDetail,
                       # Marketplace, AiAssistant, LogAnalyzer, Settings
      components/      # Layout (sidebar nav), UI components
      lib/             # AuthContext (JWT), utils

lib/
  api-spec/            # OpenAPI 3.1 spec + Orval codegen config
  api-client-react/    # Generated React Query hooks + custom-fetch (injects JWT)
  api-zod/             # Generated Zod schemas
  db/                  # Drizzle ORM
    src/schema/        # users, servers, installed_plugins, console_entries, activity_logs
```

## Key Features

1. Auth System — Email/password, Google OAuth, GitHub OAuth; JWT stored in localStorage
2. Dashboard — Server list, activity feed, stats cards
3. Server Connection — SSH connect/disconnect with encrypted credential storage
4. Setup Wizard — Paper/Spigot/Purpur + game mode selection
5. Plugin Marketplace — 10 plugins (EssentialsX, LuckPerms, WorldEdit, etc.)
6. Server Console — Terminal UI with command history
7. File Manager — Browse/read/write/delete files over SSH
8. AI Assistant — GPT-4o mini chat for server help
9. Error Log Analyzer — AI crash log diagnosis
10. Health Monitor — CPU, RAM, TPS, Disk auto-refresh every 10s
11. Settings — Change password, delete account

## Environment Variables

```
DATABASE_URL=
JWT_SECRET=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## TypeScript

- Lib packages are composite and use `tsc --build`
- Typecheck: `pnpm run typecheck` from root
- `lib/api-zod/src/index.ts` only exports from `./generated/api` (not types) to avoid duplicate export collisions

## Root Scripts

- `pnpm run build` — typecheck then build all packages
- `pnpm run typecheck` — full typecheck (libs + artifacts)

## API Routes

- `POST /api/auth/register` — Register with email/password
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (JWT required)
- `POST /api/auth/change-password` — Change password
- `DELETE /api/auth/delete-account` — Delete account
- `GET /api/auth/google` — Google OAuth redirect
- `GET /api/auth/github` — GitHub OAuth redirect
- `GET/POST /api/servers` — List/create servers
- `GET/PUT/DELETE /api/servers/:id` — Server CRUD
- `POST /api/servers/:id/connect` — SSH connect
- `POST /api/servers/:id/disconnect` — SSH disconnect
- `GET /api/servers/:id/stats` — Server stats
- `POST /api/servers/:id/setup` — Setup wizard
- `GET /api/plugins` — Plugin catalog
- `GET /api/plugins/installed` — Installed plugins
- `POST /api/plugins/install` — Install plugin
- `POST /api/console/command` — Send SSH command
- `GET /api/console/history` — Command history
- `GET /api/files/list` — List files
- `GET /api/files/read` — Read file
- `POST /api/files/write` — Write file
- `DELETE /api/files/delete` — Delete file
- `POST /api/ai/chat` — AI chat
- `POST /api/ai/analyze-log` — Log analysis
- `POST /api/ai/suggest-config` — Plugin config suggestions
- `GET /api/activity` — Activity logs
