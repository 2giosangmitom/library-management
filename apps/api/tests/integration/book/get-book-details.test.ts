import { build } from '@tests/helpers/build';

describe('get book details', async () => {
  const app = await build();
  let librarianJwt: string;

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    // Create a librarian user and get JWT
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-get-book-details@test.com',
        password: 'password113',
        name: 'Test Get Book Details'
      }
    });

    // Manually update the user to have librarian role
    await app.prisma.user.update({
      where: { email: 'test-get-book-details@test.com' },
      data: { role: 'LIBRARIAN' }
    });

    // Sign in to get JWT
    const signInResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-get-book-details@test.com',
        password: 'password113'
      }
    });
    librarianJwt = signInResponse.json().jwt;
  });

  it('should get book details successfully', async () => {
    // First, create a book to get details for
    const createBookResponse = await app.inject({
      method: 'POST',
      path: '/book',
      headers: {
        Authorization: `Bearer ${librarianJwt}`
      },
      body: {
        title: 'The Great Gatsby',
        description: 'A classic novel by F. Scott Fitzgerald',
        author_ids: [],
        category_ids: [],
        total_copies: 5,
        available_copies: 5
      }
    });

    const createdBook = createBookResponse.json();

    // Now, get the book details
    const getBookResponse = await app.inject({
      method: 'GET',
      path: `/book/${createdBook.book_id}`
    });

    expect(getBookResponse.statusCode).toBe(200);
    expect(getBookResponse.json()).toEqual(
      expect.objectContaining({
        book_id: createdBook.book_id,
        title: 'The Great Gatsby',
        total_copies: 5,
        available_copies: 5
      })
    );
  });

  it('should return 404 for non-existing book', async () => {
    const getBookResponse = await app.inject({
      method: 'GET',
      path: `/book/00000000-0000-0000-0000-000000000000`
    });

    expect(getBookResponse.statusCode).toBe(404);
    expect(getBookResponse.json()).toEqual({
      message: 'Book not found'
    });
  });

  it('should return 400 for invalid book ID', async () => {
    const getBookResponse = await app.inject({
      method: 'GET',
      path: `/book/invalid-book-id`
    });

    expect(getBookResponse.statusCode).toBe(400);
  });
});
