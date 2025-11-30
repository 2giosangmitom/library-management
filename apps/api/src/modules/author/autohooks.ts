import { addRouteTags } from '@/hooks/onRoute.js';

export default function authorHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Author'));
}
