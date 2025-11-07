import { build } from '@tests/helpers/build';

describe('get all books', async () => {
  const app = await build();
  let librarianJwt: string;

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    // Create a LIBRARIAN user for later use
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-get-all-books-librarian@test.com',
        password: 'password123',
        name: 'Test Get All Books Librarian'
      }
    });

    // Update the user role to LIBRARIAN
    await app.prisma.user.updateMany({
      where: {
        email: 'test-get-all-books-librarian@test.com'
      },
      data: {
        role: 'LIBRARIAN'
      }
    });

    // Sign in as the LIBRARIAN to get JWT
    const librarianSignInRes = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-get-all-books-librarian@test.com',
        password: 'password123'
      }
    });
    librarianJwt = librarianSignInRes.json().jwt;
  });

  it('should not need authentication to get all books', async () => {
    const res = await app.inject({
      method: 'GET',
      path: '/book'
    });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json())).toBe(true);
  });

  it('should include books added by librarian in the all books list', async () => {
    // Add a book as LIBRARIAN
    const addBookRes = await app.inject({
      method: 'POST',
      path: '/book',
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        title: 'Test Book',
        description: 'Test Description',
        total_copies: 5,
        available_copies: 5,
        author_ids: [],
        category_ids: []
      }
    });
    expect(addBookRes.statusCode).toBe(201);

    // Get all books
    const getAllBooksRes = await app.inject({
      method: 'GET',
      path: '/book'
    });
    expect(getAllBooksRes.statusCode).toBe(200);
    const books = getAllBooksRes.json();
    expect(books).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          book_id: addBookRes.json().book_id,
          title: 'Test Book',
          description: 'Test Description',
          total_copies: 5,
          available_copies: 5
        })
      ])
    );
  });

  it('should respect pagination when getting all books', async () => {
    // Add multiple books as LIBRARIAN
    const createBookPromises: Promise<Awaited<ReturnType<typeof app.inject>>>[] = [];
    for (let i = 0; i < 20; i++) {
      createBookPromises.push(
        app.inject({
          method: 'POST',
          path: '/book',
          headers: {
            Authorization: `Bearer ${librarianJwt}`
          },
          body: {
            title: `Test Book ${i + 1}`,
            description: `Test Description ${i + 1}`,
            total_copies: 5,
            available_copies: 5,
            author_ids: [],
            category_ids: []
          }
        })
      );
    }
    await Promise.all(createBookPromises);

    // Get all books with pagination
    const getAllBooksRes = await app.inject({
      method: 'GET',
      path: '/book?page=1&limit=10'
    });
    expect(getAllBooksRes.statusCode).toBe(200);
    const books = getAllBooksRes.json();
    expect(books).toHaveLength(10);

    // Get second page
    const getSecondPageRes = await app.inject({
      method: 'GET',
      path: '/book?page=2&limit=10'
    });
    expect(getSecondPageRes.statusCode).toBe(200);
    const secondPageBooks = getSecondPageRes.json();
    expect(secondPageBooks).toHaveLength(10);

    // Ensure no overlap between first and second page
    const firstPageBookIds = books.map((b: { book_id: string }) => b.book_id);
    const secondPageBookIds = secondPageBooks.map((b: { book_id: string }) => b.book_id);
    expect(firstPageBookIds).not.toEqual(expect.arrayContaining(secondPageBookIds));
  });
});
