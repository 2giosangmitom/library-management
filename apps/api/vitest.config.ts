import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    reporters: 'tree',
    projects: [
      {
        extends: true,
        test: {
          name: 'Unit',
          include: ['tests/unit/**/*.test.ts']
        }
      },
      {
        extends: true,
        test: {
          name: 'Integration',
          include: ['tests/integration/**/*.test.ts'],
          // Ensure tests run sequentially to avoid database conflicts
          pool: 'threads',
          maxWorkers: 1,
          globalSetup: './tests/setup/globalSetup.ts'
        }
      }
    ]
  }
});
