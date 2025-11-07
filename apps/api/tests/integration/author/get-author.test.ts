import { build } from '@tests/helpers/fastify';

describe('get author', async () => {
  const app = await build();
  let librarianJwt: string;

  beforeAll(async () => {
    // Sign up a LIBRARIAN account for later usage
    const signupResponse = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-get-author-librarian@test.com',
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
        email: 'test-get-author-librarian@test.com',
        password: 'password123'
      }
    });

    librarianJwt = signinResponse.json().jwt;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('get all authors', () => {
    it('should return 200 and list of authors', async () => {
      const response = await app.inject({
        method: 'GET',
        path: '/author'
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });

    it('should respect pagination parameters', async () => {
      const createAuthorPromises: Promise<Awaited<ReturnType<typeof app.inject>>>[] = [];
      // Ensure there are enough authors in the database
      for (let i = 0; i < 15; i++) {
        const createAuthorResponse = app.inject({
          method: 'POST',
          path: '/author',
          headers: {
            Authorization: `Bearer ${librarianJwt}`
          },
          body: {
            name: `Author ${i}`,
            biography: 'Some biography',
            short_biography: 'Some short bio',
            nationality: 'Some Nationality',
            slug: `test-get-authors-${i}`
          }
        });
        createAuthorPromises.push(createAuthorResponse);
      }
      await Promise.all(createAuthorPromises);

      const response = await app.inject({
        method: 'GET',
        path: '/author?page=1&limit=5'
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
      expect(response.json().length).toBe(5);

      const responsePage2 = await app.inject({
        method: 'GET',
        path: '/author?page=2&limit=5'
      });

      expect(responsePage2.statusCode).toBe(200);
      expect(Array.isArray(responsePage2.json())).toBe(true);
      expect(responsePage2.json().length).toBe(5);
    });
  });

  describe('get author by slug', () => {
    it('should return 200 and author data if author exists', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        path: '/author',
        headers: {
          Authorization: `Bearer ${librarianJwt}`
        },
        body: {
          name: 'Test Author',
          biography: 'Test biography',
          short_biography: 'Test short bio',
          slug: 'test-get-author-by-slug',
          nationality: 'Test Nationality'
        }
      });

      expect(createResponse.statusCode).toBe(201);

      // Now, fetch the author by slug
      const getResponse = await app.inject({
        method: 'GET',
        path: '/author/test-get-author-by-slug'
      });

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.json()).toEqual({
        name: 'Test Author',
        biography: 'Test biography',
        short_biography: 'Test short bio',
        slug: 'test-get-author-by-slug',
        nationality: 'Test Nationality'
      });
    });

    it('should return 404 if author does not exist', async () => {
      const response = await app.inject({
        method: 'GET',
        path: '/author/non-existent-slug'
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
