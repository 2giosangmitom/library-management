import { build } from '@tests/helpers/build';

describe('delete book', async () => {
  const app = await build();
  let librarianJwt: string;
  let memberJwt: string;
  let bookId: string;

  beforeAll(async () => {
    // create librarian user
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-delete-book-librarian@test.com',
        password: 'password',
        name: 'Librarian'
      }
    });
    await app.prisma.user.update({
      where: {
        email: 'test-delete-book-librarian@test.com'
      },
      data: {
        role: 'LIBRARIAN'
      }
    });
    const signinL = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-delete-book-librarian@test.com',
        password: 'password'
      }
    });
    librarianJwt = signinL.json().jwt;

    // create member user
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-delete-book-member@test.com',
        password: 'password',
        name: 'Member'
      }
    });
    const signinM = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-delete-book-member@test.com',
        password: 'password'
      }
    });
    memberJwt = signinM.json().jwt;

    // create an author and category to attach
    const author = await app.prisma.author.create({
      data: {
        name: 'A',
        short_biography: 's',
        biography: 'b',
        nationality: 'N',
        slug: 'author-delete-slug'
      }
    });
    const category = await app.prisma.category.create({
      data: {
        name: 'C',
        slug: 'cat-delete-slug'
      }
    });

    // create a book using the API as librarian
    const res = await app.inject({
      method: 'POST',
      path: '/book',
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        title: 'T',
        description: 'D',
        total_copies: 2,
        available_copies: 2,
        author_ids: [author.author_id],
        category_ids: [category.category_id]
      }
    });
    bookId = res.json().book_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const res = await app.inject({
      method: 'DELETE',
      path: `/book/${bookId}`
    });
    expect(res.statusCode).toBe(401);
  });

  it('should reject non-librarian users', async () => {
    const res = await app.inject({
      method: 'DELETE',
      path: `/book/${bookId}`,
      headers: {
        Authorization: `Bearer ${memberJwt}`
      }
    });
    expect(res.statusCode).toBe(403);
  });

  it('should delete book for librarians', async () => {
    const res = await app.inject({
      method: 'DELETE',
      path: `/book/${bookId}`,
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      }
    });
    expect(res.statusCode).toBe(204);
  });

  it('should return 404 if book already deleted', async () => {
    const res = await app.inject({
      method: 'DELETE',
      path: `/book/${bookId}`,
      headers: { Authorization: `Bearer ${librarianJwt}` }
    });
    expect(res.statusCode).toBe(404);
  });
});
