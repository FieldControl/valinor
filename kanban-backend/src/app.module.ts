import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importação dos módulos específicos do projeto
import { CardModule } from './card/card.module';
import { BoardModule } from './board/board.module';
import { SwimlaneModule } from './swimlane/swimlane.module';

// Importação das entidades para o TypeORM
import { Card } from './card/entities/card.entity';
import { Board } from './board/entities/board.entity';
import { Swimlane } from './swimlane/entities/swimlane.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '',
      database: 'kanban_project',
      entities: [Card, Board, Swimlane],
      synchronize: true,
    }),
    CardModule,
    BoardModule,
    SwimlaneModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}