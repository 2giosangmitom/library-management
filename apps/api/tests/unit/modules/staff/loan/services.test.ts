import StaffLoanService from '@/modules/staff/loan/services';
import { buildMockFastify } from '../../../helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { Prisma } from '@/generated/prisma/client';

describe('StaffLoanService', async () => {
  const app = await buildMockFastify();
  const service = new StaffLoanService({ prisma: app.prisma });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('createLoan', () => {
    it('should call prisma.loan.create with correct data', async () => {
      const data = {
        user_id: faker.string.uuid(),
        book_clone_id: faker.string.uuid(),
        loan_date: faker.date.past().toISOString(),
        due_date: faker.date.soon().toISOString()
      };

      await service.createLoan(data);

      expect(app.prisma.loan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user_id: data.user_id,
            book_clone_id: data.book_clone_id,
            loan_date: new Date(data.loan_date),
            due_date: new Date(data.due_date)
          })
        })
      );
    });

    it('should throw conflict error if book clone already loaned', async () => {
      const data = {
        user_id: faker.string.uuid(),
        book_clone_id: faker.string.uuid(),
        loan_date: faker.date.past().toISOString(),
        due_date: faker.date.soon().toISOString()
      };

      vi.mocked(app.prisma.loan.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createLoan(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Loan already exists for the given book clone.]`
      );
    });

    it('should throw bad request error for invalid foreign keys', async () => {
      const data = {
        user_id: faker.string.uuid(),
        book_clone_id: faker.string.uuid(),
        loan_date: faker.date.past().toISOString(),
        due_date: faker.date.soon().toISOString()
      };

      vi.mocked(app.prisma.loan.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Invalid foreign key', {
          code: 'P2003',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createLoan(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[BadRequestError: Invalid user_id or book_clone_id.]`
      );
    });

    it('should rethrow unknown errors', async () => {
      const data = {
        user_id: faker.string.uuid(),
        book_clone_id: faker.string.uuid(),
        loan_date: faker.date.past().toISOString(),
        due_date: faker.date.soon().toISOString()
      };

      vi.mocked(app.prisma.loan.create).mockRejectedValueOnce(new Error('Unknown error'));

      await expect(service.createLoan(data)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Unknown error]`);
    });

    it('should return created loan on success', async () => {
      const data = {
        user_id: faker.string.uuid(),
        book_clone_id: faker.string.uuid(),
        loan_date: faker.date.past().toISOString(),
        due_date: faker.date.soon().toISOString()
      };

      vi.mocked(app.prisma.loan.create).mockResolvedValueOnce({
        ...data,
        loan_id: faker.string.uuid(),
        loan_date: new Date(data.loan_date),
        due_date: new Date(data.due_date),
        return_date: null,
        status: 'BORROWED',
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      } as unknown as Awaited<ReturnType<typeof app.prisma.loan.create>>);

      const result = await service.createLoan(data);

      expect(result).toEqual(
        expect.objectContaining({
          loan_id: expect.any(String),
          user_id: data.user_id,
          book_clone_id: data.book_clone_id,
          loan_date: expect.any(Date),
          due_date: expect.any(Date),
          return_date: null,
          status: 'BORROWED',
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        })
      );
    });
  });
});
