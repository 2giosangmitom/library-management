import { Type, type Static } from 'typebox';

export const envSchema = Type.Object({
  CORS_ORIGINS: Type.Optional(Type.String()),
  CORS_METHODS: Type.Optional(Type.String()),
  DATABASE_URL: Type.String(),
  REDIS_URL: Type.String(),
  JWT_SECRET: Type.String()
});

export type envType = Static<typeof envSchema>;
