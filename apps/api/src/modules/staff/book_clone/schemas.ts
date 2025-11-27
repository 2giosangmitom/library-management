import { Type } from 'typebox';
import { FastifySchema } from 'fastify';
import { BookCondition } from '@src/generated/prisma/enums';

export const CreateBookCloneSchema = {
  summary: 'Create a new book clone',
  description: 'Endpoint to create a new book clone (physical copy) in the system.',
  body: Type.Object({
    book_id: Type.String({ format: 'uuid' }),
    location_id: Type.String(),
    barcode: Type.String(),
    condition: Type.Enum(BookCondition)
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: Type.Object({
        book_clone_id: Type.String({ format: 'uuid' }),
        book_id: Type.String({ format: 'uuid' }),
        location_id: Type.String(),
        barcode: Type.String(),
        condition: Type.String(),
        is_available: Type.Boolean(),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
