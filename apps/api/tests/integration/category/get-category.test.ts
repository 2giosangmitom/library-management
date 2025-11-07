import { build } from '@tests/helpers/fastify';

describe('get category by slug', async () => {
  const app = await build();
  let librarianJwt: string;

  beforeAll(async () => {
    // Sign up a LIBRARIAN account for later usage
    const signupResponse = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-get-category-librarian@test.com',
        password: 'password123',
        name: 'Librarian User'
      }
    });

    const librarianUser = signupResponse.json();

    // Manually update the user's role to LIBRARIAN in the database
    await app.prisma.user.update({
      where: { user_id: librarianUser.user_id },
      data: { role: 'LIBRARIAN' }
    });

    // Sign in to librarian account to get JWT token
    const signinResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-get-category-librarian@test.com',
        password: 'password123'
      }
    });

    librarianJwt = signinResponse.json().jwt;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 and category data if category exists', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      path: '/category',
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        name: 'Test Category',
        slug: 'test-category-by-slug'
      }
    });

    expect(createResponse.statusCode).toBe(201);

    const getResponse = await app.inject({
      method: 'GET',
      path: '/category/test-category-by-slug'
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json()).toEqual({
      name: 'Test Category',
      slug: 'test-category-by-slug'
    });
  });

  it('should return 404 if category does not exist', async () => {
    const response = await app.inject({
      method: 'GET',
      path: '/category/non-existent-slug'
    });

    expect(response.statusCode).toBe(404);
  });
});
