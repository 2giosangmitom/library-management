import { build } from '@tests/helpers/fastify';

describe('update category', async () => {
  const app = await build();
  let librarianJwt: string;
  let memberJwt: string;
  let categoryId: string;

  beforeAll(async () => {
    // Create librarian
    const signupResponse = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-category-librarian@test.com',
        password: 'password123',
        name: 'Librarian User'
      }
    });
    const librarianUser = signupResponse.json();

    await app.prisma.user.update({
      where: { user_id: librarianUser.user_id },
      data: { role: 'LIBRARIAN' }
    });

    const signinResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-category-librarian@test.com',
        password: 'password123'
      }
    });
    librarianJwt = signinResponse.json().jwt;

    // Create member
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-category-member@test.com',
        password: 'password123',
        name: 'Member User'
      }
    });
    const memberSignin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-category-member@test.com',
        password: 'password123'
      }
    });
    memberJwt = memberSignin.json().jwt;

    // Create a category
    const createCategoryResponse = await app.inject({
      method: 'POST',
      path: '/category',
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        name: 'Original Name',
        slug: 'original-name'
      }
    });
    categoryId = createCategoryResponse.json().category_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject with 401 if unauthenticated', async () => {
    const response = await app.inject({
      method: 'PUT',
      path: `/category/${categoryId}`,
      body: { name: 'Updated', slug: 'updated' }
    });
    expect(response.statusCode).toBe(401);
  });

  it('should reject with 403 if member', async () => {
    const response = await app.inject({
      method: 'PUT',
      path: `/category/${categoryId}`,
      headers: { Authorization: `Bearer ${memberJwt}` },
      body: { name: 'Updated', slug: 'updated' }
    });
    expect(response.statusCode).toBe(403);
  });

  it('should update category for librarian', async () => {
    const response = await app.inject({
      method: 'PUT',
      path: `/category/${categoryId}`,
      headers: { Authorization: `Bearer ${librarianJwt}` },
      body: { name: 'Updated Name', slug: 'updated-name' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toMatchObject({
      category_id: categoryId,
      name: 'Updated Name',
      slug: 'updated-name'
    });
    expect(typeof body.updated_at).toBe('string');
  });

  it('should return 404 when category does not exist', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await app.inject({
      method: 'PUT',
      path: `/category/${nonExistentId}`,
      headers: { Authorization: `Bearer ${librarianJwt}` },
      body: { name: 'N/A', slug: 'n-a' }
    });

    expect(response.statusCode).toBe(404);
  });
});
