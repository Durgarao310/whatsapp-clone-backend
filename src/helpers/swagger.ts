import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';

export function setupSwagger(app: Express) {
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Realtime Chat API',
        version: '1.0.0',
        description: 'API documentation for the Realtime Chat Backend',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
              username: { type: 'string', example: 'alice' },
              online: { type: 'boolean', example: true },
              socketIds: {
                type: 'array',
                items: { type: 'string' },
                example: ['socket123', 'socket456'],
                nullable: true
              },
            },
          },
          Message: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '60d0fe4f5311236168a109cb' },
              sender: { $ref: '#/components/schemas/User' },
              receiver: { $ref: '#/components/schemas/User' },
              content: { type: 'string', example: 'Hello!' },
              seen: { type: 'boolean', example: false },
              createdAt: { type: 'string', format: 'date-time', example: '2025-05-18T12:00:00.000Z' },
            },
          },
          Call: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '60d0fe4f5311236168a109cc' },
              caller: { $ref: '#/components/schemas/User' },
              callee: { $ref: '#/components/schemas/User' },
              status: { type: 'string', enum: ['ongoing', 'ended', 'missed'], example: 'ongoing' },
              startedAt: { type: 'string', format: 'date-time', example: '2025-05-18T12:00:00.000Z' },
              endedAt: { type: 'string', format: 'date-time', nullable: true, example: null },
            },
          },
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/swagger/*.yaml', './src/routes/*.ts', './src/controllers/*.ts'],
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
