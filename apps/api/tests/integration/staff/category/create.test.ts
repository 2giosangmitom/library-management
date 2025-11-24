import { build, users } from '@tests/integration/helpers/build';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/category', async () => {
  const app = await build();
  let admin_token: string;
  let member_token: string;
  let librarian_token: string;

  beforeAll(async () => {
    // Sign in as Admin
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

    // Sign in as Member
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

    // Sign in as Librarian
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
      url: '/api/staff/category',
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject create request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        authorization: `Bearer ${member_token}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should create category for LIBRARIAN role', async () => {
    const data = { name: faker.lorem.word(), slug: faker.lorem.slug() };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { authorization: `Bearer ${librarian_token}` },
      payload: data
    });

    expect(response.statusCode).toBe(201);
  });

  it('should create category for ADMIN role', async () => {
    const data = { name: faker.lorem.word(), slug: faker.lorem.slug() };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: data
    });

    expect(response.statusCode).toBe(201);
  });

  it('should reject duplicate slug', async () => {
    const duplicate = faker.lorem.slug();

    const first = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: { name: faker.lorem.word(), slug: duplicate }
    });

    expect(first.statusCode).toBe(201);

    const second = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: { name: faker.lorem.word(), slug: duplicate }
    });

    expect(second.statusCode).toBe(409);
  });
});
