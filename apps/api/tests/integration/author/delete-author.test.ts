import { build } from '@tests/helpers/build';

describe('delete author', async () => {
  const app = await build();
  let librarianJwt: string;
  let memberJwt: string;
  let authorId: string;

  beforeAll(async () => {
    // Sign up a LIBRARIAN account for later usage
    const signupResponse = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-delete-author-librarian@test.com',
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
        email: 'test-delete-author-librarian@test.com',
        password: 'password123'
      }
    });

    librarianJwt = signinResponse.json().jwt;

    // Sign up a MEMBER account for later usage
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-delete-author-member@test.com',
        password: 'password123',
        name: 'Member User'
      }
    });

    // Sign in to member account to get JWT token
    const memberSigninResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-delete-author-member@test.com',
        password: 'password123'
      }
    });

    memberJwt = memberSigninResponse.json().jwt;

    // Create an author to be deleted later
    const createAuthorResponse = await app.inject({
      method: 'POST',
      path: '/author',
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        name: 'Author To Be Deleted',
        short_biography: 'This author will be deleted in tests.',
        biography: 'Full biography of the author to be deleted.',
        nationality: 'Testland',
        slug: 'author-to-be-deleted'
      }
    });

    authorId = createAuthorResponse.json().author_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject request with 401 if no JWT provided', async () => {
    const response = await app.inject({
      method: 'DELETE',
      path: '/author/some-author-id'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject request with 403 if user is not LIBRARIAN', async () => {
    const response = await app.inject({
      method: 'DELETE',
      path: `/author/${authorId}`,
      headers: {
        Authorization: `Bearer ${memberJwt}`
      }
    });
    expect(response.statusCode).toBe(403);
  });

  it('should delete author and return 204 for LIBRARIAN user', async () => {
    const response = await app.inject({
      method: 'DELETE',
      path: `/author/${authorId}`,
      headers: {
        Authorization: `Bearer ${librarianJwt}`
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
        Authorization: `Bearer ${librarianJwt}`
      }
    });

    expect(response.statusCode).toBe(404);
  });
});
