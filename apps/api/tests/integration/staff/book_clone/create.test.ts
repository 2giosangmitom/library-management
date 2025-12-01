import { build, users } from '../../helpers/build';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/book_clone', async () => {
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

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      payload: {
        book_id,
        location_id,
        barcode: faker.string.alphanumeric(10),
        condition: 'NEW'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject create request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${member_token}` },
      payload: {
        book_id,
        location_id,
        barcode: faker.string.alphanumeric(10),
        condition: 'NEW'
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should create book clone for LIBRARIAN role', async () => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'NEW'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${librarian_token}` },
      payload: bookCloneData
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.message).toBe('Book clone created successfully');
    expect(body.data.book_id).toBe(book_id);
    expect(body.data.location_id).toBe(location_id);
    expect(body.data.barcode).toBe(bookCloneData.barcode);
    expect(body.data.condition).toBe('NEW');
    expect(body.data.is_available).toBe(true);
  });

  it('should create book clone for ADMIN role', async () => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: bookCloneData
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.message).toBe('Book clone created successfully');
    expect(body.data.book_id).toBe(book_id);
    expect(body.data.condition).toBe('GOOD');
  });

  it('should reject create book clone with duplicate barcode', async () => {
    const duplicateBarcode = faker.string.alphanumeric(10);

    const firstBookCloneData = {
      book_id,
      location_id,
      barcode: duplicateBarcode,
      condition: 'NEW'
    };

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: firstBookCloneData
    });

    expect(firstResponse.statusCode).toBe(201);

    const secondBookCloneData = {
      book_id,
      location_id,
      barcode: duplicateBarcode,
      condition: 'GOOD'
    };

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: secondBookCloneData
    });

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.json().message).toBe('Book clone with the given barcode already exists.');
  });

  it('should reject create book clone with invalid book_id', async () => {
    const invalidBookId = faker.string.uuid();

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: {
        book_id: invalidBookId,
        location_id,
        barcode: faker.string.alphanumeric(10),
        condition: 'NEW'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toBe('Invalid book_id or location_id provided.');
  });

  it('should reject create book clone with invalid location_id', async () => {
    const invalidLocationId = 'INVALID-LOC';

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: {
        book_id,
        location_id: invalidLocationId,
        barcode: faker.string.alphanumeric(10),
        condition: 'NEW'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toBe('Invalid book_id or location_id provided.');
  });

  it('should create book clone with different conditions', async () => {
    const conditions = ['WORN', 'DAMAGED', 'LOST'] as const;

    for (const condition of conditions) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/staff/book_clone',
        headers: { authorization: `Bearer ${admin_token}` },
        payload: {
          book_id,
          location_id,
          barcode: faker.string.alphanumeric(10),
          condition
        }
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().data.condition).toBe(condition);
    }
  });
});
