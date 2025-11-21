import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type {
  ContextConfigDefault,
  FastifyBaseLogger,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault
} from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';
import type { FastifySchema } from 'fastify/types/schema';
import { Role } from '@prisma/client';

export {};

declare global {
  type FastifyTypeBox = FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    FastifyBaseLogger,
    TypeBoxTypeProvider
  >;

  type FastifyRequestTypeBox<TSchema extends FastifySchema> = FastifyRequest<
    RouteGenericInterface,
    RawServerDefault,
    RawRequestDefaultExpression,
    TSchema,
    TypeBoxTypeProvider
  >;

  type FastifyReplyTypeBox<TSchema extends FastifySchema> = FastifyReply<
    RouteGenericInterface,
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    ContextConfigDefault,
    TSchema,
    TypeBoxTypeProvider
  >;

  type AccessToken = {
    typ: 'access_token';
    sub: string;
    role: Role;
    jti: string;
  };

  type RefreshToken = {
    typ: 'refresh_token';
    sub: string;
    jti: string;
  };

  type TokenType = 'access_token' | 'refresh_token';
}
