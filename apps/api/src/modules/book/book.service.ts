import { BookModel } from './book.model';
import { Prisma } from '@prisma/client';

export class BookService {
  private static instance: BookService;
  private bookModel: BookModel;

  private constructor(bookModel: BookModel) {
    this.bookModel = bookModel;
  }

  public static getInstance(fastify: FastifyTypeBox, bookModel = BookModel.getInstance(fastify)): BookService {
    if (!BookService.instance) {
      BookService.instance = new BookService(bookModel);
    }
    return BookService.instance;
  }

  public createBook(data: {
    title: string;
    description: string;
    total_copies: number;
    available_copies?: number;
    author_ids: string[];
    category_ids: string[];
  }) {
    const available = data.available_copies ? data.available_copies : data.total_copies;
    return this.bookModel.createBook({
      title: data.title,
      description: data.description,
      total_copies: data.total_copies,
      available_copies: available,
      author_ids: data.author_ids,
      category_ids: data.category_ids
    });
  }

  /**
   * Delete a book by ID
   * @param book_id The book ID
   */
  public async deleteBook(book_id: string) {
    try {
      await this.bookModel.deleteBook(book_id);
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Update a book by ID
   * @returns updated book or null if not found
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
    try {
      return await this.bookModel.updateBook(book_id, data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }
}
