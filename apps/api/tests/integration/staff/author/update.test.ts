import { build, users } from '@tests/integration/helpers/build';
import { faker } from '@faker-js/faker';

describe('PUT /api/staff/author/:author_id', async () => {
  const app = await build();
  let admin_token: string;

  beforeAll(async () => {
    // Sign in as Admin
    const adminSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[0].email,
        password: users[0].password
      }
    });
    admin_token = adminSignInResponse.json().data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update an existing author', async () => {
    const authorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(3),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: faker.lorem.slug()
    };

    // First, create an author to update later
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: authorData
    });

    expect(createResponse.statusCode).toBe(201);
    const createdAuthor = JSON.parse(createResponse.body).data;

    // Now, update the author
    const updatedAuthorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(4),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/author/${createdAuthor.author_id}`,
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: updatedAuthorData
    });

    expect(updateResponse.statusCode).toBe(200);
    const updatedAuthor = JSON.parse(updateResponse.body).data;

    expect(updatedAuthor).toEqual(
      expect.objectContaining({
        author_id: createdAuthor.author_id,
        ...updatedAuthorData,
        date_of_birth: updatedAuthorData.date_of_birth,
        date_of_death: updatedAuthorData.date_of_death
      })
    );
  });

  it('should return 404 when trying to update a non-existing author', async () => {
    const nonExistingAuthorId = faker.string.uuid();

    const updatedAuthorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(4),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/author/${nonExistingAuthorId}`,
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: updatedAuthorData
    });

    expect(updateResponse.statusCode).toBe(404);
    const errorResponse = JSON.parse(updateResponse.body);
    expect(errorResponse).toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'Author with the given ID does not exist.',
        error: 'Not Found'
      })
    );
  });
});
