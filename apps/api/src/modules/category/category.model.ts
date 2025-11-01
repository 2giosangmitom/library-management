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
}
