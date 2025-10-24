import { FastifySchema } from 'fastify';
import Type from 'typebox';

export const signUpSchema = {
  summary: 'Create new user account',
  description: 'Endpoint to register a new user by providing email, password, and name.',
  body: Type.Object({
    email: Type.String({ format: 'email', description: 'User email address' }),
    password: Type.String({ minLength: 8, description: 'User password with minimum 8 characters' }),
    name: Type.String({ minLength: 1, description: 'Full name of the user' })
  }),
  response: {
    201: Type.Object(
      {
        user_id: Type.String({ format: 'uuid', description: 'Unique identifier for the user' }),
        email: Type.String({ format: 'email', description: 'User email address' }),
        name: Type.String({ description: 'Full name of the user' }),
        created_at: Type.String({ format: 'date-time', description: 'Timestamp when the user was created' })
      },
      {
        description: 'User successfully created'
      }
    ),
    409: Type.Object(
      {
        message: Type.String({ description: 'Error message indicating the email already exists' })
      },
      {
        description: 'Conflict - Email already exists'
      }
    )
  }
} as const satisfies FastifySchema;
