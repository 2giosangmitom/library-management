---
applyTo: 'apps/api/**/*.ts'
---

# BookWise API Application

This directory contains the source code for the BookWise API application. The API is built using Fastify with TypeBox type provider and TypeScript.

## Project Structure

```
.
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── configService.ts
│   │   └── envSchema.ts
│   ├── generated/
│   │   └── prisma/
│   ├── hooks/
│   │   ├── auth.ts
│   │   └── onRoute.ts
│   ├── modules/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── author/
│   │   ├── book/
│   │   ├── category/
│   │   ├── loan/
│   │   ├── publisher/
│   │   ├── rating/
│   │   ├── staff/
│   │   │   ├── author/
│   │   │   ├── book/
│   │   │   ├── book_clone/
│   │   │   ├── category/
│   │   │   ├── location/
│   │   │   ├── loan/
│   │   │   ├── publisher/
│   │   │   └── autohooks.ts
│   │   └── user/
│   ├── plugins/
│   │   ├── auth.ts
│   │   ├── cookie.ts
│   │   ├── cors.ts
│   │   ├── jwt.ts
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   ├── sensible.ts
│   │   └── swagger.ts
│   ├── utils/
│   │   ├── hash.ts
│   │   └── jwt.ts
│   ├── app.ts
│   ├── constants.ts
│   └── server.ts
├── tests/
│   ├── integration/
│   │   ├── helpers/
│   │   │   ├── auth.ts
│   │   │   └── build.ts
│   │   ├── setup/
│   │   │   └── globalSetup.ts
│   │   └── staff/
│   └── unit/
│       ├── helpers/
│       │   └── mockFastify.ts
│       └── modules/
├── types/
│   └── global.d.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Key Components

- `prisma/`: Prisma schema and migration files for PostgreSQL database management.
- `src/config/`: Configuration management using `@fastify/env` with TypeBox schema validation.
  - `configService.ts`: Service class for registering and accessing environment configuration.
  - `envSchema.ts`: TypeBox schema defining required environment variables (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`).
- `src/generated/`: Auto-generated files (Prisma client with `@prisma/client`).
- `src/hooks/`: Reusable Fastify hooks for authentication and route modification.
  - `auth.ts`: Authentication hooks (`authHook`, `isLibrarianHook`, `isAdminHook`, `isAdminOrLibrarianHook`).
  - `onRoute.ts`: Route modification hooks (e.g., adding tags for Swagger).
- `src/modules/`: Application modules organized by feature domain.
- `src/plugins/`: Fastify plugins wrapped with `fastify-plugin` for proper encapsulation.
- `src/utils/`: Utility functions for hashing, JWT operations, etc.
- `src/app.ts`: Application factory using `@fastify/autoload` for automatic plugin and route loading.
- `src/server.ts`: Server entry point with graceful shutdown handling.
- `tests/`: Test suites using Vitest with separate unit and integration configurations.
- `types/global.d.ts`: Global TypeScript declarations for `FastifyTypeBox`, `FastifyRequestTypeBox`, `FastifyReplyTypeBox`, `AccessToken`, and `RefreshToken` types.

## Running Tests

```bash
# Run unit tests
pnpm --filter api test:unit

# Run integration tests
pnpm --filter api test:integration

# Run coverage report
pnpm --filter api test:coverage

# Run a single test file
pnpm --filter api test:unit path/to/test/file.ts
pnpm --filter api test:integration path/to/test/file.ts
```

## Writing Tests

### Unit Tests

- Located in `tests/unit/`.
- Use Vitest with mocked dependencies.
- Use `buildMockFastify()` from `tests/unit/helpers/mockFastify.ts` to create a mock Fastify instance with mocked Prisma and Redis.

