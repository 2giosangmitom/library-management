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
}
