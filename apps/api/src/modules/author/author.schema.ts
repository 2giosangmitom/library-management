import { FastifySchema } from 'fastify';
import Type from 'typebox';

export const createAuthorSchema = {
  summary: 'Create a new author',
  description: 'Endpoint to create a new author in the system',
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    biography: Type.String({ minLength: 1 }),
    nationality: Type.String({ minLength: 1, maxLength: 100 }),
    slug: Type.String({ minLength: 1, maxLength: 50 })
  }),
  response: {
    201: Type.Object(
      {
        author_id: Type.String(),
        name: Type.String(),
        biography: Type.String(),
        nationality: Type.String(),
        slug: Type.String(),
        created_at: Type.String({ format: 'date-time' })
      },
      {
        description: 'Author created successfully'
      }
    )
  }
} as const satisfies FastifySchema;
