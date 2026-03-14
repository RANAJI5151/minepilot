# MinePilot

An AI-powered Minecraft server management SaaS dashboard. Manage servers, install plugins, troubleshoot errors, and automate server setup — all from one clean, modern dashboard.

## Features

### Core Functionality
- **Authentication System**
  - Email/password registration and login with bcrypt hashing
  - Google OAuth integration
  - GitHub OAuth integration
  - JWT-based sessions with 30-day expiration
  - Secure password change functionality

- **Server Management**
  - Connect to remote Minecraft servers via SSH
  - Encrypted storage of SSH credentials (AES-256-CBC)
  - Real-time server status monitoring
  - Server connection/disconnection controls

- **Plugin Marketplace**
  - Browse popular Minecraft plugins
  - One-click installation via SSH
  - Plugin version management
  - Activity logging for all plugin operations

- **Server Console**
  - Real-time terminal interface
  - Command history and execution
  - Output streaming from server

- **File Management**
  - Browse server directories over SSH
  - Edit configuration files (YAML, properties, etc.)
  - File upload/download capabilities

- **AI-Powered Features**
  - Chat with GPT-4o mini for server management advice
  - Intelligent plugin recommendations
  - Crash log analysis and troubleshooting
  - Performance optimization suggestions

- **Monitoring & Analytics**
  - Real-time CPU, RAM, TPS, and disk usage
  - Server health dashboard
  - Activity logs for all user actions
  - Error tracking and reporting

### User Experience
- **Modern UI**: Built with React, TypeScript, and TailwindCSS
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Automatic theme switching
- **Intuitive Navigation**: Clean, organized dashboard layout
- **Real-time Updates**: Live data refresh for server stats

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, TypeScript, Vite | Modern SPA with fast development |
| **UI Framework** | TailwindCSS, shadcn/ui, Framer Motion | Beautiful, accessible components |
| **Backend** | Node.js, Express, TypeScript | RESTful API server |
| **Database** | PostgreSQL + Drizzle ORM | Type-safe database operations |
| **Authentication** | JWT, bcrypt, OAuth 2.0 | Secure user sessions |
| **AI Integration** | OpenAI GPT-4o mini | Intelligent assistance |
| **SSH Client** | node-ssh | Remote server management |
| **API Documentation** | OpenAPI 3.1 + Orval | Auto-generated client code |
| **Development** | pnpm, ESLint, Prettier | Efficient package management |

## Architecture

### Monorepo Structure
```
workspaces/
├── artifacts/
│   ├── api-server/          # Express.js API server
│   │   ├── src/
│   │   │   ├── app.ts       # Express app setup
│   │   │   ├── index.ts     # Server entry point
│   │   │   ├── routes/      # API route handlers
│   │   │   ├── services/    # Business logic (SSH, activity)
│   │   │   ├── middlewares/ # Auth middleware
│   │   │   └── lib/         # Utilities (JWT, encryption)
│   │   └── package.json
│   └── minepilot/           # React frontend
│       ├── src/
│       │   ├── App.tsx      # Main app component
│       │   ├── pages/       # Route components
│       │   ├── components/  # Reusable UI components
│       │   ├── lib/         # Auth context, utilities
│       │   └── hooks/       # Custom React hooks
│       ├── vite.config.ts   # Vite configuration
│       └── package.json
├── lib/
│   ├── api-spec/            # OpenAPI specification
│   │   ├── openapi.yaml     # API schema definition
│   │   └── orval.config.ts  # Code generation config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Database layer
│       ├── src/
│       │   ├── index.ts     # DB connection & exports
│       │   └── schema/      # Drizzle table definitions
│       └── drizzle.config.ts
├── scripts/                 # Utility scripts
└── package.json             # Workspace configuration
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `DELETE /api/auth/delete-account` - Delete account
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback

#### Servers
- `GET /api/servers` - List user's servers
- `POST /api/servers` - Create new server
- `GET /api/servers/:id` - Get server details
- `PUT /api/servers/:id` - Update server
- `DELETE /api/servers/:id` - Delete server
- `POST /api/servers/:id/connect` - Connect to server
- `POST /api/servers/:id/disconnect` - Disconnect from server
- `GET /api/servers/:id/stats` - Get server statistics
- `POST /api/servers/:id/setup` - Setup server (install Paper/Spigot)

#### Plugins
- `GET /api/plugins` - List available plugins
- `POST /api/plugins/install` - Install plugin on server
- `GET /api/installed-plugins` - List installed plugins

#### Console
- `GET /api/console/:serverId` - Get console history
- `POST /api/console/:serverId` - Execute command

#### Files
- `GET /api/files/:serverId` - List directory contents
- `GET /api/files/:serverId/content` - Get file content
- `PUT /api/files/:serverId/content` - Update file content

#### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/analyze-log` - Analyze server logs

