import { build } from '@tests/helpers/build';

describe('delete author', async () => {
  const app = await build();
  let librarianToken: string;
  let authorId: string;

  beforeAll(() => {
    librarianToken = app.jwt.sign(
      {
        user_id: 'xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        role: 'LIBRARIAN'
      },
      { expiresIn: '1h' }
    );
  });

  beforeAll(async () => {
    // Create an author to be deleted
    const response = await app.inject({
      method: 'POST',
      path: '/author',
      headers: {
        Authorization: `Bearer ${librarianToken}`
      },
      body: {
        name: 'Author to Delete',
        biography: 'This author will be deleted.',
        short_biography: 'Delete me.',
        nationality: 'Testland',
        slug: 'author-to-delete'
      }
    });
    const body = response.json();
    authorId = body.author_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject request with 401 if no JWT provided', async () => {
    const response = await app.inject({
      method: 'DELETE',
      path: `/author/${authorId}`
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject request with 403 if user is not LIBRARIAN', async () => {
    const userToken = app.jwt.sign(
      {
        user_id: 'user-uuid',
        role: 'MEMBER'
      },
      { expiresIn: '1h' }
    );

    const response = await app.inject({
      method: 'DELETE',
      path: `/author/${authorId}`,
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });
    expect(response.statusCode).toBe(403);
  });

  it('should delete author and return 204 for LIBRARIAN user', async () => {
    const response = await app.inject({
      method: 'DELETE',
      path: `/author/${authorId}`,
      headers: {
        Authorization: `Bearer ${librarianToken}`
      }
    });

    expect(response.statusCode).toBe(204);
  });

  it('should return 404 if author does not exist', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await app.inject({
      method: 'DELETE',
      path: `/author/${nonExistentId}`,
      headers: {
        Authorization: `Bearer ${librarianToken}`
      }
    });

    expect(response.statusCode).toBe(404);
  });
});
