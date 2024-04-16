import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CardsModule } from './cards/cards.module';
import { ColumnsModule } from './columns/columns.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [UsersModule, CardsModule, ColumnsModule, 
            MongooseModule.forRoot('mongodb+srv://jonathan:30082002@kabannestjs.hqq0piv.mongodb.net/')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
