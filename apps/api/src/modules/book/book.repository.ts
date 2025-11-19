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
  public async createBook(data: {
    title: string;
    description: string;
    publisher_id?: string;
    categories: string[];
    authors: string[];
  }) {
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
        categories: {
          select: {
            category_id: true
          }
        },
        created_at: true,
        updated_at: true
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
        },
        categories: {
          createMany: {
            data: data.categories.map((category_id) => ({ category_id })),
            skipDuplicates: true
          }
        }
      }
    });
  }

  /**
   * Find a book by its ID.
   * @param book_id The book ID
   * @return The book record or null if not found
   */
  public async findBookById(book_id: string, opts?: { includeRatings?: boolean }) {
    return this.fastify.prisma.book.findUnique({
      where: { book_id },
      select: {
        book_id: true,
        title: true,
        description: true,
        publisher: {
          select: {
            slug: true,
            name: true
          }
        },
        categories: {
          select: {
            category: {
              select: {
                category_id: true,
                slug: true,
                name: true
              }
            }
          }
        },
        ratings: opts?.includeRatings && {
          select: {
            rating_id: true,
            rate: true,
            user: {
              select: {
                user_id: true,
                name: true
              }
            },
            comment: true,
            created_at: true,
            updated_at: true
          }
        },
        authors: {
          select: {
            author: {
              select: {
                author_id: true,
                slug: true,
                name: true
              }
            }
          }
        },
        created_at: true,
        updated_at: true
      }
    });
  }

  /**
   * Find all books with pagination.
   * @param page The page number
   * @param pageSize The number of items per page
   * @return An object with total count and array of book records with rating stats
   */
  public async findAllBooks(page: number, pageSize: number) {
    // Get total and page of books
    const [total, books] = await this.fastify.prisma.$transaction([
      this.fastify.prisma.book.count(),
      this.fastify.prisma.book.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          book_id: true,
          title: true,
          description: true,
          publisher: {
            select: {
              slug: true,
              name: true
            }
          },
          categories: {
            select: {
              category: {
                select: {
                  category_id: true,
                  slug: true,
                  name: true
                }
              }
            }
          },
          authors: {
            select: {
              author: {
                select: {
                  author_id: true,
                  slug: true,
                  name: true
                }
              }
            }
          },
          created_at: true,
          updated_at: true
        }
      })
    ]);

    // Group ratings by book_id to compute average and count
    const bookIds = books.map((b) => b.book_id);
    const ratingsAgg =
      bookIds.length > 0
        ? await this.fastify.prisma.rating.groupBy({
            by: ['book_id'],
            where: { book_id: { in: bookIds } },
            _avg: { rate: true },
            _count: { rate: true }
          })
        : [];

    const ratingsMap = new Map(
      ratingsAgg.map((r) => [r.book_id, { average: r._avg?.rate ?? 0, total: r._count?.rate ?? 0 }])
    );

    // Attach aggregated rating info to each book
    const booksWithStats = books.map((b) => ({
      ...b,
      ratings: ratingsMap.get(b.book_id) ?? { average: 0, total: 0 }
    }));

    return { total, data: booksWithStats };
  }

  /**
   * Delete a book by its ID.
   * @param book_id The book ID
   * @return The deleted book's title
   */
  public async deleteBookById(book_id: string) {
    return await this.fastify.prisma.book.delete({
      where: { book_id },
      select: {
        title: true
      }
    });
  }

  /**
   * Update a book by its ID.
   * @param book_id The book ID
   * @param data The updated book data
   * @return The updated book record
   */
  public async updateBookById(
    book_id: string,
    data: {
      title?: string;
      description?: string;
      publisher_id?: string;
      authors?: string[];
    },
    opts?: {
      includeRatings?: boolean;
    }
  ) {
    return this.fastify.prisma.book.update({
      where: { book_id },
      data: {
        title: data.title,
        description: data.description,
        publisher_id: data.publisher_id ?? null,
        authors: {
          deleteMany: {},
          createMany: {
            data: data.authors?.map((author_id) => ({ author_id })) ?? [],
            skipDuplicates: true
          }
        }
      },
      select: {
        book_id: true,
        title: true,
        description: true,
        publisher: {
          select: {
            slug: true,
            name: true
          }
        },
        categories: {
          select: {
            category: {
              select: {
                category_id: true,
                slug: true,
                name: true
              }
            }
          }
        },
        ratings: opts?.includeRatings && {
          select: {
            rating_id: true,
            rate: true,
            user: {
              select: {
                user_id: true,
                name: true
              }
            },
            comment: true,
            created_at: true,
            updated_at: true
          }
        },
        authors: {
          select: {
            author: {
              select: {
                author_id: true,
                slug: true,
                name: true
              }
            }
          }
        },
        created_at: true,
        updated_at: true
      }
    });
  }
}
