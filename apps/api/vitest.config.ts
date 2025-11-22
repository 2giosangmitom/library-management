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
          pool: 'threads',
          globalSetup: './tests/integration/setup/globalSetup.ts'
        }
      }
    ]
  }
});
