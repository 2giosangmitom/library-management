import { build } from '@tests/helpers/fastify';

describe('create category', async () => {
  const app = await build();
  let librarianJwt: string;
  let memberJwt: string;

  beforeAll(async () => {
    // Create librarian user for later usage
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-create-category-librarian@test.com',
        password: 'password',
        name: 'Librarian User'
      }
    });

    // Manually update role to librarian
    await app.prisma.user.update({
      where: {
        email: 'test-create-category-librarian@test.com'
      },
      data: { role: 'LIBRARIAN' }
    });

    const signinLibrarianResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-create-category-librarian@test.com',
        password: 'password'
      }
    });
    librarianJwt = signinLibrarianResponse.json().jwt;

    // Create member user for later usage
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-create-category-member@test.com',
        password: 'password',
        name: 'Member User'
      }
    });

    const signinMemberResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-create-category-member@test.com',
        password: 'password'
      }
    });
    memberJwt = signinMemberResponse.json().jwt;
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'POST',
      path: '/category',
      body: {
        name: 'Fiction',
        slug: 'fiction'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject requests from non-librarian users', async () => {
    const response = await app.inject({
      method: 'POST',
      path: '/category',
      headers: {
        Authorization: `Bearer ${memberJwt}`
      },
      body: {
        name: 'Fiction',
        slug: 'fiction'
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should create category for librarian users', async () => {
    const response = await app.inject({
      method: 'POST',
      path: '/category',
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        name: 'Fiction',
        slug: 'fiction'
      }
    });

    expect(response.statusCode).toBe(201);
    const responseBody = response.json();
    expect(responseBody).toHaveProperty('category_id');
    expect(responseBody.name).toBe('Fiction');
    expect(responseBody.slug).toBe('fiction');
  });
});
