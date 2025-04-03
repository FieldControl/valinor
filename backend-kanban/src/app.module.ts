import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanColumn } from './entities/kanban-column.entity'; 
import { Card } from './entities/card.entity';  
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbanColumnModule } from './kanban-column/kanban-column.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'queijo123',
      database: 'kanban-db',
      autoLoadEntities: true,  
      synchronize: true,  
    }),
    TypeOrmModule.forFeature([KanbanColumn, Card]),
    KanbanColumnModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


