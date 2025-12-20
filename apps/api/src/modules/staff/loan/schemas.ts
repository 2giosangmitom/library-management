import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';
import { LoanStatus } from '@/generated/prisma/enums';

const LoanDataSchema = Type.Object({
  loan_id: Type.String({ format: 'uuid' }),
  user_id: Type.String({ format: 'uuid' }),
  book_clone_id: Type.String({ format: 'uuid' }),
  loan_date: Type.String({ format: 'date-time' }),
  due_date: Type.String({ format: 'date-time' }),
  return_date: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  status: Type.Enum(LoanStatus),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export const CreateLoanSchema = {
  summary: 'Create a loan',
  description: 'Create a new loan for a book clone and user.',
  body: Type.Object({
    user_id: Type.String({ format: 'uuid' }),
    book_clone_id: Type.String({ format: 'uuid' }),
    loan_date: Type.String({ format: 'date-time' }),
    due_date: Type.String({ format: 'date-time' })
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: LoanDataSchema
    }),
    400: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const UpdateLoanSchema = {
  summary: 'Update a loan',
  description: 'Update loan status, due date, or return date.',
  params: Type.Object({
    loan_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object(
    {
      loan_date: Type.Optional(Type.String({ format: 'date-time' })),
      due_date: Type.Optional(Type.String({ format: 'date-time' })),
      return_date: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
      status: Type.Optional(Type.Enum(LoanStatus))
    },
    { additionalProperties: false, minProperties: 1 }
  ),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: LoanDataSchema
    }),
    400: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
