import { Type } from 'typebox';
import { FastifySchema } from 'fastify';

export const CreatePublisherSchema = {
  summary: 'Create a new publisher',
  description: 'Endpoint to create a new publisher in the system.',
  body: Type.Object({
    name: Type.String(),
    website: Type.String(),
    slug: Type.String()
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: Type.Object({
        publisher_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        website: Type.String(),
        slug: Type.String(),
        image_url: Type.Union([Type.String({ format: 'url' }), Type.Null()]),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const DeletePublisherSchema = {
  summary: 'Delete a publisher',
  description: 'Endpoint to delete a publisher by their ID.',
  params: Type.Object({ publisher_id: Type.String({ format: 'uuid' }) }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({ publisher_id: Type.String({ format: 'uuid' }), name: Type.String() })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
