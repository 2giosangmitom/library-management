import { Type } from 'typebox';
import { FastifySchema } from 'fastify';

export const getUserInfoSchema = {
  summary: 'Get User Information',
  description: 'Retrieve information about the authenticated user.',
  response: {
    200: Type.Object({
      user_id: Type.String({ format: 'uuid' }),
      email: Type.String({ format: 'email' }),
      name: Type.String(),
      role: Type.String()
    }),
    404: Type.Object({
      message: Type.String()
    })
  }
} as const satisfies FastifySchema;
