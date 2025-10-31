import { FastifySchema } from 'fastify';
import Type from 'typebox';

export const signUpSchema = {
  summary: 'Create new user account',
  description: 'Endpoint to register a new user by providing email, password, and name.',
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 }),
    name: Type.String({ minLength: 1 })
  }),
  response: {
    201: Type.Object(
      {
        user_id: Type.String({ format: 'uuid' }),
        email: Type.String({ format: 'email' }),
        name: Type.String(),
        created_at: Type.String({ format: 'date-time' })
      },
      {
        description: 'User successfully created'
      }
    ),
    409: Type.Object(
      {
        message: Type.String()
      },
      {
        description: 'Conflict - Email already exists'
      }
    )
  }
} as const satisfies FastifySchema;

export const signInSchema = {
  summary: 'Sign in',
  description: 'Endpoint to sign in by email and password.',
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 })
  }),
  response: {
    200: Type.Object(
      {
        jwt: Type.String()
      },
      {
        description: 'User signed in successfully'
      }
    ),
    401: Type.Object(
      {
        message: Type.String()
      },
      {
        description: 'Wrong credentials provided'
      }
    )
  }
} as const satisfies FastifySchema;

export const signOutSchema = {
  summary: 'Sign out',
  description: 'Endpoint to sign out the user by invalidating the JWT token.',
  headers: Type.Object({
    authorization: Type.String()
  }),
  security: [{ JWT: [] }],
  response: {
    204: Type.Null({
      description: 'User signed out successfully'
    }),
    401: Type.Object(
      {
        message: Type.String()
      },
      {
        description: 'Unauthorized - Invalid or missing token'
      }
    )
  }
} as const satisfies FastifySchema;
