import { execSync } from 'node:child_process';

export default async function globalSetup() {
  console.log('Setting up integration test database...');

  // Run database migrations
  execSync('pnpm prisma:migrate:test', { stdio: 'inherit' });

  return () => {
    console.log('Tearing down integration test database...');

    // Drop the test database
    execSync('pnpm prisma:migrate:reset:test', { stdio: 'inherit' });
  };
}
