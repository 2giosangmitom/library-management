import { addRouteTags } from '@/hooks/onRoute.js';

export default function categoryHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Category'));
}
