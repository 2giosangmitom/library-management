import { build } from '@tests/helpers/build';

describe('create book', async () => {
  const app = await build();
  let librarianJwt: string;
  let memberJwt: string;
  let authorId: string;
  let categoryId: string;

  beforeAll(async () => {
    // create librarian user
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: { email: 'test-create-book-librarian@test.com', password: 'password', name: 'Librarian' }
    });
    await app.prisma.user.update({
      where: { email: 'test-create-book-librarian@test.com' },
      data: { role: 'LIBRARIAN' }
    });
    const signinL = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: { email: 'test-create-book-librarian@test.com', password: 'password' }
    });
    librarianJwt = signinL.json().jwt;

    // create member user
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: { email: 'test-create-book-member@test.com', password: 'password', name: 'Member' }
    });
    const signinM = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: { email: 'test-create-book-member@test.com', password: 'password' }
    });
    memberJwt = signinM.json().jwt;

    // create an author and category to attach
    const author = await app.prisma.author.create({
      data: { name: 'A', short_biography: 's', biography: 'b', nationality: 'N', slug: 'author-slug' }
    });
    const category = await app.prisma.category.create({ data: { name: 'C', slug: 'cat-slug' } });

    // store for later use
    authorId = author.author_id;
    categoryId = category.category_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const res = await app.inject({
      method: 'POST',
      path: '/book',
      body: { title: 'T', description: 'D', total_copies: 1, author_ids: [], category_ids: [] }
    });
    expect(res.statusCode).toBe(401);
  });

  it('should reject non-librarian users', async () => {
    const res = await app.inject({
      method: 'POST',
      path: '/book',
      headers: { Authorization: `Bearer ${memberJwt}` },
      body: { title: 'T', description: 'D', total_copies: 1, author_ids: [], category_ids: [] }
    });
    expect(res.statusCode).toBe(403);
  });

  it('should create a book for librarians', async () => {
    const res = await app.inject({
      method: 'POST',
      path: '/book',
      headers: { Authorization: `Bearer ${librarianJwt}` },
      body: {
        title: 'T',
        description: 'D',
        total_copies: 3,
        available_copies: 3,
        author_ids: [authorId],
        category_ids: [categoryId]
      }
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('book_id');
    expect(body.title).toBe('T');
  });
});
