// NestJS
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      message: 'Kanban API is running!',
      status: 'OK',
      version: '1.0.0',
      endpoints: {
        columns: '/api/columns',
        cards: '/api/cards',
      },
    };
  }
}
