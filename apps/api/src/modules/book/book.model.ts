export class BookModel {
  private static instance: BookModel;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): BookModel {
    if (!BookModel.instance) {
      BookModel.instance = new BookModel(fastify);
    }
    return BookModel.instance;
  }

  /**
   * Create a new book and relations with authors/categories
   */
  public async createBook(data: {
    title: string;
    description: string;
    total_copies: number;
    available_copies: number;
    author_ids: string[];
    category_ids: string[];
  }) {
    const { title, description, total_copies, available_copies, author_ids, category_ids } = data;

    return this.fastify.prisma.book.create({
      select: {
        book_id: true,
        title: true,
        description: true,
        total_copies: true,
        available_copies: true,
        created_at: true
      },
      data: {
        title,
        description,
        total_copies,
        available_copies,
        authors: {
          createMany: {
            data: author_ids.map((author_id) => ({ author_id }))
          }
        },
        categories: {
          createMany: {
            data: category_ids.map((category_id) => ({ category_id }))
          }
        }
      }
    });
  }
}
