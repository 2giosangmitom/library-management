import { Prisma } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetBooksSchema } from './schemas';

export default class StaffBookService {
  private static instance: StaffBookService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): StaffBookService {
    if (!StaffBookService.instance) {
      StaffBookService.instance = new StaffBookService(fastify);
    }
    return StaffBookService.instance;
  }

  public async createBook(data: {
    title: string;
    description: string;
    isbn: string;
    published_at: string;
    publisher_id: string | null;
    authors?: string[];
    categories?: string[];
  }) {
    try {
      const createdBook = await this.fastify.prisma.book.create({
        data: {
          title: data.title,
          description: data.description,
          isbn: data.isbn,
          published_at: new Date(data.published_at),
          publisher_id: data.publisher_id ?? null,
          authors: data.authors && {
            create: data.authors.map((author_id) => ({
              author_id
            }))
          },
          categories: data.categories && {
            create: data.categories.map((category_id) => ({
              category_id
            }))
          }
        },
        include: {
          authors: { select: { author_id: true } },
          categories: { select: { category_id: true } }
        }
      });

      return createdBook;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw this.fastify.httpErrors.conflict('Book with the given ISBN already exists.');
        }
      }
      throw error;
    }
  }

  public async deleteBook(book_id: string) {
    try {
      const deleted = await this.fastify.prisma.book.delete({
        select: { book_id: true, title: true },
        where: { book_id }
      });

      return deleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw this.fastify.httpErrors.notFound('Book with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async updateBook(
    book_id: string,
    data: {
      title: string;
      description: string;
      isbn: string;
      published_at: string;
      publisher_id: string | null;
      authors?: string[];
      categories?: string[];
    }
  ) {
    try {
      const updatedBook = await this.fastify.prisma.book.update({
        include: {
          authors: { select: { author_id: true } },
          categories: { select: { category_id: true } }
        },
        data: {
          title: data.title,
          description: data.description,
          isbn: data.isbn,
          published_at: data.published_at,
          publisher_id: data.publisher_id,
          authors: data.authors && {
            deleteMany: { book_id }, // Delete all authors associated with this book
            create: data.authors.map((author_id) => ({
              author_id
            }))
          },
          categories: data.categories && {
            deleteMany: { book_id },
            create: data.categories.map((category_id) => ({ category_id }))
          }
        },
        where: {
          book_id
        }
      });

      return updatedBook;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw this.fastify.httpErrors.notFound('Book with the given ID does not exist.');
          case 'P2002':
            throw this.fastify.httpErrors.conflict('Book with the given ISBN already exists.');
        }
      }
      throw error;
    }
  }

  public async getBooks(query: Static<typeof GetBooksSchema.querystring> & { page: number; limit: number }) {
    const filters: Prisma.BookWhereInput = {};

    if (query.title) {
      filters.title = { contains: query.title, mode: 'insensitive' };
    }
    if (query.isbn) {
      filters.isbn = { contains: query.isbn, mode: 'insensitive' };
    }
    if (query.publisher_id) {
      filters.publisher_id = query.publisher_id;
    }

    const [books, total] = await this.fastify.prisma.$transaction([
      this.fastify.prisma.book.findMany({
        where: filters,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          book_id: true,
          title: true,
          description: true,
          isbn: true,
          published_at: true,
          publisher_id: true,
          image_url: true,
          created_at: true,
          updated_at: true,
          authors: { select: { author_id: true } },
          categories: { select: { category_id: true } }
        }
      }),
      this.fastify.prisma.book.count({ where: filters })
    ]);

    return { books, total };
  }
}
