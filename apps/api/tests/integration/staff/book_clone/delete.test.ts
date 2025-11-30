import { build, users } from '../../helpers/build.js';
import { faker } from '@faker-js/faker';

describe('DELETE /api/staff/book_clone/:book_clone_id', async () => {
  const app = await build();
  let admin_token: string;
  let member_token: string;
  let librarian_token: string;
  let book_id: string;
  let location_id: string;

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

    // Create a book for testing
    const bookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const bookResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookData
    });

    book_id = bookResponse.json().data.book_id;

    // Create a location for testing
    const location = await app.prisma.location.create({
      data: {
        location_id: `LOC-${faker.string.alphanumeric(5).toUpperCase()}`,
        room: faker.helpers.arrayElement(['Main Hall', 'Study Room', 'Archive Room']),
        floor: faker.number.int({ min: 1, max: 5 }),
        shelf: faker.number.int({ min: 1, max: 20 }),
        row: faker.number.int({ min: 1, max: 10 })
      }
    });
    location_id = location.location_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete a book clone for ADMIN role', async () => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'NEW'
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookCloneData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { authorization: `Bearer ${admin_token}` }
    });

    expect(deleteResponse.statusCode).toBe(200);
    const body = deleteResponse.json();
    expect(body.message).toBe('Book clone deleted successfully');
    expect(body.data.book_clone_id).toBe(created.book_clone_id);
    expect(body.data.barcode).toBe(bookCloneData.barcode);
  });

  it('should delete a book clone for LIBRARIAN role', async () => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookCloneData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { authorization: `Bearer ${librarian_token}` }
    });

    expect(deleteResponse.statusCode).toBe(200);
    const body = deleteResponse.json();
    expect(body.message).toBe('Book clone deleted successfully');
  });

  it('should reject delete for MEMBER role', async () => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'WORN'
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookCloneData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { authorization: `Bearer ${member_token}` }
    });

    expect(deleteResponse.statusCode).toBe(403);
  });

  it('should return 404 when deleting non-existing book clone', async () => {
    const randomId = faker.string.uuid();

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book_clone/${randomId}`,
      headers: { authorization: `Bearer ${admin_token}` }
    });

    expect(deleteResponse.statusCode).toBe(404);
    expect(deleteResponse.json().message).toBe('Book clone with the given ID does not exist.');
  });

  it('should reject unauthenticated delete requests', async () => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'DAMAGED'
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookCloneData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book_clone/${created.book_clone_id}`
    });

    expect(deleteResponse.statusCode).toBe(401);
  });
});
