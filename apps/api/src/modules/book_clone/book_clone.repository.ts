import { BookCondition } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class BookCloneRepository {
  private static instance: BookCloneRepository | null = null;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): BookCloneRepository {
    if (!BookCloneRepository.instance) {
      BookCloneRepository.instance = new BookCloneRepository(fastify);
    }
    return BookCloneRepository.instance;
  }

  /**
   * Creates a new book clone record in the database.
   * @param data The data to create a new book clone.
   * @returns The created book clone record.
   */
  public async createBookClone(data: {
    book_id: string;
    location_id: string;
    is_available: boolean;
    barcode: string;
    condition: BookCondition;
  }) {
    return this.fastify.prisma.book_Clone.create({
      data
    });
  }

  /**
   * Deletes a book clone record by its ID.
   * @param book_clone_id The ID of the book clone to delete.
   * @returns The deleted book clone record.
   */
  public async deleteBookClone(book_clone_id: string) {
    return this.fastify.prisma.book_Clone.delete({
      select: { book_clone_id: true },
      where: { book_clone_id }
    });
  }

  /**
   * Updates a book clone record by its ID.
   * @param book_clone_id The ID of the book clone to update.
   * @param data The data to update the book clone.
   * @returns The updated book clone record.
   */
  public async updateBookClone(
    book_clone_id: string,
    data: Partial<{
      book_id: string;
      location_id: string;
      is_available: boolean;
      barcode: string;
      condition: BookCondition;
    }>
  ) {
    return this.fastify.prisma.book_Clone.update({
      where: { book_clone_id },
      data
    });
  }

  /**
   * Find all book clones with pagination.
   * @param page The page number.
   * @param pageSize The number of items per page.
   * @returns An array of book clone records.
   */
  public async findAllBookClones(
    page: number,
    pageSize: number,
    where?: Partial<{
      book_id: string;
      location_id: string;
      is_available: boolean;
      barcode: string;
      condition: BookCondition;
    }>,
    orderBy?: Partial<{
      book_clone_id: Prisma.SortOrder;
      book_id: Prisma.SortOrder;
      location_id: Prisma.SortOrder;
      is_available: Prisma.SortOrder;
      barcode: Prisma.SortOrder;
      condition: Prisma.SortOrder;
      created_at: Prisma.SortOrder;
      updated_at: Prisma.SortOrder;
    }>
  ) {
    const [total, bookClones] = await this.fastify.prisma.$transaction([
      this.fastify.prisma.book_Clone.count({ where }),
      this.fastify.prisma.book_Clone.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy
      })
    ]);

    return { total, data: bookClones };
  }
}