#### Activity
- `GET /api/activity` - Get user activity logs

## Setup & Installation

### Prerequisites
- **Node.js**: Version 20 or higher
- **pnpm**: Version 9 or higher (recommended package manager)
- **PostgreSQL**: Version 13 or higher
- **Git**: For cloning the repository

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/RANAJI5151/minepilot.git
   cd minepilot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/minepilot

   # Server Configuration
   PORT=3000
   FRONTEND_URL=http://localhost:3001

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

   # OpenAI Integration
   OPENAI_API_KEY=sk-proj-...

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # GitHub OAuth (optional)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

4. **Set up the database**
   ```bash
   # Push database schema
   pnpm --filter @workspace/db run push
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Start API server
   pnpm --filter @workspace/api-server run dev

   # Terminal 2: Start frontend
   pnpm --filter @workspace/minepilot run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3001
   - API: http://localhost:3000

### OAuth Configuration

#### Google OAuth Setup
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth Setup
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3001/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## Development

### Available Scripts

```bash
# Install dependencies
pnpm install

# Start all development servers
pnpm dev

# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Build all packages
pnpm run build

# Clean all build artifacts
pnpm run clean
```

### Development Workflow

1. **Make changes** to code
2. **Run type checking** to catch errors: `pnpm run typecheck`
3. **Test functionality** by running dev servers
4. **Commit changes** with descriptive messages
5. **Push to repository**

### Database Migrations

When you modify the database schema in `lib/db/src/schema/`:

```bash
# Generate and push schema changes
pnpm --filter @workspace/db run push

# For production, use migration files
pnpm --filter @workspace/db run generate
pnpm --filter @workspace/db run migrate
```

### API Code Generation

The API client and schemas are auto-generated from the OpenAPI spec:

```bash
# Regenerate API client and schemas
pnpm --filter @workspace/api-spec run generate
```

## Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build Command**: `pnpm --filter @workspace/minepilot run build`
2. **Publish Directory**: `artifacts/minepilot/dist`
3. **Environment Variables**:
   - `VITE_API_URL`: Your API server URL (e.g., `https://api.minepilot.com`)

### Backend Deployment (Railway/Render/Fly.io)

1. **Build Command**: `pnpm --filter @workspace/api-server run build`
2. **Start Command**: `node artifacts/api-server/dist/index.cjs`
3. **Environment Variables**: All variables from `.env`
4. **Database**: Ensure PostgreSQL is available

### Docker Deployment

```dockerfile
# Example Dockerfile for API server
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build
EXPOSE 3000
CMD ["node", "artifacts/api-server/dist/index.cjs"]
```

## Security

- **Password Security**: bcrypt hashing with 12 salt rounds
- **SSH Credentials**: AES-256-CBC encryption for stored passwords
- **Authentication**: JWT tokens with configurable expiration
- **Input Validation**: Zod schemas on all API endpoints
- **CORS**: Configured for production domains
- **Rate Limiting**: Implemented on authentication endpoints
- **HTTPS**: Required in production environments

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and ensure tests pass
4. Run type checking: `pnpm run typecheck`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write descriptive commit messages
- Add JSDoc comments for public APIs

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database user permissions

**OAuth Not Working**
- Check callback URLs in OAuth app settings
- Ensure `FRONTEND_URL` is correct
- Verify client ID and secret in `.env`

**Build Errors**
- Run `pnpm install` to ensure dependencies
- Check Node.js version (20+ required)
- Clear node_modules: `rm -rf node_modules && pnpm install`

**Port Conflicts**
- API server uses port 3000
- Frontend uses port 3001 (or next available)
- Change ports in `.env` if needed

### Getting Help
- Check existing issues on GitHub
- Review the API documentation in `lib/api-spec/openapi.yaml`
- Join our Discord community

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/), [Express](https://expressjs.com/), and [PostgreSQL](https://postgresql.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- AI powered by [OpenAI](https://openai.com/)
