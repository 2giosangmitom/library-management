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

export const updateUserSchema = {
  summary: 'Update authenticated user name',
  description: 'Update the name of the authenticated user',
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 50 })
  }),
  response: {
    200: Type.Object({
      user_id: Type.String({ format: 'uuid' }),
      email: Type.String({ format: 'email' }),
      name: Type.String(),
      role: Type.String(),
      updated_at: Type.String({ format: 'date-time' })
    }),
    404: Type.Object({ message: Type.String() })
  }
} as const satisfies FastifySchema;

export const updateUserEmailSchema = {
  summary: 'Update authenticated user email',
  description: 'Update the email of the authenticated user',
  body: Type.Object({
    email: Type.String({ format: 'email' })
  }),
  response: {
    200: Type.Object({
      user_id: Type.String({ format: 'uuid' }),
      email: Type.String({ format: 'email' }),
      name: Type.String(),
      role: Type.String(),
      updated_at: Type.String({ format: 'date-time' })
    }),
    404: Type.Object({ message: Type.String() }),
    409: Type.Object({ message: Type.String() })
  }
} as const satisfies FastifySchema;

export const updateUserPasswordSchema = {
  summary: 'Update authenticated user password',
  description: 'Change the password of the authenticated user. Requires current password.',
  body: Type.Object({
    current_password: Type.String({ minLength: 6 }),
    new_password: Type.String({ minLength: 6 })
  }),
  response: {
    204: Type.Null({ description: 'Password updated successfully' }),
    401: Type.Object({ message: Type.String() }, { description: 'Invalid current password' }),
    404: Type.Object({ message: Type.String() }, { description: 'User not found' })
  }
} as const satisfies FastifySchema;
