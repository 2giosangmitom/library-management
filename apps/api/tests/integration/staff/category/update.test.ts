import { build, users } from '../../helpers/build.js';
import { faker } from '@faker-js/faker';

describe('PUT /api/staff/category/:category_id', async () => {
  const app = await build();
  let memberToken: string;
  let adminToken: string;
  let librarianToken: string;

  beforeAll(async () => {
    // Sign in as admin
    const adminUser = users[0];
    const adminRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: adminUser.email,
        password: adminUser.password
      }
    });
    adminToken = adminRes.json().data.access_token;

    // Sign in as librarian
    const librarianUser = users[1];
    const librarianRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: librarianUser.email,
        password: librarianUser.password
      }
    });
    librarianToken = librarianRes.json().data.access_token;

    // Sign in as member
    const memberUser = users[4];
    const memberRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: memberUser.email,
        password: memberUser.password
      }
    });
    memberToken = memberRes.json().data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthorized access', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${faker.string.uuid()}`,
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(res.statusCode).toBe(401);
  });

  it('should reject access for non-staff users', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${memberToken}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(res.statusCode).toBe(403);
  });

  it('should update category for librarian users', async () => {
    // First, create a category to update
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${librarianToken}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(createRes.statusCode).toBe(201);
    const createdCategory = createRes.json().data;

    // Now, update the created category
    const updatedName = faker.lorem.word();
    const updatedSlug = faker.lorem.slug();

    const updateRes = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${createdCategory.category_id}`,
      headers: {
        Authorization: `Bearer ${librarianToken}`
      },
      payload: {
        name: updatedName,
        slug: updatedSlug
      }
    });

    expect(updateRes.statusCode).toBe(200);
    const updatedCategory = updateRes.json().data;

    expect(updatedCategory).toEqual(
      expect.objectContaining({
        category_id: createdCategory.category_id,
        name: updatedName,
        slug: updatedSlug,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );
  });

  it('should update category for admin users', async () => {
    // First, create a category to update
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(createRes.statusCode).toBe(201);
    const createdCategory = createRes.json().data;

    // Now, update the created category
    const updatedName = faker.lorem.word();
    const updatedSlug = faker.lorem.slug();

    const updateRes = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${createdCategory.category_id}`,
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      payload: {
        name: updatedName,
        slug: updatedSlug
      }
    });

    expect(updateRes.statusCode).toBe(200);
    const updatedCategory = updateRes.json().data;

    expect(updatedCategory).toEqual(
      expect.objectContaining({
        category_id: createdCategory.category_id,
        name: updatedName,
        slug: updatedSlug,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );
  });

  it('should return 404 when updating a non-existent category', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(res.statusCode).toBe(404);
  });

  it('should return 409 when updating a category with a duplicate slug', async () => {
    // First, create two categories
    const createRes1 = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(createRes1.statusCode).toBe(201);
    const category1 = createRes1.json().data;

    const createRes2 = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(createRes2.statusCode).toBe(201);
    const category2 = createRes2.json().data;

    // Now, attempt to update category2 with the slug of category1
    const updateRes = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${category2.category_id}`,
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: category1.slug
      }
    });

    expect(updateRes.statusCode).toBe(409);
  });
});
