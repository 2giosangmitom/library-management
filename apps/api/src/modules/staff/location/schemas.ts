import { type FastifySchema } from 'fastify';
import Type from 'typebox';

export const AddLocationSchema = {
  summary: 'Add a new location',
  description: 'Endpoint to add a new location to the system',
  body: Type.Object({
    room: Type.String({ minLength: 1, maxLength: 50 }),
    floor: Type.Integer({ minimum: 1 }),
    shelf: Type.Integer({ minimum: 1 }),
    row: Type.Integer({ minimum: 1 })
  }),
  response: {
    201: Type.Object({
      location_id: Type.String(),
      room: Type.String(),
      floor: Type.Integer(),
      shelf: Type.Integer(),
      row: Type.Integer(),
      created_at: Type.String({ format: 'date-time' }),
      updated_at: Type.String({ format: 'date-time' })
    }),
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
