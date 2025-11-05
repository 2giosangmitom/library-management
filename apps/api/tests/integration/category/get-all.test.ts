import { build } from '@tests/helpers/build';

describe('get category', async () => {
  const app = await build();
  let librarianJwt: string;

  beforeAll(async () => {
    // Sign up a LIBRARIAN account for later usage
    const signupResponse = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-get-category-librarian-2@test.com',
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
        email: 'test-get-category-librarian-2@test.com',
        password: 'password123'
      }
    });

    librarianJwt = signinResponse.json().jwt;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('get all categories', () => {
    it('should return 200 and list of categories', async () => {
      const response = await app.inject({
        method: 'GET',
        path: '/category'
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });

    it('should respect pagination parameters', async () => {
      const createCategoryPromises: Promise<Awaited<ReturnType<typeof app.inject>>>[] = [];
      // Ensure there are enough categories in the database
      for (let i = 0; i < 15; i++) {
        const createCategoryResponse = app.inject({
          method: 'POST',
          path: '/category',
          headers: {
            Authorization: `Bearer ${librarianJwt}`
          },
          body: {
            name: `Category ${i}`,
            slug: `test-get-categories-${i}`
          }
        });
        createCategoryPromises.push(createCategoryResponse);
      }
      await Promise.all(createCategoryPromises);

      const response = await app.inject({
        method: 'GET',
        path: '/category?page=1&limit=5'
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
      expect(response.json().length).toBe(5);

      const responsePage2 = await app.inject({
        method: 'GET',
        path: '/category?page=2&limit=5'
      });

      expect(responsePage2.statusCode).toBe(200);
      expect(Array.isArray(responsePage2.json())).toBe(true);
      expect(responsePage2.json().length).toBe(5);

      // Ensure that the categories on page 2 are different from page 1
      const page1Slugs = (response.json() as { slug: string }[]).map((c) => c.slug);
      const page2Slugs = (responsePage2.json() as { slug: string }[]).map((c) => c.slug);
      for (const slug of page2Slugs) {
        expect(page1Slugs).not.toContain(slug);
      }
    });
  });
});
