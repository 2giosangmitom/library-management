import { FastifySchema } from 'fastify';
import Type from 'typebox';

export const CreateCategorySchema = {
  summary: 'Create a new category (staff)',
  description: 'Staff endpoint to create a new category in the system.',
  body: Type.Object({
    name: Type.String(),
    slug: Type.String()
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: Type.Object({
        category_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        slug: Type.String(),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const DeleteCategorySchema = {
  summary: 'Delete a category (staff)',
  params: Type.Object({
    category_id: Type.String({ format: 'uuid' })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        category_id: Type.String({ format: 'uuid' }),
        name: Type.String()
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const UpdateCategorySchema = {
  summary: 'Update a category (staff)',
  description: 'Staff endpoint to update an existing category in the system.',
  params: Type.Object({
    category_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object({
    name: Type.Optional(Type.String()),
    slug: Type.Optional(Type.String())
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        category_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        slug: Type.String(),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
