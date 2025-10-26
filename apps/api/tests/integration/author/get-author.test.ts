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
