import { build } from '@tests/helpers/fastify';

describe('create author', async () => {
  const app = await build();
  let memberJwt: string;
  let librarianJwt: string;

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    // Sign up a LIBRARIAN account for later usage
    const signupResponse = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-create-author-librarian@test.com',
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
        email: 'test-create-author-librarian@test.com',
        password: 'password123'
      }
    });

    librarianJwt = signinResponse.json().jwt;

    // Sign up a MEMBER account for later usage
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-create-author-member@test.com',
        password: 'password123',
        name: 'Member User'
      }
    });

    // Sign in to member account to get JWT token
    const memberSigninResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-create-author-member@test.com',
        password: 'password123'
      }
    });

    memberJwt = memberSigninResponse.json().jwt;
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
    const response = await app.inject({
      method: 'POST',
      path: '/author',
      headers: {
        Authorization: `Bearer ${memberJwt}`
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
    const response = await app.inject({
      method: 'POST',
      path: '/author',
      headers: {
        Authorization: `Bearer ${librarianJwt}`
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
