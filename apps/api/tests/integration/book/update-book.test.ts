import { build } from '@tests/helpers/fastify';

describe('update book', async () => {
  const app = await build();
  let librarianJwt: string;
  let bookId: string;

  beforeAll(async () => {
    // create librarian user
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-book-librarian@test.com',
        password: 'password',
        name: 'Librarian'
      }
    });
    await app.prisma.user.update({
      where: {
        email: 'test-update-book-librarian@test.com'
      },
      data: {
        role: 'LIBRARIAN'
      }
    });
    const signinL = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-book-librarian@test.com',
        password: 'password'
      }
    });
    librarianJwt = signinL.json().jwt;

    // create an author and category to attach
    const author = await app.prisma.author.create({
      data: {
        name: 'A',
        short_biography: 's',
        biography: 'b',
        nationality: 'N',
        slug: 'author-update-slug'
      }
    });
    const category = await app.prisma.category.create({
      data: {
        name: 'C',
        slug: 'cat-update-slug'
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
    expect(res.statusCode).toBe(201);
    bookId = res.json().book_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update title and total copies', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: `/book/${bookId}`,
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        title: 'Updated',
        total_copies: 5,
        available_copies: 5
      }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.title).toBe('Updated');
    expect(body.total_copies).toBe(5);
    expect(body).toHaveProperty('updated_at');
  });

  it('should return 400 for invalid body', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: `/book/${bookId}`,
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        total_copies: -1
      }
    });
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 for missing book', async () => {
    // delete book relations first (test DB uses RESTRICT on fk) then delete book
    await app.prisma.book_Author.deleteMany({ where: { book_id: bookId } });
    await app.prisma.book_Category.deleteMany({ where: { book_id: bookId } });
    await app.prisma.book.delete({ where: { book_id: bookId } });

    const res = await app.inject({
      method: 'PUT',
      path: `/book/${bookId}`,
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        title: 'X'
      }
    });
    expect(res.statusCode).toBe(404);
  });
});
