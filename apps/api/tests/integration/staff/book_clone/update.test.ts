import { build, users } from '@tests/integration/helpers/build';
import { faker } from '@faker-js/faker';

describe('PUT /api/staff/book_clone/:book_clone_id', async () => {
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

  it('should update a book clone for ADMIN role', async () => {
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

    const updatedData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'WORN'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { authorization: `Bearer ${admin_token}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(200);
    const body = updateResponse.json();
    expect(body.message).toBe('Book clone updated successfully');
    expect(body.data.book_clone_id).toBe(created.book_clone_id);
    expect(body.data.barcode).toBe(updatedData.barcode);
    expect(body.data.condition).toBe('WORN');
  });

  it('should update a book clone for LIBRARIAN role', async () => {
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

    const updatedData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'DAMAGED'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { authorization: `Bearer ${librarian_token}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(200);
    const body = updateResponse.json();
    expect(body.message).toBe('Book clone updated successfully');
    expect(body.data.condition).toBe('DAMAGED');
  });

  it('should reject update for MEMBER role', async () => {
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

    const updatedData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { authorization: `Bearer ${member_token}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(403);
  });

  it('should return 404 when updating non-existing book clone', async () => {
    const randomId = faker.string.uuid();
    const updatedData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'NEW'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${randomId}`,
      headers: { authorization: `Bearer ${admin_token}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(404);
    expect(updateResponse.json().message).toBe('Book clone with the given ID does not exist.');
  });

  it('should return 409 when updating with duplicate barcode', async () => {
    const duplicateBarcode = faker.string.alphanumeric(10);

    // Create first book clone
    const bookCloneData1 = {
      book_id,
      location_id,
      barcode: duplicateBarcode,
      condition: 'NEW'
    };

    const createResponse1 = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookCloneData1
    });

    expect(createResponse1.statusCode).toBe(201);

    // Create second book clone
    const bookCloneData2 = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const createResponse2 = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookCloneData2
    });

    expect(createResponse2.statusCode).toBe(201);
    const created2 = createResponse2.json().data;

    // Try to update second book clone with duplicate barcode
    const updatedData = {
      book_id,
      location_id,
      barcode: duplicateBarcode,
      condition: 'WORN'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created2.book_clone_id}`,
      headers: { authorization: `Bearer ${admin_token}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(409);
    expect(updateResponse.json().message).toBe('Book clone with the given barcode already exists.');
  });

  it('should return 400 when updating with invalid book_id', async () => {
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

    const updatedData = {
      book_id: faker.string.uuid(), // Invalid book_id
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { authorization: `Bearer ${admin_token}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(400);
    expect(updateResponse.json().message).toBe('Invalid book_id or location_id provided.');
  });

  it('should reject unauthenticated update requests', async () => {
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

    const updatedData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(401);
  });
});
