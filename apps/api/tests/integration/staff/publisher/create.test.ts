import { build, users } from '../../helpers/build';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/publisher', async () => {
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
      payload: { email: adminUser.email, password: adminUser.password }
    });
    admin_token = adminSignInResponse.json().data.access_token;

    // Sign in as Member
    const memberUser = users[4];
    const memberSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: { email: memberUser.email, password: memberUser.password }
    });
    member_token = memberSignInResponse.json().data.access_token;

    // Sign in as Librarian
    const librarianUser = users[1];
    const librarianSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: { email: librarianUser.email, password: librarianUser.password }
    });
    librarian_token = librarianSignInResponse.json().data.access_token;
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      payload: { name: faker.company.name(), website: 'https://example.com', slug: faker.lorem.slug() }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject create request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { authorization: `Bearer ${member_token}` },
      payload: { name: faker.company.name(), website: 'https://example.com', slug: faker.lorem.slug() }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should create publisher for LIBRARIAN role', async () => {
    const data = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { authorization: `Bearer ${librarian_token}` },
      payload: data
    });

    expect(response.statusCode).toBe(201);
  });

  it('should create publisher for ADMIN role', async () => {
    const data = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: data
    });

    expect(response.statusCode).toBe(201);
  });

  it('should reject create publisher with duplicate slug', async () => {
    const duplicateSlug = faker.lorem.slug();

    const firstData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: duplicateSlug
    };

    const firstResp = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: firstData
    });
    expect(firstResp.statusCode).toBe(201);

    const secondData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: duplicateSlug
    };
    const secondResp = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { authorization: `Bearer ${admin_token}` },
      payload: secondData
    });

    expect(secondResp.statusCode).toBe(409);
    expect(secondResp.json()).toMatchInlineSnapshot(`
      {
        "error": "Conflict",
        "message": "Publisher with the given slug already exists.",
        "statusCode": 409,
      }
    `);
  });
});
