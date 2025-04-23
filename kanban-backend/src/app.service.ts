import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Bem-vindo à API Kanban! Acesse /api/boards para começar.';
  }
}