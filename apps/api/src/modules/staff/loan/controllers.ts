import type StaffLoanService from './services';
import { CreateLoanSchema, UpdateLoanSchema, DeleteLoanSchema } from './schemas';

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

  public async updateLoan(
    req: FastifyRequestTypeBox<typeof UpdateLoanSchema>,
    reply: FastifyReplyTypeBox<typeof UpdateLoanSchema>
  ) {
    const { loan_id } = req.params;
    const updated = await this.staffLoanService.updateLoan(loan_id, req.body);

    return reply.status(200).send({
      message: 'Loan updated successfully',
      data: {
        ...updated,
        loan_date: updated.loan_date.toISOString(),
        due_date: updated.due_date.toISOString(),
        return_date: updated.return_date ? updated.return_date.toISOString() : null,
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString()
      }
    });
  }

  public async deleteLoan(
    req: FastifyRequestTypeBox<typeof DeleteLoanSchema>,
    reply: FastifyReplyTypeBox<typeof DeleteLoanSchema>
  ) {
    const { loan_id } = req.params;
    const deleted = await this.staffLoanService.deleteLoan(loan_id);

    return reply.status(200).send({
      message: 'Loan deleted successfully',
      data: {
        ...deleted,
        loan_date: deleted.loan_date.toISOString(),
        due_date: deleted.due_date.toISOString(),
        return_date: deleted.return_date ? deleted.return_date.toISOString() : null,
        created_at: deleted.created_at.toISOString(),
        updated_at: deleted.updated_at.toISOString()
      }
    });
  }
}
