import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Studio Fitness API',
      version: '1.0.0',
      description: 'API para gerenciamento de aulas, agendamentos e alunos do Studio Fitness',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        Student: {
          type: 'object',
          properties: {
            id:        { type: 'string' },
            name:      { type: 'string' },
            email:     { type: 'string' },
            phone:     { type: 'string' },
            teacherId: { type: 'string' },
            type:      { type: 'string', enum: ['presencial', 'online'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Teacher: {
          type: 'object',
          properties: {
            id:          { type: 'string' },
            name:        { type: 'string' },
            email:       { type: 'string' },
            academyName: { type: 'string' },
            bio:         { type: 'string' },
            createdAt:   { type: 'string', format: 'date-time' },
          },
        },
        Slot: {
          type: 'object',
          properties: {
            id:              { type: 'string' },
            teacherId:       { type: 'string' },
            date:            { type: 'string', format: 'date' },
            startTime:       { type: 'string' },
            endTime:         { type: 'string' },
            capacity:        { type: 'integer' },
            currentBookings: { type: 'integer' },
            type:            { type: 'string' },
            status:          { type: 'string', enum: ['available', 'full', 'cancelled'] },
            description:     { type: 'string' },
            createdAt:       { type: 'string', format: 'date-time' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id:                  { type: 'string' },
            studentId:           { type: 'string' },
            teacherId:           { type: 'string' },
            slotId:              { type: 'string' },
            status:              { type: 'string', enum: ['confirmed', 'cancelled'] },
            attendanceConfirmed: { type: 'boolean' },
            bookedAt:            { type: 'string', format: 'date-time' },
            cancelledAt:         { type: 'string', format: 'date-time' },
          },
        },
        Streak: {
          type: 'object',
          properties: {
            id:            { type: 'string' },
            studentId:     { type: 'string' },
            currentStreak: { type: 'integer' },
            recordStreak:  { type: 'integer' },
            updatedAt:     { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
