import { build } from '@tests/helpers/build';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('update author', async () => {
  const app = await build();
  let librarianJwt: string;
  let memberJwt: string;
  let authorId: string;
  const originalAuthorData = {
    name: 'Original Author Name',
    biography: 'Original biography',
    short_biography: 'Original short biography',
    nationality: 'Original nationality',
    slug: 'original-author-name'
  };

  beforeAll(async () => {
    // Sign up a LIBRARIAN account for later usage
    const signupResponse = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-author-librariant@test.com',
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
    const librarianSignInResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-author-librariant@test.com',
        password: 'password123'
      }
    });

    librarianJwt = librarianSignInResponse.json().jwt;

    // Sign up a MEMBER account for later usage
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-author-member@test.com',
        password: 'password123',
        name: 'Member User'
      }
    });

    // Sign in to member account to get JWT token
    const memberSignInResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-author-member@test.com',
        password: 'password123'
      }
    });

    memberJwt = memberSignInResponse.json().jwt;

    // Create an author to be used in update tests
    const authorResponse = await app.inject({
      method: 'POST',
      path: '/author',
      headers: {
        authorization: `Bearer ${librarianJwt}`
      },
      body: {
        ...originalAuthorData
      }
    });

    authorId = authorResponse.json().author_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update an author successfully for a librarian', async () => {
    const updatePayload = {
      ...originalAuthorData,
      name: 'Updated Author Name'
    };

    const response = await app.inject({
      method: 'PUT',
      url: `/author/${authorId}`,
      headers: {
        authorization: `Bearer ${librarianJwt}`
      },
      payload: updatePayload
    });

    expect(response.statusCode).toBe(200);
    const responseJson = response.json();
    expect(responseJson.name).toBe(updatePayload.name);
    expect(responseJson.author_id).toBe(authorId);
  });

  it('should return 404 if author not found', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const updatePayload = {
      ...originalAuthorData,
      name: 'This should fail'
    };

    const response = await app.inject({
      method: 'PUT',
      path: `/author/${nonExistentId}`,
      headers: {
        authorization: `Bearer ${librarianJwt}`
      },
      body: updatePayload
    });

    expect(response.statusCode).toBe(404);
  });

  it('should return 403 for a member trying to update an author', async () => {
    const updatePayload = {
      name: 'Member Update Attempt'
    };

    const response = await app.inject({
      method: 'PUT',
      url: `/author/${authorId}`,
      headers: {
        authorization: `Bearer ${memberJwt}`
      },
      payload: updatePayload
    });

    expect(response.statusCode).toBe(403);
  });

  it('should return 401 for an unauthenticated user', async () => {
    const updatePayload = {
      name: 'Unauthenticated Update'
    };

    const response = await app.inject({
      method: 'PUT',
      url: `/author/${authorId}`,
      payload: updatePayload
    });

    expect(response.statusCode).toBe(401);
  });
});
