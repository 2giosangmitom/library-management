import { execSync } from 'node:child_process';
import { build } from '@tests/integration/helpers/build';
import { users } from '@tests/integration/helpers/build';

export default async function globalSetup() {
  console.log('Setting up integration test database...');

  // Run database migrations
  execSync('pnpm prisma:migrate:test', { stdio: 'inherit' });

  // Create some users
  const app = await build();
  for (const user of users) {
    console.log(`Creating user: ${user.email}`);
    console.log(`Password: ${user.password}`);
    await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: user
    });
  }
  console.log('All users created.');

  // Promote the first user to ADMIN
  console.log('Setting up ADMIN user...');
  await app.prisma.user.update({
    where: { email: users[0].email },
    data: { role: 'ADMIN' }
  });
  console.log(`Admin user setup complete: ${users[0].email}`);

  console.log('Setting up LIBRARIAN users...');
  for (let i = 1; i <= 3; i++) {
    await app.prisma.user.update({
      where: { email: users[i].email },
      data: { role: 'LIBRARIAN' }
    });
    console.log(`Librarian user setup complete: ${users[i].email}`);
  }

  // Close the app instance
  console.log('Integration test database setup complete.');
  await app.close();

  return () => {
    console.log('Tearing down integration test database...');

    // Drop the test database
    execSync('pnpm prisma:migrate:reset:test', { stdio: 'inherit' });
  };
}
