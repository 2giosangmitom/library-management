export class BookRepository {
  private static instance: BookRepository;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): BookRepository {
    if (!BookRepository.instance) {
      BookRepository.instance = new BookRepository(fastify);
    }
    return BookRepository.instance;
  }

  /**
   * Create a new book record in the database.
   * @param data The book data
   */
  public async createBook(data: { title: string; description: string; publisher_id: string; authors: string[] }) {
    return this.fastify.prisma.book.create({
      select: {
        book_id: true,
        title: true,
        description: true,
        publisher_id: true,
        authors: {
          select: {
            author_id: true
          }
        },
        created_at: true
      },
      data: {
        title: data.title,
        description: data.description,
        publisher_id: data.publisher_id,
        authors: {
          createMany: {
            data: data.authors.map((author_id) => ({ author_id })),
            skipDuplicates: true
          }
        }
      }
    });
  }
}
