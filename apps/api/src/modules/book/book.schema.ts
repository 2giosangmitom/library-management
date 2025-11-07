import { Type } from 'typebox';
import { FastifySchema } from 'fastify';

export const createBookSchema = {
  summary: 'Create a new book',
  description: 'Create a book with authors and categories',
  body: Type.Object({
    title: Type.String({ minLength: 1, maxLength: 255 }),
    description: Type.String(),
    total_copies: Type.Integer({ minimum: 0 }),
    available_copies: Type.Optional(Type.Integer({ minimum: 0 })),
    author_ids: Type.Array(Type.String({ format: 'uuid' })),
    category_ids: Type.Array(Type.String({ format: 'uuid' }))
  }),
  response: {
    201: Type.Object({
      book_id: Type.String({ format: 'uuid' }),
      title: Type.String(),
      description: Type.String(),
      total_copies: Type.Integer(),
      available_copies: Type.Integer(),
      created_at: Type.String({ format: 'date-time' })
    }),
    400: Type.Object({ message: Type.String() }),
    401: Type.Object({ message: Type.String() }),
    403: Type.Object({ message: Type.String() })
  }
} as const satisfies FastifySchema;

export const deleteBookSchema = {
  summary: 'Delete a book by ID',
  description: 'Delete a book by its ID',
  params: Type.Object({
    book_id: Type.String({ format: 'uuid' })
  }),
  response: {
    204: Type.Null({ description: 'Book deleted successfully' }),
    404: Type.Object({ message: Type.String() })
  }
} as const satisfies FastifySchema;

export const updateBookSchema = {
  summary: 'Update a book by ID',
  description: 'Update book fields and optionally replace authors/categories',
  params: Type.Object({ book_id: Type.String({ format: 'uuid' }) }),
  body: Type.Partial(
    Type.Object({
      title: Type.String({ minLength: 1, maxLength: 255 }),
      description: Type.String(),
      total_copies: Type.Integer({ minimum: 0 }),
      available_copies: Type.Integer({ minimum: 0 }),
      author_ids: Type.Array(Type.String({ format: 'uuid' })),
      category_ids: Type.Array(Type.String({ format: 'uuid' }))
    })
  ),
  response: {
    200: Type.Object({
      book_id: Type.String({ format: 'uuid' }),
      title: Type.String(),
      description: Type.String(),
      total_copies: Type.Integer(),
      available_copies: Type.Integer(),
      updated_at: Type.String({ format: 'date-time' })
    }),
    400: Type.Object({ message: Type.String() }),
    404: Type.Object({ message: Type.String() })
  }
} as const satisfies FastifySchema;

export const getAllBooksSchema = {
  summary: 'Get all books',
  description: 'Retrieve a list of all books in the library',
  querystring: Type.Partial(
    Type.Object({
      page: Type.Integer({ minimum: 1 }),
      limit: Type.Integer({ minimum: 1, maximum: 100 })
    })
  ),
  response: {
    200: Type.Array(
      Type.Object({
        book_id: Type.String({ format: 'uuid' }),
        title: Type.String(),
        description: Type.String(),
        total_copies: Type.Integer(),
        available_copies: Type.Integer(),
        authors: Type.Array(
          Type.Object({
            author_id: Type.String({ format: 'uuid' }),
            name: Type.String()
          })
        ),
        categories: Type.Array(
          Type.Object({
            category_id: Type.String({ format: 'uuid' }),
            name: Type.String()
          })
        ),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    )
  }
} as const satisfies FastifySchema;

export const getBookByIdSchema = {
  summary: 'Get a book by ID',
  description: 'Retrieve a book by its ID',
  params: Type.Object({
    book_id: Type.String({ format: 'uuid' })
  }),
  response: {
    200: Type.Object({
      book_id: Type.String({ format: 'uuid' }),
      title: Type.String(),
      description: Type.String(),
      total_copies: Type.Integer(),
      available_copies: Type.Integer(),
      authors: Type.Array(
        Type.Object({
          author_id: Type.String({ format: 'uuid' }),
          name: Type.String()
        })
      ),
      categories: Type.Array(
        Type.Object({
          category_id: Type.String({ format: 'uuid' }),
          name: Type.String()
        })
      ),
      created_at: Type.String({ format: 'date-time' }),
      updated_at: Type.String({ format: 'date-time' })
    }),
    404: Type.Object({ message: Type.String() })
  }
} as const satisfies FastifySchema;
