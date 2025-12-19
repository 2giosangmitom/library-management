import { type FastifySchema } from 'fastify';
import { Type } from 'typebox';

export const GetMeSchema = {
  summary: 'Get current user profile',
  description: 'Retrieve the profile information of the currently authenticated user.',
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        user_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        email: Type.String({ format: 'email' }),
        role: Type.Union([Type.Literal('ADMIN'), Type.Literal('LIBRARIAN'), Type.Literal('MEMBER')]),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    401: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
