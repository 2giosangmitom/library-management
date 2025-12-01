import { build, users } from '../../helpers/build';
import { faker } from '@faker-js/faker';

describe('PUT /api/staff/publisher/:publisher_id', async () => {
  const app = await build();
  let admin_token: string;
  let librarian_token: string;
  let member_token: string;

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

    // Sign in as Librarian
    const librarianSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[1].email,
        password: users[1].password
      }
    });
    librarian_token = librarianSignInResponse.json().data.access_token;

    // Sign in as Member
    const memberSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[4].email,
        password: users[4].password
      }
    });
    member_token = memberSignInResponse.json().data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update an existing publisher for ADMIN role', async () => {
    const publisherData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    // First, create a publisher to update later
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: publisherData
    });

    expect(createResponse.statusCode).toBe(201);
    const createdPublisher = createResponse.json().data;

    // Now, update the publisher
    const updatedPublisherData = {
      name: faker.company.name(),
      website: 'https://newexample.com',
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${createdPublisher.publisher_id}`,
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: updatedPublisherData
    });

    expect(updateResponse.statusCode).toBe(200);
    const updatedPublisher = updateResponse.json().data;

    expect(updatedPublisher).toEqual(
      expect.objectContaining({
        publisher_id: createdPublisher.publisher_id,
        name: updatedPublisherData.name,
        website: updatedPublisherData.website,
        slug: updatedPublisherData.slug
      })
    );
  });

  it('should update an existing publisher for LIBRARIAN role', async () => {
    const publisherData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    // First, create a publisher to update later
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: publisherData
    });

    expect(createResponse.statusCode).toBe(201);
    const createdPublisher = createResponse.json().data;

    // Now, update the publisher
    const updatedPublisherData = {
      name: faker.company.name(),
      website: 'https://newexample.com',
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${createdPublisher.publisher_id}`,
      headers: {
        authorization: `Bearer ${librarian_token}`
      },
      payload: updatedPublisherData
    });

    expect(updateResponse.statusCode).toBe(200);
    const updatedPublisher = updateResponse.json().data;

    expect(updatedPublisher.name).toBe(updatedPublisherData.name);
  });

  it('should reject update for MEMBER role', async () => {
    const publisherData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    // First, create a publisher to update later
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: publisherData
    });

    expect(createResponse.statusCode).toBe(201);
    const createdPublisher = createResponse.json().data;

    // Try to update as member
    const updatedPublisherData = {
      name: faker.company.name(),
      website: 'https://newexample.com',
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${createdPublisher.publisher_id}`,
      headers: {
        authorization: `Bearer ${member_token}`
      },
      payload: updatedPublisherData
    });

    expect(updateResponse.statusCode).toBe(403);
  });

  it('should return 404 when trying to update a non-existing publisher', async () => {
    const nonExistingPublisherId = faker.string.uuid();

    const updatedPublisherData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${nonExistingPublisherId}`,
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: updatedPublisherData
    });

    expect(updateResponse.statusCode).toBe(404);
    const errorResponse = updateResponse.json();
    expect(errorResponse).toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'Publisher with the given ID does not exist.',
        error: 'Not Found'
      })
    );
  });

  it('should return 409 when updating with duplicate slug', async () => {
    const publisherData1 = {
      name: faker.company.name(),
      website: 'https://example1.com',
      slug: faker.lorem.slug()
    };

    const publisherData2 = {
      name: faker.company.name(),
      website: 'https://example2.com',
      slug: faker.lorem.slug()
    };

    // Create first publisher
    const createResponse1 = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: publisherData1
    });

    expect(createResponse1.statusCode).toBe(201);
    const publisher1 = createResponse1.json().data;

    // Create second publisher
    const createResponse2 = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: publisherData2
    });

    expect(createResponse2.statusCode).toBe(201);
    const publisher2 = createResponse2.json().data;

    // Try to update publisher2 with publisher1's slug
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${publisher2.publisher_id}`,
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: {
        name: publisher2.name,
        website: publisher2.website,
        slug: publisher1.slug
      }
    });

    expect(updateResponse.statusCode).toBe(409);
    const errorResponse = updateResponse.json();
    expect(errorResponse.message).toBe('Publisher with the given slug already exists.');
  });

  it('should reject unauthenticated update requests', async () => {
    const publisherData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    // Create a publisher
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: publisherData
    });

    expect(createResponse.statusCode).toBe(201);
    const createdPublisher = createResponse.json().data;

    // Try to update without authentication
    const updatedPublisherData = {
      name: faker.company.name(),
      website: 'https://newexample.com',
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${createdPublisher.publisher_id}`,
      payload: updatedPublisherData
    });

    expect(updateResponse.statusCode).toBe(401);
  });
});
