import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

export default fp(
  async (fastify: FastifyTypeBox) => {
    fastify.log.debug('Registering Swagger plugin');

    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'BookWise API',
          description: 'API documentation for BookWise - a library management system',
          version: '1.0.0'
        },
        tags: [
          { name: 'Auth', description: 'Authentication related endpoints' },
          { name: 'User', description: 'User management endpoints' },
          { name: 'Book', description: 'Book management endpoints' },
          { name: 'Loan', description: 'Book loan management endpoints' },
          { name: 'Author', description: 'Author management endpoints' },
          { name: 'Category', description: 'Book category management endpoints' }
        ]
      }
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list'
      }
    });
  },
  {
    name: 'Swagger'
  }
);
