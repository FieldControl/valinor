// backend/src/kanban/column.model.ts
import { Card } from './card.model'; // Ensure this path is correct

export interface Column {
  id: number;
  title: string;
  cards: Card[];
}

export async function createColumn(title: string): Promise<Column> {
  const newColumn: Column = { id: Date.now(), title, cards: [] }; // Ensure `id` is a number
  return newColumn;
}

// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS
  await app.listen(3000); // Ensure the server listens on port 3000
}
bootstrap();
