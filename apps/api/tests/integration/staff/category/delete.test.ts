import { faker } from '@faker-js/faker';
import { build, users } from '../../helpers/build';

describe('DELETE /api/staff/category/:category_id', async () => {
  const app = await build();
  let adminToken: string;
  let librarianToken: string;
  let memberToken: string;

  beforeAll(async () => {
    // Sign in as admin
    const adminSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[0].email,
        password: users[0].password
      }
    });
    adminToken = adminSignInResponse.json().data.access_token;

    // Sign in as librarian
    const librarianSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[1].email,
        password: users[1].password
      }
    });
    librarianToken = librarianSignInResponse.json().data.access_token;

    // Sign in as member
    const memberSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[4].email,
        password: users[4].password
      }
    });
    memberToken = memberSignInResponse.json().data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject deletion when no token is provided', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/category/${faker.string.uuid()}`
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject deletion when the provided category id is not a valid uuid', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/category/invalid-uuid`,
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject deletion when the user is a member', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/category/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${memberToken}`
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should delete a category when the user is an admin', async () => {
    // First, create a new category to delete
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      payload: { name: faker.lorem.word(), slug: faker.lorem.slug() }
    });

    const categoryId = createResponse.json().data.category_id;

    // Now delete
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/category/${categoryId}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json()).toMatchObject({
      message: 'Category deleted successfully',
      data: { category_id: categoryId }
    });
  });

  it('should delete a category when the user is a librarian', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { Authorization: `Bearer ${librarianToken}` },
      payload: { name: faker.lorem.word(), slug: faker.lorem.slug() }
    });

    const categoryId = createResponse.json().data.category_id;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/category/${categoryId}`,
      headers: { Authorization: `Bearer ${librarianToken}` }
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json()).toMatchObject({
      message: 'Category deleted successfully',
      data: { category_id: categoryId }
    });
  });

  it('should return 404 when trying to delete a non-existing category', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/category/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.statusCode).toBe(404);
  });
});
