export class AuthorModel {
  private static instance: AuthorModel;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): AuthorModel {
    if (!AuthorModel.instance) {
      AuthorModel.instance = new AuthorModel(fastify);
    }
    return AuthorModel.instance;
  }

  /**
   * Model method to create a new author in the database
   * @param data Author data
   */
  public createAuthor(data: {
    name: string;
    short_biography: string;
    biography: string;
    nationality: string;
    slug: string;
  }) {
    return this.fastify.prisma.author.create({
      select: {
        author_id: true,
        name: true,
        biography: true,
        short_biography: true,
        nationality: true,
        slug: true,
        created_at: true
      },
      data
    });
  }
}
