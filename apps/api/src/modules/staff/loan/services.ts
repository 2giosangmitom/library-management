import type { PrismaClient } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class StaffLoanService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async createLoan(data: { user_id: string; book_clone_id: string; loan_date: string; due_date: string }) {
    try {
      const loan = await this.prisma.loan.create({
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
            throw httpErrors.conflict('Loan already exists for the given book clone.');
          case 'P2003':
            throw httpErrors.badRequest('Invalid user_id or book_clone_id.');
        }
      }
      throw error;
    }
  }
}
