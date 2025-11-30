import { faker } from '@faker-js/faker';
import { build, users } from '../../helpers/build.js';

describe('DELETE /api/staff/publisher/:publisher_id', async () => {
  const app = await build();
  let adminToken: string;
  let librarianToken: string;
  let memberToken: string;

  beforeAll(async () => {
    // Sign in as admin
    const adminSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: { email: users[0].email, password: users[0].password }
    });
    adminToken = adminSignInResponse.json().data.access_token;

    // Sign in as librarian
    const librarianSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: { email: users[1].email, password: users[1].password }
    });
    librarianToken = librarianSignInResponse.json().data.access_token;

    // Sign in as member
    const memberSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: { email: users[4].email, password: users[4].password }
    });
    memberToken = memberSignInResponse.json().data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject deletion when no token is provided', async () => {
    const response = await app.inject({ method: 'DELETE', url: `/api/staff/publisher/${faker.string.uuid()}` });
    expect(response.statusCode).toBe(401);
  });

  it('should reject deletion when the provided publisher id is not a valid uuid', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/publisher/invalid-uuid`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject deletion when the user is a member', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/publisher/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    expect(response.statusCode).toBe(403);
  });

  it('should delete a publisher when the user is an admin', async () => {
    const createResp = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { name: faker.company.name(), website: 'https://example.com', slug: faker.lorem.slug() }
    });
    const publisherId = createResp.json().data.publisher_id;

    const deleteResp = await app.inject({
      method: 'DELETE',
      url: `/api/staff/publisher/${publisherId}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(deleteResp.statusCode).toBe(200);
    expect(deleteResp.json()).toMatchObject({
      message: 'Publisher deleted successfully',
      data: { publisher_id: publisherId }
    });
  });

  it('should delete a publisher when the user is a librarian', async () => {
    const createResp = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { Authorization: `Bearer ${librarianToken}` },
      payload: { name: faker.company.name(), website: 'https://example.com', slug: faker.lorem.slug() }
    });
    const publisherId = createResp.json().data.publisher_id;

    const deleteResp = await app.inject({
      method: 'DELETE',
      url: `/api/staff/publisher/${publisherId}`,
      headers: { Authorization: `Bearer ${librarianToken}` }
    });

    expect(deleteResp.statusCode).toBe(200);
    expect(deleteResp.json()).toMatchObject({
      message: 'Publisher deleted successfully',
      data: { publisher_id: publisherId }
    });
  });

  it('should return 404 when trying to delete a non-existing publisher', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/publisher/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(response.statusCode).toBe(404);
  });
});
