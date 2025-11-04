# Copilot Instructions

This document provides essential guidance for AI agents to effectively contribute to the BookWise library management system codebase.

## Project Overview & Architecture

This is a `pnpm` monorepo containing two primary applications:

1.  **`apps/api`**: A backend API built with **Fastify** and **TypeScript**.
2.  **`apps/web`**: A frontend application built with **Vue.js** and **TypeScript**.

The core business logic and data management are handled by the `api` service, while the `web` service provides the user interface.

### Key Files & Directories

- `pnpm-workspace.yaml`: Defines the monorepo structure.
- `apps/api/package.json`: Contains scripts for running, building, and testing the backend.
- `apps/web/package.json`: Contains scripts for the frontend development server and build process.
- `apps/api/prisma/schema.prisma`: The single source of truth for the database schema. The ER diagram is in `README.md`.
- `apps/api/src/app.ts`: The main entry point for the Fastify server.
- `apps/api/src/modules/`: Contains the different modules of the API, each with its own routes, controllers, services, and schemas.
- `apps/web/src/main.ts`: The entry point for the Vue application.

## Development Workflow

### Backend (`apps/api`)

- **Running the dev server**: `pnpm --filter @book-wise/api dev`
- **Building for production**: `pnpm --filter @book-wise/api build`
- **Running in production**: `pnpm --filter @book-wise/api start`

### Frontend (`apps/web`)

- **Running the dev server**: `pnpm --filter @book-wise/web dev`
- **Building for production**: `pnpm --filter @book-wise/web build`

## Database

The project uses **Prisma** as the ORM.

- **Schema**: The database schema is defined in `apps/api/prisma/schema.prisma`.
- **Migrations**: To create a new migration after modifying the schema, run: `pnpm --filter @book-wise/api prisma:migrate`.
- **Client Generation**: The Prisma client is generated automatically after a migration, but can be triggered manually with `pnpm --filter @book-wise/api prisma:generate`.

When working with the database, always use the Prisma client. The client is available in the Fastify instance at `fastify.prisma`.

## API Structure (`apps/api`)

The API follows a modular structure. Each module (e.g., `auth`, `author`) in `apps/api/src/modules` typically contains:

- `*.controller.ts`: Handles incoming requests and sends responses.
- `*.service.ts`: Contains the business logic.
- `*.schema.ts`: Defines the `TypeBox` schemas for request and response validation.
- `*.routes.ts`: Defines the routes for the module and plugs them into the Fastify app.

Authentication is handled using JWT. The `auth` hook in `apps/api/src/hooks/auth.ts` protects routes.

## Testing

The project uses `vitest` for testing.

- **Running tests**: `pnpm --filter @book-wise/api test`
- **Running tests with coverage**: `pnpm --filter @book-wise/api test:coverage`

Tests are located in `apps/api/tests`. Integration tests are in `apps/api/tests/integration` and unit tests are in `apps/api/tests/unit`. When adding new features, please add corresponding tests.
