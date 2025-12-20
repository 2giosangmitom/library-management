import type { PrismaClient } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
import { LoanStatus } from '@/generated/prisma/enums';
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

  public async updateLoan(
    loan_id: string,
    data: { loan_date?: string; due_date?: string; return_date?: string | null; status?: LoanStatus }
  ) {
    const updateData: Prisma.LoanUpdateInput = {};

    if (data.loan_date) {
      updateData.loan_date = new Date(data.loan_date);
    }

    if (data.due_date) {
      updateData.due_date = new Date(data.due_date);
    }

    if (data.return_date !== undefined) {
      updateData.return_date = data.return_date ? new Date(data.return_date) : null;
    }

    if (data.status) {
      updateData.status = data.status;
    }

    if (Object.keys(updateData).length === 0) {
      throw httpErrors.badRequest('No update fields provided.');
    }

    try {
      const loan = await this.prisma.loan.update({
        where: { loan_id },
        data: updateData
      });

      return loan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw httpErrors.notFound('Loan with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async deleteLoan(loan_id: string) {
    try {
      const deleted = await this.prisma.loan.delete({
        where: { loan_id }
      });

      return deleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw httpErrors.notFound('Loan with the given ID does not exist.');
        }
      }
      throw error;
    }
  }
}