```ts
import { buildMockFastify } from '@tests/unit/helpers/mockFastify';
import { Prisma } from '@/generated/prisma/client';

describe('YourService', async () => {
  const app = await buildMockFastify();
  const service = YourService.getInstance(app);

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('should handle Prisma errors correctly', async () => {
    // Mock Prisma to throw a specific error
    vi.mocked(app.prisma.model.create).mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      })
    );

    await expect(service.create(data)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ConflictError: Resource already exists.]`
    );
  });
});
```

**Important:** When adding new Prisma models to test, update `mockFastify.ts` to include mock functions for the new model.

### Integration Tests

- Located in `tests/integration/`.
- Use the real Fastify application with a test database.
- Global setup in `tests/integration/setup/globalSetup.ts` creates test users and handles database migrations.

```ts
import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';

describe('POST /api/staff/resource', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  afterAll(async () => {
    await app.close();
  });

  // Test cases here...
});
```

### Pre-registered Test Users

The `users` array provides 10 pre-registered users with the following roles:

| Index | Role      | Email               |
| ----- | --------- | ------------------- |
| 0     | ADMIN     | user0@example.com   |
| 1-3   | LIBRARIAN | user1-3@example.com |
| 4-9   | MEMBER    | user4-9@example.com |

Each user has `{ email, password: 'Password123!', fullName }` properties.

### Using `it.each` for Role-Based Permission Tests

When testing endpoints accessible by multiple roles, use `it.each` to reduce duplication:

```ts
import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';

describe('POST /api/staff/resource', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/resource',
      payload: { name: 'test' }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/resource',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: { name: 'test' }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should allow $role to create resource',
    async ({ role }) => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/staff/resource',
        headers: { Authorization: `Bearer ${accessTokens[role]}` },
        payload: { name: 'test' }
      });

      expect(response.statusCode).toBe(201);
    }
  );
});
```

**Important:** When adding new modules, register the routes and autohooks in `tests/integration/helpers/build.ts`.

## Implementing New Features

### Module Structure

Each module should follow this structure:

```
src/modules/
└── feature/
    ├── autohooks.ts   # Route hooks (tags, authentication)
    ├── controllers.ts # Request/response handling
    ├── routes.ts      # Route definitions
    ├── schemas.ts     # TypeBox request/response schemas
    └── services.ts    # Business logic and database operations
```

### Service Pattern (Singleton with Dependency Injection)

```ts
import { Prisma } from '@/generated/prisma/client';

export default class FeatureService {
  private static instance: FeatureService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): FeatureService {
    if (!FeatureService.instance) {
      FeatureService.instance = new FeatureService(fastify);
    }
    return FeatureService.instance;
  }

  public async createResource(data: CreateResourceInput) {
    try {
      const resource = await this.fastify.prisma.resource.create({ data });
      return resource;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw this.fastify.httpErrors.conflict('Resource already exists.');
          case 'P2025':
            throw this.fastify.httpErrors.notFound('Resource not found.');
          case 'P2003':
            throw this.fastify.httpErrors.badRequest('Invalid foreign key reference.');
        }
      }
      throw error;
    }
  }
}
```

### Controller Pattern

```ts
import { CreateResourceSchema } from './schemas';
import FeatureService from './services';

export default class FeatureController {
  private static instance: FeatureController;
  private featureService: FeatureService;

  private constructor(fastify: FastifyTypeBox, featureService: FeatureService) {
    this.featureService = featureService;
  }

  public static getInstance(
    fastify: FastifyTypeBox,
    featureService = FeatureService.getInstance(fastify)
  ): FeatureController {
    if (!FeatureController.instance) {
      FeatureController.instance = new FeatureController(fastify, featureService);
    }
    return FeatureController.instance;
  }

  public async createResource(
    req: FastifyRequestTypeBox<typeof CreateResourceSchema>,
    reply: FastifyReplyTypeBox<typeof CreateResourceSchema>
  ) {
    const resource = await this.featureService.createResource(req.body);

    return reply.status(201).send({
      message: 'Resource created successfully',
      data: resource
    });
  }
}
```

### Routes Definition

```ts
import FeatureController from './controllers';
import { CreateResourceSchema, DeleteResourceSchema } from './schemas';

