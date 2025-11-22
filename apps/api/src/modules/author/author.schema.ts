import { FastifySchema } from 'fastify';
import Type from 'typebox';

export const CreateAuthorSchema = {
  summary: 'Create a new author',
  description: 'Endpoint to create a new author in the system.',
  body: Type.Object({
    name: Type.String(),
    short_biography: Type.String(),
    biography: Type.String(),
    date_of_birth: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    date_of_death: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    nationality: Type.Union([Type.String(), Type.Null()]),
    slug: Type.String()
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: Type.Object({
        author_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        short_biography: Type.String(),
        biography: Type.String(),
        date_of_birth: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
        date_of_death: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
        nationality: Type.Union([Type.String(), Type.Null()]),
        image_url: Type.Union([Type.String({ format: 'url' }), Type.Null()]),
        slug: Type.String(),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const DeleteAuthorSchema = {
  summary: 'Delete an author',
  description: 'Endpoint to delete an author by their ID.',
  params: Type.Object({
    author_id: Type.String({ format: 'uuid' })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        author_id: Type.String({ format: 'uuid' }),
        name: Type.String()
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
