import { build, users } from '@tests/integration/helpers/build';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/book', async () => {
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

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      payload: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject create request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { authorization: `Bearer ${member_token}` },
      payload: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should create book for LIBRARIAN role', async () => {
    const bookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { authorization: `Bearer ${librarian_token}` },
      payload: bookData
    });

    expect(response.statusCode).toBe(201);
  });

  it('should create book for ADMIN role', async () => {
    const bookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookData
    });

    expect(response.statusCode).toBe(201);
  });

  it('should reject create book with duplicate isbn', async () => {
    const duplicateIsbn = faker.string.numeric(13);

    const firstBookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: duplicateIsbn,
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: firstBookData
    });

    expect(firstResponse.statusCode).toBe(201);

    const secondBookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: duplicateIsbn,
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: secondBookData
    });

    expect(secondResponse.statusCode).toBe(409);
  });
});
