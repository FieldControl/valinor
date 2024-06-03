import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardsModule } from './cards/cards.module';
import { ColumnsModule } from './columns/columns.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardsModule } from './boards/boards.module';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [CardsModule, 
            ColumnsModule, 
            MongooseModule.forRoot(process.env.DB_CONNECTION_STRING_TEST), 
            BoardsModule, 
            AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
