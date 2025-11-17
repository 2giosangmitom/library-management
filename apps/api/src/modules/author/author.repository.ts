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

  /**
   * Model method to get all authors from the database
   */
  public getAllAuthors(page: number, limit: number) {
    return this.fastify.prisma.author.findMany({
      select: {
        name: true,
        short_biography: true,
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
   * Model method to get an author by slug from the database
   * @param author_slug Author slug
   */
  public getAuthorBySlug(author_slug: string) {
    return this.fastify.prisma.author.findUnique({
      where: { slug: author_slug },
      select: {
        name: true,
        short_biography: true,
        biography: true,
        nationality: true,
        slug: true
      }
    });
  }

  /**
   * Model method to delete an author by ID from the database
   * @param author_id Author ID
   */
  public deleteAuthor(author_id: string) {
    return this.fastify.prisma.author.delete({
      where: { author_id }
    });
  }

  /**
   * Model method to update an author by ID in the database
   * @param author_id Author ID
   * @param data Author data
   */
  public updateAuthor(
    author_id: string,
    data: {
      name?: string;
      short_biography?: string;
      biography?: string;
      nationality?: string;
      slug?: string;
    }
  ) {
    return this.fastify.prisma.author.update({
      where: { author_id },
      data,
      select: {
        author_id: true,
        name: true,
        short_biography: true,
        biography: true,
        nationality: true,
        slug: true,
        updated_at: true
      }
    });
  }
}
