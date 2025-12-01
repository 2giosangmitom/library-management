import { faker } from '@faker-js/faker';
import { build, users } from '../../helpers/build';

describe('DELETE /api/staff/author/:author_id', async () => {
  const app = await build();
  let adminToken: string;
  let librarianToken: string;
  let memberToken: string;

  beforeAll(async () => {
    // Sign in as admin
    const adminSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[0].email,
        password: users[0].password
      }
    });
    adminToken = adminSignInResponse.json().data.access_token;

    // Sign in as librarian
    const librarianSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[1].email,
        password: users[1].password
      }
    });
    librarianToken = librarianSignInResponse.json().data.access_token;

    // Sign in as member
    const memberSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[4].email,
        password: users[4].password
      }
    });
    memberToken = memberSignInResponse.json().data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject deletion when no token is provided', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/${faker.string.uuid()}`
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject deletion when the provided author id is not a valid uuid', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/invalid-uuid`,
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "params/author_id must match format "uuid"",
        "statusCode": 400,
      }
    `);
  });

  it('should reject deletion when the user is a member', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${memberToken}`
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should delete an author when the user is an admin', async () => {
    // First, create a new author to delete
    const createAuthorResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      payload: {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(3),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: null,
        slug: faker.lorem.slug()
      }
    });

    const authorId = createAuthorResponse.json().data.author_id;

    // Now, delete the created author
    const deleteAuthorResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/${authorId}`,
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    expect(deleteAuthorResponse.statusCode).toBe(200);
    expect(deleteAuthorResponse.json()).toMatchObject({
      message: 'Author deleted successfully',
      data: {
        author_id: authorId
      }
    });
  });

  it('should delete an author when the user is a librarian', async () => {
    // First, create a new author to delete
    const createAuthorResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${librarianToken}`
      },
      payload: {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(3),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: null,
        slug: faker.lorem.slug()
      }
    });

    const authorId = createAuthorResponse.json().data.author_id;

    // Now, delete the created author
    const deleteAuthorResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/${authorId}`,
      headers: {
        Authorization: `Bearer ${librarianToken}`
      }
    });

    expect(deleteAuthorResponse.statusCode).toBe(200);
    expect(deleteAuthorResponse.json()).toMatchObject({
      message: 'Author deleted successfully',
      data: {
        author_id: authorId
      }
    });
  });

  it('should return 404 when trying to delete a non-existing author', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "error": "Not Found",
        "message": "Author with the given ID does not exist.",
        "statusCode": 404,
      }
    `);
  });
});
