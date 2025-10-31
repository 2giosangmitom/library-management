import { FastifySchema } from 'fastify';
import Type from 'typebox';

export const createCategorySchema = {
  summary: 'Create a new category',
  description: 'Endpoint to create a new category in the system',
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    slug: Type.String({ minLength: 1, maxLength: 100 })
  }),
  response: {
    201: Type.Object(
      {
        category_id: Type.String(),
        name: Type.String(),
        slug: Type.String(),
        created_at: Type.String({ format: 'date-time' })
      },
      {
        description: 'Category created successfully'
      }
    )
  }
} as const satisfies FastifySchema;
