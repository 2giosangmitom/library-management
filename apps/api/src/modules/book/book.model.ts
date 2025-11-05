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

  /**
   * Delete a book by ID
   * @param book_id The book ID
   */
  public deleteBook(book_id: string) {
    return this.fastify.prisma.$transaction(async (tx) => {
      await tx.book_Author.deleteMany({ where: { book_id } });
      await tx.book_Category.deleteMany({ where: { book_id } });
      return tx.book.delete({ where: { book_id } });
    });
  }

  /**
   * Update a book and optionally replace its authors/categories
   */
  public async updateBook(
    book_id: string,
    data: {
      title?: string;
      description?: string;
      total_copies?: number;
      available_copies?: number;
      author_ids?: string[];
      category_ids?: string[];
    }
  ) {
    const { title, description, total_copies, available_copies, author_ids, category_ids } = data;

    return this.fastify.prisma.$transaction(async (tx) => {
      // If authors provided, replace relations
      if (author_ids) {
        await tx.book_Author.deleteMany({ where: { book_id } });
        if (author_ids.length > 0) {
          await tx.book_Author.createMany({ data: author_ids.map((author_id) => ({ book_id, author_id })) });
        }
      }

      // If categories provided, replace relations
      if (category_ids) {
        await tx.book_Category.deleteMany({ where: { book_id } });
        if (category_ids.length > 0) {
          await tx.book_Category.createMany({ data: category_ids.map((category_id) => ({ book_id, category_id })) });
        }
      }

      return tx.book.update({
        where: { book_id },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(total_copies !== undefined ? { total_copies } : {}),
          ...(available_copies !== undefined ? { available_copies } : {})
        },
        select: {
          book_id: true,
          title: true,
          description: true,
          total_copies: true,
          available_copies: true,
          updated_at: true
        }
      });
    });
  }
}