export default function featureRoutes(fastify: FastifyTypeBox) {
  const controller = FeatureController.getInstance(fastify);

  fastify.post('/', { schema: CreateResourceSchema }, controller.createResource.bind(controller));
  fastify.delete('/:id', { schema: DeleteResourceSchema }, controller.deleteResource.bind(controller));
}
```

### Schema Definition (TypeBox)

```ts
import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

export const CreateResourceSchema = {
  summary: 'Create a new resource',
  description: 'Creates a new resource in the system.',
  tags: ['Feature'],
  security: [{ JWT: [] }],
  body: Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String())
  }),
  response: {
    201: Type.Object({
      message: Type.String(),
      data: Type.Object({
        id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        created_at: Type.String({ format: 'date-time' })
      })
    }),
    400: { $ref: 'HttpError' },
    401: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
```

### Autohooks

```ts
import { addRouteTags } from '@/hooks/onRoute';
import { isAdminOrLibrarianHook } from '@/hooks/auth';

export default function featureHooks(fastify: FastifyTypeBox) {
  // Add Swagger tags to all routes in this module
  fastify.addHook('onRoute', addRouteTags('Feature'));

  // Apply authentication hook to all routes
  fastify.addHook('preHandler', isAdminOrLibrarianHook(fastify));
}
```

## Prisma Error Codes

Common Prisma error codes to handle in services:

| Code  | Meaning                         | HTTP Status |
| ----- | ------------------------------- | ----------- |
| P2002 | Unique constraint violation     | 409         |
| P2025 | Record not found                | 404         |
| P2003 | Foreign key constraint violated | 400         |

## Available Authentication Hooks

From `src/hooks/auth.ts`:

- `authHook`: Verifies JWT token (use with `req.jwtVerify()`).
- `isLibrarianHook`: Requires LIBRARIAN role.
- `isAdminHook`: Requires ADMIN role.
- `isAdminOrLibrarianHook(app)`: Requires either ADMIN or LIBRARIAN role (uses `@fastify/auth`).

## Cascading Autohooks

Autohooks registered in a parent module cascade to all child modules. For example, `staff/autohooks.ts` applies `isAdminOrLibrarianHook` to all child modules (`staff/author`, `staff/book`, etc.), so individual child modules don't need to register authentication hooks.

## Development Commands

```bash
# Type checking
pnpm --filter api typecheck

# Linting
pnpm lint

# Development server with hot reload
pnpm --filter api dev

# Generate Prisma client
pnpm --filter api prisma:generate

# Run database migrations
pnpm --filter api prisma:migrate

# Open Prisma Studio
pnpm --filter api prisma:studio
```

## Important Notes

1. **TypeBox Type Provider**: The application uses `@fastify/type-provider-typebox` for type-safe request/response handling. Always use `FastifyTypeBox`, `FastifyRequestTypeBox`, and `FastifyReplyTypeBox` types.

2. **Global Types**: Custom types are defined in `types/global.d.ts` and are globally available without imports.

3. **Plugin Encapsulation**: All plugins in `src/plugins/` are wrapped with `fastify-plugin` (fp) for proper encapsulation and are registered with `encapsulate: false` in autoload.

4. **Route Autoloading**: Routes are automatically loaded from `src/modules/` with:
   - Pattern: `routes.ts` files are the entry points.
   - Autohooks: `autohooks.ts` files are applied to the module and its children.
   - Prefix: All routes are prefixed with `/api`.

5. **Testing Best Practices**:
   - Use `getAccessToken()` helper instead of manual signin for cleaner tests.
   - Use `it.each` for testing multiple roles with similar expected behavior.
   - Always close the app in `afterAll` to prevent resource leaks.
   - Update `mockFastify.ts` when adding new Prisma models.
   - Update `build.ts` when adding new routes for integration tests.
