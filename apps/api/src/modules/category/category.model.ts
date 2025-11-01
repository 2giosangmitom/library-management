export class CategoryModel {
  private static instance: CategoryModel;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): CategoryModel {
    if (!CategoryModel.instance) {
      CategoryModel.instance = new CategoryModel(fastify);
    }
    return CategoryModel.instance;
  }

  /**
   * Create a new category
   * @param data - The category data
   */
  public async createCategory(data: { name: string; slug: string }) {
    return this.fastify.prisma.category.create({
      select: {
        category_id: true,
        slug: true,
        name: true,
        created_at: true
      },
      data
    });
  }

  /**
   * Delete a category by ID
   * @param category_id - The category ID
   */
  public async deleteCategory(category_id: string) {
    return this.fastify.prisma.category.delete({
      where: { category_id }
    });
  }

  /**
   * Update a category by ID
   * @param category_id - The category ID
   * @param data - The fields to update
   */
  public updateCategory(category_id: string, data: { name?: string; slug?: string }) {
    return this.fastify.prisma.category.update({
      where: { category_id },
      data,
      select: {
        category_id: true,
        name: true,
        slug: true,
        updated_at: true
      }
    });
  }

  /**
   * Get all categories with pagination
   * @param page - Page number (1-based)
   * @param limit - Items per page
   */
  public getAllCategories(page: number, limit: number) {
    return this.fastify.prisma.category.findMany({
      select: {
        name: true,
        slug: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Get a category by slug
   * @param category_slug - The category slug
   */
  public getCategoryBySlug(category_slug: string) {
    return this.fastify.prisma.category.findFirst({
      where: { slug: category_slug },
      select: {
        name: true,
        slug: true
      }
    });
  }
}
