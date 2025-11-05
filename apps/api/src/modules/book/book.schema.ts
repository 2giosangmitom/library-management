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
