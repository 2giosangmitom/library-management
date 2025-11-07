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

  /**
   * Get all books with their authors and categories
   */
  public async getAllBooks(page = 1, limit = 10) {
    const books = await this.bookModel.getAllBooks(page, limit);

    return books.map((book) => ({
      ...book,
      authors: book.authors.map((ba) => {
        return {
          author_id: ba.author.author_id,
          name: ba.author.name
        };
      }),
      categories: book.categories.map((bc) => {
        return {
          category_id: bc.category.category_id,
          name: bc.category.name
        };
      }),
      created_at: book.created_at.toISOString(),
      updated_at: book.updated_at.toISOString()
    }));
  }

  /**
   * Get a book by ID
   */
  public async getBookById(book_id: string) {
    const book = await this.bookModel.getBookById(book_id);

    if (!book) {
      return null;
    }

    return {
      ...book,
      authors: book.authors.map((ba) => ({
        author_id: ba.author.author_id,
        name: ba.author.name
      })),
      categories: book.categories.map((bc) => ({
        category_id: bc.category.category_id,
        name: bc.category.name
      })),
      created_at: book.created_at.toISOString(),
      updated_at: book.updated_at.toISOString()
    };
  }
}
