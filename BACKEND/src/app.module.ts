import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './boards/boards.module';
import { CardsModule } from './cards/cards.module';
import { ColumnsModule } from './columns/columns.module';
import { TypeOrmModule } from '@nestjs/typeorm';



@Module({
  imports: [
    BoardsModule,
    ColumnsModule,
    CardsModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './src/database/kanban.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production' ? true : false,
    }),
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
