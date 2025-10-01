# Junielyfe

Career & finance copilot MVP - A Turborepo monorepo powered by Next.js 15, Supabase, and QStash.

## Tech Stack

- **Monorepo**: Turborepo with pnpm workspaces
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Supabase (Postgres 15 + Auth + Storage)
- **Background Jobs**: Upstash QStash + Express worker
- **AI**: OpenAI GPT-5-nano
- **Analytics**: PostHog

## Project Structure

```
junielyfe/
├── apps/
│   ├── web/          # Next.js frontend app (port 3000)
│   └── worker/       # Background worker (port 3001)
├── packages/
│   ├── core/         # Business logic
│   ├── db/           # Supabase client & types
│   ├── agents/       # LLM agents
│   ├── ui/           # Shared UI components
│   ├── eslint-config/# Shared ESLint config
│   └── tsconfig/     # Shared TypeScript configs
├── turbo.json        # Turborepo pipeline
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20.x or higher
- pnpm 9.x or higher

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Run development servers**:
   ```bash
   pnpm dev
   ```
   - Web app: http://localhost:3000
   - Worker: http://localhost:3001

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type-check all packages
- `pnpm test` - Run tests across all packages
- `pnpm clean` - Clean all build artifacts

## Development

This project follows the [Constitutional AI principles](/.specify/memory/constitution.md) with 37 foundational principles governing product, privacy, security, accessibility, quality, and performance.
