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

export const deleteCategorySchema = {
  summary: 'Delete a category by ID',
  description: 'Endpoint to delete a category by its ID.',
  params: Type.Object({
    category_id: Type.String({ format: 'uuid' })
  }),
  response: {
    204: Type.Null({
      description: 'Category deleted successfully'
    }),
    404: Type.Object(
      {
        message: Type.String()
      },
      {
        description: 'Category not found'
      }
    )
  }
} as const satisfies FastifySchema;

export const updateCategorySchema = {
  summary: 'Update a category by ID',
  description: 'Endpoint to update a category by its ID.',
  params: Type.Object({
    category_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    slug: Type.String({ minLength: 1, maxLength: 100 })
  }),
  response: {
    200: Type.Object(
      {
        category_id: Type.String(),
        name: Type.String(),
        slug: Type.String(),
        updated_at: Type.String({ format: 'date-time' })
      },
      { description: 'Category updated successfully' }
    ),
    404: Type.Object({ message: Type.String() }, { description: 'Category not found' })
  }
} as const satisfies FastifySchema;

export const getAllCategoriesSchema = {
  summary: 'Get all categories',
  description: 'Endpoint to retrieve all categories in the system',
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
        slug: Type.String()
      }),
      {
        description: 'List of categories retrieved successfully'
      }
    )
  }
} as const satisfies FastifySchema;

export const getCategoryDetailsSchema = {
  summary: 'Get category details by slug',
  description: 'Endpoint to retrieve category details by slug',
  params: Type.Object({
    category_slug: Type.String({ minLength: 1, maxLength: 50 })
  }),
  response: {
    200: Type.Object(
      {
        name: Type.String(),
        slug: Type.String()
      },
      {
        description: 'Category details retrieved successfully'
      }
    ),
    404: Type.Object(
      {
        message: Type.String()
      },
      {
        description: 'Category not found'
      }
    )
  }
} as const satisfies FastifySchema;
