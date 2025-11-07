import { build } from '@tests/helpers/fastify';

describe('delete category', async () => {
  const app = await build();
  let librarianJwt: string;
  let memberJwt: string;
  let categoryId: string;

  beforeAll(async () => {
    // Sign up a LIBRARIAN account for later usage
    const signupResponse = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-delete-category-librarian@test.com',
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
        email: 'test-delete-category-librarian@test.com',
        password: 'password123'
      }
    });

    librarianJwt = signinResponse.json().jwt;

    // Sign up a MEMBER account for later usage
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-delete-category-member@test.com',
        password: 'password123',
        name: 'Member User'
      }
    });

    // Sign in to member account to get JWT token
    const memberSigninResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-delete-category-member@test.com',
        password: 'password123'
      }
    });

    memberJwt = memberSigninResponse.json().jwt;

    // Create a category to be deleted later
    const createCategoryResponse = await app.inject({
      method: 'POST',
      path: '/category',
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        name: 'Category To Be Deleted',
        slug: 'category-to-be-deleted'
      }
    });

    categoryId = createCategoryResponse.json().category_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject request with 401 if no JWT provided', async () => {
    const response = await app.inject({
      method: 'DELETE',
      path: '/category/some-category-id'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject request with 403 if user is not LIBRARIAN', async () => {
    const response = await app.inject({
      method: 'DELETE',
      path: `/category/${categoryId}`,
      headers: {
        Authorization: `Bearer ${memberJwt}`
      }
    });
    expect(response.statusCode).toBe(403);
  });

  it('should delete category and return 204 for LIBRARIAN user', async () => {
    const response = await app.inject({
      method: 'DELETE',
      path: `/category/${categoryId}`,
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      }
    });

    expect(response.statusCode).toBe(204);
  });

  it('should return 404 if category does not exist', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await app.inject({
      method: 'DELETE',
      path: `/category/${nonExistentId}`,
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      }
    });

    expect(response.statusCode).toBe(404);
  });
});
