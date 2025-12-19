import type StaffLoanService from './services';
import { CreateLoanSchema } from './schemas';

export default class StaffLoanController {
  private staffLoanService: StaffLoanService;

  public constructor({ staffLoanService }: { staffLoanService: StaffLoanService }) {
    this.staffLoanService = staffLoanService;
  }

  public async createLoan(
    req: FastifyRequestTypeBox<typeof CreateLoanSchema>,
    reply: FastifyReplyTypeBox<typeof CreateLoanSchema>
  ) {
    const loan = await this.staffLoanService.createLoan(req.body);

    return reply.status(201).send({
      message: 'Loan created successfully',
      data: {
        ...loan,
        loan_date: loan.loan_date.toISOString(),
        due_date: loan.due_date.toISOString(),
        return_date: loan.return_date ? loan.return_date.toISOString() : null,
        created_at: loan.created_at.toISOString(),
        updated_at: loan.updated_at.toISOString()
      }
    });
  }
}
