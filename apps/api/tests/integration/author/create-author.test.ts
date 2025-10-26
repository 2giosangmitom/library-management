import { build } from '@tests/helpers/build';

describe('create author', async () => {
  const app = await build();

  afterAll(async () => {
    await app.close();
  });

  it('should reject request with 401 if no JWT provided', async () => {
    const response = await app.inject({
      method: 'POST',
      path: '/author',
      body: {
        name: 'Author Name',
        biography: 'Author biography',
        nationality: 'Some Nationality',
        slug: 'author-name'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject request with 403 if user is not LIBRARIAN', async () => {
    // Create a token for a user with role USER
    const userToken = app.jwt.sign(
      {
        user_id: 'user-uuid',
        role: 'MEMBER'
      },
      { expiresIn: '1h' }
    );

    const response = await app.inject({
      method: 'POST',
      path: '/author',
      headers: {
        Authorization: `Bearer ${userToken}`
      },
      body: {
        name: 'Author Name',
        biography: 'Author biography',
        nationality: 'Some Nationality',
        slug: 'author-name'
      }
    });
    expect(response.statusCode).toBe(403);
  });

  it('should create author and return 201 for LIBRARIAN user', async () => {
    // Create a token for a user with role LIBRARIAN
    const librarianToken = app.jwt.sign(
      {
        user_id: 'librarian-uuid',
        role: 'LIBRARIAN'
      },
      { expiresIn: '1h' }
    );

    const response = await app.inject({
      method: 'POST',
      path: '/author',
      headers: {
        Authorization: `Bearer ${librarianToken}`
      },
      body: {
        name: 'Author Name',
        biography: 'Author biography',
        short_biography: 'Author short bio',
        nationality: 'Some Nationality',
        slug: 'test-create-author'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      author_id: expect.any(String),
      name: 'Author Name',
      nationality: 'Some Nationality',
      slug: 'test-create-author',
      created_at: expect.any(String),
      biography: 'Author biography',
      short_biography: 'Author short bio'
    });
  });
});
