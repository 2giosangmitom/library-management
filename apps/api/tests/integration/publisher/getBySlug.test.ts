import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../helpers/build';

describe('GET /api/publisher/:slug', async () => {
  const app = await build();

  beforeAll(async () => {
    // Create a test publisher
    await app.prisma.publisher.create({
      data: {
        name: 'Test Publisher',
        website: 'https://testpublisher.com',
        slug: 'test-publisher'
      }
    });
  });

  afterAll(async () => {
    await app.prisma.publisher.deleteMany({
      where: { slug: 'test-publisher' }
    });
    await app.close();
  });

  it('should retrieve publisher by slug', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/publisher/test-publisher'
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('data');
    expect(body.data.slug).toBe('test-publisher');
    expect(body.data.name).toBe('Test Publisher');
  });

  it('should return 404 for non-existing slug', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/publisher/nonexistent'
    });

    expect(response.statusCode).toBe(404);
  });

  it('should return correct response format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/publisher/test-publisher'
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    const publisher = body.data;

    expect(publisher).toHaveProperty('publisher_id');
    expect(publisher).toHaveProperty('name');
    expect(publisher).toHaveProperty('website');
    expect(publisher).toHaveProperty('slug');
    expect(publisher).toHaveProperty('image_url');
    expect(publisher).toHaveProperty('created_at');
    expect(publisher).toHaveProperty('updated_at');
  });
});
