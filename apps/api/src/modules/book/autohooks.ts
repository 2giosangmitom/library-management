import { addRouteTags } from '@/hooks/onRoute.js';

export default function bookHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Book'));
}
