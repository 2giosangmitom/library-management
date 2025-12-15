import { Prisma } from '@/generated/prisma/client';

export default class StaffLoanService {
  private static instance: StaffLoanService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): StaffLoanService {
    if (!StaffLoanService.instance) {
      StaffLoanService.instance = new StaffLoanService(fastify);
    }
    return StaffLoanService.instance;
  }

  public async createLoan(data: { user_id: string; book_clone_id: string; loan_date: string; due_date: string }) {
    try {
      const loan = await this.fastify.prisma.loan.create({
        data: {
          user_id: data.user_id,
          book_clone_id: data.book_clone_id,
          loan_date: new Date(data.loan_date),
          due_date: new Date(data.due_date)
        }
      });

      return loan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw this.fastify.httpErrors.conflict('Loan already exists for the given book clone.');
          case 'P2003':
            throw this.fastify.httpErrors.badRequest('Invalid user_id or book_clone_id.');
        }
      }
      throw error;
    }
  }
}
