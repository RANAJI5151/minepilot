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

## Authentication System

MinePilot implements a comprehensive authentication system supporting multiple login methods with enterprise-grade security.

### How Authentication Works

#### 1. **JWT-Based Sessions**
- **Token Generation**: When users log in, the server creates a JWT containing user ID and email
- **Token Storage**: Frontend stores the JWT in localStorage for persistence
- **Token Validation**: All protected API routes verify the JWT using middleware
- **Token Expiration**: JWTs expire after 30 days for security
- **Automatic Renewal**: Frontend handles token refresh on page reload

#### 2. **Password Security**
- **Hashing Algorithm**: bcrypt with 12 salt rounds (slow, secure)
- **Password Requirements**: Minimum 8 characters (enforced by Zod validation)
- **Password Changes**: Secure change-password endpoint with current password verification

#### 3. **OAuth 2.0 Integration**
- **Google OAuth**: Uses Google Identity Platform for seamless login
- **GitHub OAuth**: Integrates with GitHub's OAuth for developer-friendly auth
- **State Protection**: OAuth flows include state parameters to prevent CSRF
- **Profile Sync**: Automatically syncs user profile data (name, avatar) from OAuth providers

#### 4. **Session Management**
- **Stateless Sessions**: No server-side session storage, purely JWT-based
- **Cross-Tab Sync**: Auth state automatically syncs across browser tabs
- **Logout Handling**: Secure logout removes tokens and redirects to login
- **Route Protection**: Automatic redirects for unauthenticated users

### Authentication Flow Diagrams

#### Email/Password Login Flow:
```
1. User submits email/password → Frontend
2. Frontend calls POST /api/auth/login → API Server
3. API validates credentials against database
4. API generates JWT token
5. API returns token + user data → Frontend
6. Frontend stores token in localStorage
7. Frontend redirects to dashboard
```

#### OAuth Login Flow:
```
1. User clicks "Login with Google" → Frontend
2. Frontend redirects to /api/auth/google → API Server
3. API redirects to Google OAuth → Google
4. User authorizes app → Google
5. Google redirects to /api/auth/google/callback → API Server
6. API exchanges code for user info
7. API creates/updates user record
8. API generates JWT and redirects to frontend with token
9. Frontend stores token and redirects to dashboard
```

### Frontend Authentication Implementation

#### AuthContext (`src/lib/auth.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  oauthError: string | null;
  login: (token: string) => void;
  logout: () => void;
}
```

#### Route Protection
- **Public Routes**: `/login`, `/register`
- **Protected Routes**: All others require authentication
- **Automatic Redirects**: Unauthenticated users → `/login`

#### OAuth Error Handling
- **Callback Errors**: Displayed as toast notifications
- **Network Errors**: Graceful fallback with user-friendly messages
- **State Validation**: Prevents CSRF attacks

### Backend Authentication Implementation

#### JWT Middleware (`src/middlewares/auth.ts`)
```typescript
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

#### Password Hashing (`src/lib/jwt.ts`)
```typescript
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

#### OAuth User Creation
- **First Login**: Creates new user record with OAuth data
- **Returning Users**: Updates profile information
- **Email Conflicts**: Handles duplicate emails gracefully
- **Profile Sync**: Updates name and avatar from OAuth provider

### Database Schema
The authentication system uses the following database tables:
- `users`: Stores user accounts with email, password hash, OAuth provider info
- `activity_logs`: Tracks all user actions for security auditing

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

#### Google OAuth Setup (Step-by-Step)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Create Project" or select an existing project
   - Note your Project ID for reference

2. **Enable Google Identity API**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google+ API" and click on it
   - Click "Enable" to activate the API

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in app information:
     - App name: "MinePilot"
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `openid`, `email`, `profile`
   - Add test users if needed (your email)

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "MinePilot Web Client"
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
   - Click "Create"

5. **Get Your Credentials**
   - Copy the "Client ID" and "Client Secret"
   - Add to your `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

#### GitHub OAuth Setup (Step-by-Step)

1. **Access GitHub OAuth Apps**
   - Go to GitHub.com and sign in
   - Click your profile picture → "Settings"
   - Scroll down to "Developer settings" → "OAuth Apps"

2. **Register New OAuth Application**
   - Click "New OAuth App" button
   - Fill in application details:
     - Application name: "MinePilot"
     - Homepage URL: `http://localhost:3001`
     - Application description: "Minecraft server management dashboard"
     - Authorization callback URL: `http://localhost:3001/api/auth/github/callback`

3. **Generate Client Secret**
   - After creating the app, you'll see the Client ID
   - Click "Generate a new client secret"
   - Copy both Client ID and Client Secret

4. **Configure Environment Variables**
   - Add to your `.env` file:
   ```env
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

#### Testing OAuth Setup

1. **Start your development servers**
   ```bash
   pnpm --filter @workspace/api-server run dev &
   pnpm --filter @workspace/minepilot run dev
   ```

2. **Test Google OAuth**
   - Go to http://localhost:3001/login
   - Click "Continue with Google"
   - You should be redirected to Google for authorization
   - After approval, you should return to the dashboard

3. **Test GitHub OAuth**
   - Click "Continue with GitHub" on the login page
   - Authorize the application on GitHub
   - You should be redirected back to the dashboard

4. **Verify User Creation**
   - Check your database to ensure user records are created
   - OAuth users should have `provider` set to "google" or "github"
   - Profile information (name, avatar) should be synced

#### Production OAuth Setup

For production deployment, update the callback URLs in your OAuth apps:

**Google:**
- Authorized redirect URI: `https://yourdomain.com/api/auth/google/callback`

**GitHub:**
- Authorization callback URL: `https://yourdomain.com/api/auth/github/callback`

Make sure to set `FRONTEND_URL` in your production `.env`:
```env
FRONTEND_URL=https://yourdomain.com
```

#### Troubleshooting OAuth

**Common Issues:**
- **"redirect_uri_mismatch"**: Callback URL doesn't match OAuth app settings
- **"invalid_client"**: Wrong Client ID or Secret
- **Stuck on OAuth page**: Check network tab for failed requests
- **No user created**: Check database connection and logs

**Debug Steps:**
1. Check browser network tab for failed requests
2. Verify environment variables are loaded
3. Check API server logs for OAuth errors
4. Ensure callback URLs match exactly (including protocol and port)

### Testing Authentication

#### Manual API Testing

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Get current user (with token):**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Frontend Testing

1. **Email Registration Flow**
   - Visit http://localhost:3001/register
   - Fill out the form and submit
   - Should redirect to dashboard on success

2. **Email Login Flow**
   - Visit http://localhost:3001/login
   - Enter credentials and submit
   - Should redirect to dashboard

3. **OAuth Testing**
   - Click OAuth buttons on login page
   - Complete authorization flow
   - Should return to dashboard with user logged in

4. **Session Persistence**
   - Login and refresh the page
   - Should remain logged in
   - Open new tab, should be logged in there too

5. **Logout Testing**
   - Click logout button
   - Should redirect to login page
   - Refreshing should stay on login page

#### Database Verification

Check that users are created correctly:

```sql
-- Check users table
SELECT id, email, name, provider, "createdAt" FROM users;

-- Check activity logs
SELECT * FROM activity_logs ORDER BY "createdAt" DESC LIMIT 10;
```

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
