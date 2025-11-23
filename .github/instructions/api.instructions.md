---
applyTo: 'apps/api/**/*.ts'
---

# BookWise API Application

This directory contains the source code for the BookWise API application. The API is built using Fastify and TypeScript.

## Project Structure

```
.
├── prisma/
│   ├── migrations
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── generated/
│   ├── hooks/
│   ├── modules/
│   ├── plugins/
│   ├── utils/
│   ├── app.ts
│   ├── constants.ts
│   └── server.ts
├── tests/
│   ├── integration/
│   └── unit/
├── types/
│   └── global.d.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Key Components

- `prisma/`: Contains the Prisma schema and migration files for database management.
- `src/`: Main source code directory.
  - `config/`: Configuration settings for the application.
  - `generated/`: Auto-generated files, such as Prisma client.
  - `hooks/`: Fastify hooks.
  - `modules/`: Application modules, each encapsulating specific functionality.
  - `plugins/`: Fastify plugins used in the application.
  - `utils/`: Utility functions and helpers.
  - `app.ts`: Initializes the Fastify application.
  - `server.ts`: Starts the Fastify server.
- `tests/`: Contains unit and integration tests.
- `types/`: Custom TypeScript type definitions.

## Build and Run

- To build and run the API application, use the following commands in the root directory:

```bash
pnpm --filter api build
```

- To run unit tests:

```bash
pnpm --filter api test:unit
```

- To run integration tests:

```bash
pnpm --filter api test:integration
```

- To run the coverage report:

```bash
pnpm --filter api test:coverage
```

- To run a single test file:

```bash
pnpm --filter api test:file path/to/test/file.ts
```

## Writing Tests

### Unit Tests

- Located in `tests/unit/`.
- Use Vitest for writing unit tests.
- Helper functions for unit tests can be found in `tests/unit/helpers/`.
- To build mock Fastify application for unit tests, use this snippet:

```ts
import { buildMockFastify } from '@tests/unit/helpers/mockFastify';

describe('Your test suite', async () => {
  const app = await buildMockFastify();

  afterEach(async () => {
    vi.clearAllMocks(); // Reset mocks after each test
    vi.resetAllMocks(); // Reset mock implementations after each test
  });

  afterAll(async () => {
    await app.close();
  });

  it('should do something', async () => {
    // Your test logic here
  });
});
```

### Integration Tests

- Located in `tests/integration/`.
- Use Vitest for writing integration tests.
- Helper functions for integration tests can be found in `tests/integration/helpers/`.
- To build the Fastify application for integration tests, use this snippet:

```ts
import { build } from '@tests/integration/helpers/build';

describe('Your integration test suite', async () => {
  const app = await build();

  afterEach(async () => {
    vi.clearAllMocks(); // Reset mocks after each test
    vi.resetAllMocks(); // Reset mock implementations after each test
  });

  afterAll(async () => {
    await app.close();
  });

  it('should do something', async () => {
    // Your test logic here
  });
});
```

- The `build.ts` helper also provides a `users` array with pre-registered users for testing authentication and authorization scenarios.
- Example usage of pre-registered users:

```ts
import { users, build } from '@tests/integration/helpers/build';

describe('Authentication tests', async () => {
  const app = await build();

  afterAll(async () => {
    await app.close();
  });

  it('should authenticate a pre-registered user', async () => {
    const user = users[0]; // Access the first pre-registered user

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: user.email,
        password: user.password
      }
    });

    expect(response.statusCode).toBe(200);
    // Additional assertions...
  });
});
```

- `users[0]` is ADMIN, `users[1...3]` are LIBRARIAN, and `users[4...]` are MEMBER roles.
- Each user object contains `email`, `password`, and `fullName` properties for testing purposes.

## Implement New Features in Modules

- New features should be implemented within the `src/modules/` directory.
- Each module should encapsulate related functionality.
- Each module can have its own routes, services, schemas, autohooks, and controllers.
- Follow the existing module structure for consistency and maintainability.
- Example module structure:

```
src/modules/
└── user/
    ├── user.controller.ts
    ├── user.hooks.ts
    ├── user.routes.ts
    ├── user.schema.ts
    └── user.service.ts
```

- `*.routes.ts`: A Fastify plugin for defining module routes.
- `*.controller.ts`: Handles incoming requests and responses.
- `*.service.ts`: Contains business logic and interacts with the database.
- `*.schema.ts`: Defines Fastify schema for a route, using TypeBox.
- `*.hooks.ts`: A Fastify plugin for adding hooks to the module.

The controller and service should encapsulate in a class structure for better organization and testability. Using dependency injection is encouraged for managing dependencies within modules, and using the Singleton pattern is recommended to ensure a single instance throughout the application.

- Example of a controller and service using classes:

```ts
export default class ModuleService {
  private static instance: ModuleService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox) {
    if (!ModuleService.instance) {
      ModuleService.instance = new ModuleService(fastify);
    }
    return ModuleService.instance;
  }
}
```

```ts
export default class ModuleController {
  private static instance: ModuleController;
  private moduleService: ModuleService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, moduleService: ModuleService) {
    this.fastify = fastify;
    this.moduleService = moduleService;
  }

  public static getInstance(fastify: FastifyTypeBox, moduleService = ModuleService.getInstance(fastify)) {
    if (!ModuleController.instance) {
      ModuleController.instance = new ModuleController(fastify, moduleService);
    }
    return ModuleController.instance;
  }
}
```

- Example of defining routes:

```ts
import { ModuleController } from './module.controller';

export default function moduleRoutes(fastify: FastifyTypeBox) {
  const moduleController = ModuleController.getInstance(fastify);

  fastify.get('/', async (request, reply) => {
    return moduleController.getModules(request, reply);
  });

  // Define other routes...
}
```
