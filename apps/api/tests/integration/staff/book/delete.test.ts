import { build, users } from '../../helpers/build.js';
import { faker } from '@faker-js/faker';

describe('DELETE /api/staff/book/:book_id', async () => {
  const app = await build();
  let admin_token: string;
  let member_token: string;
  let librarian_token: string;

  beforeAll(async () => {
    const adminUser = users[0];
    const adminSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: adminUser.email,
        password: adminUser.password
      }
    });
    admin_token = adminSignInResponse.json().data.access_token;

    const memberUser = users[4];
    const memberSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: memberUser.email,
        password: memberUser.password
      }
    });
    member_token = memberSignInResponse.json().data.access_token;

    const librarianUser = users[1];
    const librarianSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: librarianUser.email,
        password: librarianUser.password
      }
    });
    librarian_token = librarianSignInResponse.json().data.access_token;
  });

  it('should delete a book for ADMIN role', async () => {
    const bookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book/${created.book_id}`,
      headers: { authorization: `Bearer ${admin_token}` }
    });

    expect(deleteResponse.statusCode).toBe(200);
  });

  it('should delete a book for LIBRARIAN role', async () => {
    const bookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book/${created.book_id}`,
      headers: { authorization: `Bearer ${librarian_token}` }
    });

    expect(deleteResponse.statusCode).toBe(200);
  });

  it('should reject delete for MEMBER role', async () => {
    const bookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book/${created.book_id}`,
      headers: { authorization: `Bearer ${member_token}` }
    });

    expect(deleteResponse.statusCode).toBe(403);
  });

  it('should return 404 when deleting non-existing book', async () => {
    const randomId = faker.string.uuid();

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book/${randomId}`,
      headers: { authorization: `Bearer ${admin_token}` }
    });

    expect(deleteResponse.statusCode).toBe(404);
  });
});
