import { addRouteTags } from '@/hooks/onRoute.js';

export default function ratingHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Rating'));
}
