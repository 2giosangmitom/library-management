import { build, users } from '../../helpers/build';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/author', async () => {
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
      url: '/api/staff/author',
      payload: {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(3),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: faker.location.country(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_JWT_NO_AUTHORIZATION_IN_COOKIE",
        "error": "Unauthorized",
        "message": "No Authorization was found in request.cookies",
        "statusCode": 401,
      }
    `);
  });

  it('should reject create request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        authorization: `Bearer ${member_token}`
      },
      payload: {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(3),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: faker.location.country(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "error": "Forbidden",
        "message": "Admin or Librarian access required",
        "statusCode": 403,
      }
    `);
  });

  it('should create author for LIBRARIAN role', async () => {
    const authorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(3),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: faker.lorem.slug()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        authorization: `Bearer ${librarian_token}`
      },
      payload: authorData
    });

    expect(response.statusCode).toBe(201);
  });

  it('should create author for ADMIN role', async () => {
    const authorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(3),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: faker.lorem.slug()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: authorData
    });

    expect(response.statusCode).toBe(201);
  });

  it('should reject create author with duplicate slug', async () => {
    const duplicateSlug = faker.lorem.slug();

    // Create first author
    const firstAuthorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(3),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: duplicateSlug
    };

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: firstAuthorData
    });

    expect(firstResponse.statusCode).toBe(201);

    // Attempt to create second author with the same slug
    const secondAuthorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(3),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: duplicateSlug
    };

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: secondAuthorData
    });

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.json()).toMatchInlineSnapshot(`
      {
        "error": "Conflict",
        "message": "Author with the given slug already exists.",
        "statusCode": 409,
      }
    `);
  });
});
