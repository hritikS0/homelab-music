# Homelab Music Backend & App Foundation

Homelab Music is a self-hosted music streaming platform (similar to Plexamp or Navidrome) built with Next.js, React 19, TypeScript, and Prisma ORM.

This is the production-ready project foundation and architecture setup.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19, strict TypeScript)
- **Backend & Database**: Next.js Route Handlers + [Prisma ORM](https://www.prisma.io/) + SQLite
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth Shell**: [Auth.js](https://authjs.dev/) placeholder
- **Logging**: [Pino](https://github.com/pinojs/pino)
- **Code Quality**: ESLint (Flat Config), Prettier, Husky, lint-staged

---

## Folder Structure

```text
homelab-music/
│
├── prisma/
│   └── schema.prisma        # SQLite schema configuration
│
├── public/                  # Static assets
│
├── src/
│   ├── actions/             # Next.js Server Actions
│   │
│   ├── app/                 # Next.js App Router root
│   │   ├── (dashboard)/     # Main dashboard route group
│   │   ├── (public)/        # Public landing/login route group
│   │   ├── api/
│   │   │   ├── health/      # Health check endpoint (/api/health)
│   │   │   └── v1/          # Versioned API routes
│   │   ├── globals.css      # Core styles (Tailwind CSS)
│   │   ├── layout.tsx       # Root layout file
│   │   └── page.tsx         # Sleek landing page
│   │
│   ├── components/          # Reusable React components
│   │   ├── ui/              # shadcn/ui basic components
│   │   ├── common/          # Global layout helpers (buttons, cards, etc.)
│   │   ├── layout/          # Page layouts (headers, sidebars)
│   │   └── music/           # Audio/music specific components
│   │
│   ├── config/              # Global config files
│   │   ├── env.ts           # Zod validated env loader
│   │   └── logger.ts        # Pino logger config
│   │
│   ├── hooks/               # Custom React hooks
│   │
│   ├── lib/                 # Third-party wrappers and helpers
│   │   ├── prisma.ts        # Singleton Prisma client
│   │   ├── auth.ts          # Auth.js provider shell
│   │   ├── response.ts      # Success/error response wrappers
│   │   └── validations/     # Zod input schemas
│   │
│   ├── providers/           # React context providers
│   │
│   ├── repositories/        # Database access layer (communicates with Prisma)
│   │
│   ├── services/            # Business logic layer (computations, orchestration)
│   │
│   ├── store/               # Global state stores (Zustand/Redux)
│   │
│   ├── types/               # Type definitions
│   │
│   ├── utils/               # Generic utility helpers
│   │   └── appError.ts      # AppError custom exception class
│   │
│   └── middleware.ts        # Next.js global request middleware
│
├── uploads/                 # Local directory for files (ignored)
│   ├── songs/               # Audio files
│   ├── covers/              # Artwork images
│   └── temp/                # Temp upload chunks
│
├── .env.example             # Template env parameters
├── .gitignore               # Git ignored folders list
├── eslint.config.mjs        # Flat ESLint rules configuration
├── prettier.config.js       # Prettier formatting config
├── tsconfig.json            # Strict TypeScript configuration
└── README.md                # System documentation
```

---

## Architectural Rules

We enforce a strict **Layered Architecture** for API endpoints to keep the codebase modular, testable, and maintainable.

```text
[API Route Handler] 
        ↓  (processes HTTP, parses input, handles response headers)
  [Service Layer]
        ↓  (coordinates business rules, verification, auth checks)
[Repository Layer]
        ↓  (direct query builder or Prisma actions)
  [Prisma Client]
```

### Key Guidelines:
1. **No direct database queries inside Route Handlers**. They must request data via services.
2. **Controllers/Route Handlers only handle HTTP**. Parsing params/body and returning status codes.
3. **Services contain business logic**. Calculating metrics, processing inputs, triggering metadata parsing.
4. **Repositories map queries to DB**. Keep Prisma calls isolated inside repositories so swapping ORMs or modifying schema doesn't affect services.
5. **Dependency Injection**: Inject repository instances into services to allow easy unit testing and mocking.

---

## Environment Variables

The server validates configurations using Zod at startup. Failures cause immediate system termination.

Create a `.env` file in the root based on `.env.example`:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode of the application | `development` |
| `DATABASE_URL` | Prisma DB connection URL | `file:./dev.db` |
| `JWT_SECRET` | Authentication encryption key | `some-long-random-string` |
| `UPLOAD_DIR` | Directory for audio/image storage | `./uploads` |
| `LOG_LEVEL` | Pino logging sensitivity level | `info` |
| `NEXT_PUBLIC_APP_URL` | Base canonical url of client | `http://localhost:3000` |

---

## Commands and Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Next.js hot-reloaded development environment |
| `npm run build` | Compiles code and generates standard Next.js build bundle |
| `npm run start` | Boots the compiled production application |
| `npm run lint` | Runs ESLint verification on `src/` directory |
| `npm run format` | Standardizes styling using Prettier formatting rules |
| `npm run prisma:generate` | Generates TypeScript client files for Prisma database schema |
| `npm run prisma:migrate` | Runs Prisma schema migrations against the SQLite database |

---

## Development Setup

1. Clone repository and run `npm install`.
2. Configure your local `.env` parameters.
3. Generate Prisma client & create database:
   ```bash
   npm run prisma:migrate
   ```
4. Fire up the development environment:
   ```bash
   npm run dev
   ```
5. Navigate to [http://localhost:3000](http://localhost:3000) to see the landing page.
