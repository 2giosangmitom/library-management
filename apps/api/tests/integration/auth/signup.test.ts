import { build } from '@tests/helpers/fastify';
import { faker } from '@faker-js/faker';

const ENDPOINT = '/auth/signup';

describe(`POST ${ENDPOINT}`, async () => {
  const app = await build();

  afterAll(async () => {
    await app.close();
  });

  it('should sign up a new user if data is valid', async () => {
    const email = faker.internet.email({ firstName: 'Test', lastName: 'Signup' });

    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: email,
        password: faker.internet.password({ length: 12 }),
        name: 'Test Signup'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(
      expect.objectContaining({
        user_id: expect.any(String),
        email,
        name: 'Test Signup',
        created_at: expect.any(String)
      })
    );
  });

  it('should return 409 if email is already in use', async () => {
    const email = faker.internet.email({ firstName: 'Test', lastName: 'Signup' });

    // Sign up the first time
    const response1 = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: email,
        password: faker.internet.password({ length: 12 }),
        name: 'Test Signup'
      }
    });
    assert.equal(response1.statusCode, 201);

    // Try to sign up again with the same email
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: email,
        password: faker.internet.password({ length: 12 }),
        name: 'Test Signup Duplicate'
      }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "message": "Email already exists",
      }
    `);
  });

  it('should return 400 if email is invalid', async () => {
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: 'not-an-email',
        password: faker.internet.password({ length: 12 }),
        name: faker.person.fullName()
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body/email must match format "email"",
        "statusCode": 400,
      }
    `);
  });

  it('should return 400 if password is too short', async () => {
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: faker.internet.email({ firstName: 'Test', lastName: 'Signup' }),
        password: faker.internet.password({ length: 3 }),
        name: faker.person.fullName()
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body/password must not have fewer than 8 characters",
        "statusCode": 400,
      }
    `);
  });
});
