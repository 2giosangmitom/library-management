export class AuthorRepository {
  private static instance: AuthorRepository;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): AuthorRepository {
    if (!AuthorRepository.instance) {
      AuthorRepository.instance = new AuthorRepository(fastify);
    }
    return AuthorRepository.instance;
  }

  /**
   * Creates a new author in the database
   * @param data Author data
   * @return Created author
   */
  public async createAuthor(data: {
    name: string;
    short_biography: string;
    biography: string;
    nationality?: string;
    date_of_birth?: string;
    date_of_death?: string;
    slug: string;
  }) {
    return this.fastify.prisma.author.create({
      select: {
        author_id: true,
        name: true,
        short_biography: true,
        biography: true,
        nationality: true,
        date_of_birth: true,
        date_of_death: true,
        slug: true,
        created_at: true
      },
      data
    });
  }

  /**
   * Finds all authors from the database with pagination
   * @param page Page number
   * @param pageSize Number of authors per page
   * @return Total count and list of authors
   */
  public async findAllAuthors(page: number, pageSize: number) {
    return this.fastify.prisma.$transaction([
      this.fastify.prisma.author.count(),
      this.fastify.prisma.author.findMany({
        select: {
          name: true,
          short_biography: true,
          slug: true
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          name: 'asc'
        }
      })
    ]);
  }

  /**
   * Finds an author by ID from the database
   * @param author_id Author ID
   * @return Author data
   */
  public async findAuthorById(author_id: string) {
    return this.fastify.prisma.author.findUnique({
      where: { author_id },
      select: {
        author_id: true,
        name: true,
        short_biography: true,
        biography: true,
        nationality: true,
        date_of_birth: true,
        date_of_death: true,
        slug: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  /**
   * Finds an author by slug from the database
   * @param author_slug Author slug
   * @return Author data
   */
  public async findAuthorBySlug(author_slug: string) {
    return this.fastify.prisma.author.findUnique({
      where: { slug: author_slug },
      select: {
        author_id: true,
        name: true,
        short_biography: true,
        biography: true,
        nationality: true,
        date_of_birth: true,
        date_of_death: true,
        slug: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  /**
   * Deletes an author by ID from the database
   * @param author_id Author ID
   * @return Deleted author name
   */
  public async deleteAuthor(author_id: string) {
    return this.fastify.prisma.author.delete({
      select: { name: true },
      where: { author_id }
    });
  }

  /**
   * Updates an author by ID in the database
   * @param author_id Author ID
   * @param data Author data
   */
  public async updateAuthor(
    author_id: string,
    data: {
      name?: string;
      short_biography?: string;
      biography?: string;
      nationality?: string;
      date_of_birth?: string;
      date_of_death?: string;
      slug?: string;
    }
  ) {
    return this.fastify.prisma.author.update({
      where: { author_id },
      select: {
        author_id: true,
        name: true,
        short_biography: true,
        biography: true,
        nationality: true,
        date_of_birth: true,
        date_of_death: true,
        slug: true,
        updated_at: true
      },
      data
    });
  }
}
