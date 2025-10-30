import { build } from '@tests/helpers/build';

describe('get author', async () => {
  const app = await build();

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
      const jwt = app.jwt.sign(
        {
          user_id: 'librarian-uuid',
          role: 'LIBRARIAN'
        },
        { expiresIn: '1h' }
      );

      // Ensure there are enough authors in the database
      for (let i = 0; i < 15; i++) {
        const createAuthorResponse = await app.inject({
          method: 'POST',
          path: '/author',
          headers: {
            Authorization: `Bearer ${jwt}`
          },
          body: {
            name: `Author ${i}`,
            biography: 'Some biography',
            short_biography: 'Some short bio',
            nationality: 'Some Nationality',
            slug: `author-${i}`
          }
        });
        expect(createAuthorResponse.statusCode).toBe(201);
      }

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

      // Ensure that the authors on page 2 are different from page 1
      for (const author of responsePage2.json()) {
        expect(response.json()).not.toContainEqual(author);
      }
    });
  });

  describe('get author by slug', () => {
    it('should return 200 and author data if author exists', async () => {
      // First, create an author to ensure there is one to fetch
      const librarianToken = app.jwt.sign(
        {
          user_id: 'librarian-uuid',
          role: 'LIBRARIAN'
        },
        { expiresIn: '1h' }
      );

      const createResponse = await app.inject({
        method: 'POST',
        path: '/author',
        headers: {
          Authorization: `Bearer ${librarianToken}`
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
