import { FastifySchema } from 'fastify';
import Type from 'typebox';

export const createAuthorSchema = {
  summary: 'Create a new author',
  description: 'Endpoint to create a new author in the system',
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    biography: Type.String({ minLength: 1 }),
    short_biography: Type.String({ minLength: 1 }),
    nationality: Type.String({ minLength: 1, maxLength: 100 }),
    slug: Type.String({ minLength: 1, maxLength: 50 })
  }),
  response: {
    201: Type.Object(
      {
        author_id: Type.String(),
        name: Type.String(),
        short_biography: Type.String(),
        biography: Type.String(),
        nationality: Type.String(),
        slug: Type.String(),
        created_at: Type.String({ format: 'date-time' })
      },
      {
        description: 'Author created successfully'
      }
    )
  }
} as const satisfies FastifySchema;

export const getAllAuthorsSchema = {
  summary: 'Get all authors',
  description: 'Endpoint to retrieve all authors in the system',
  querystring: Type.Partial(
    Type.Object({
      page: Type.Number({ minimum: 1 }),
      limit: Type.Number({ minimum: 1, maximum: 100 })
    })
  ),
  response: {
    200: Type.Array(
      Type.Object({
        name: Type.String(),
        slug: Type.String(),
        short_biography: Type.String()
      }),
      {
        description: 'List of authors retrieved successfully'
      }
    )
  }
} as const satisfies FastifySchema;

export const getAuthorDetailsSchema = {
  summary: 'Get author details by slug',
  description: 'Endpoint to retrieve author details by slug',
  params: Type.Object({
    author_slug: Type.String({ minLength: 1, maxLength: 50 })
  }),
  response: {
    200: Type.Object(
      {
        name: Type.String(),
        short_biography: Type.String(),
        biography: Type.String(),
        nationality: Type.String(),
        slug: Type.String()
      },
      {
        description: 'Author details retrieved successfully'
      }
    ),
    404: Type.Object(
      {
        message: Type.String()
      },
      {
        description: 'Author not found'
      }
    )
  }
} as const satisfies FastifySchema;

export const deleteAuthorSchema = {
  summary: 'Delete an author by ID',
  description: 'Endpoint to delete an author by their ID.',
  params: Type.Object({
    author_id: Type.String({ format: 'uuid' })
  }),
  response: {
    204: Type.Null({
      description: 'Author deleted successfully'
    }),
    404: Type.Object(
      {
        message: Type.String()
      },
      {
        description: 'Author not found'
      }
    )
  }
} as const satisfies FastifySchema;
