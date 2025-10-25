import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './common/filters/allExceptionsFilter';
import { DatabaseModule } from './database/database.module';
import { CardsModule } from './modules/cards/cards.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { ColumnsModule } from './modules/columns/columns.module';

@Module({
  imports: [ConfigModule.forRoot(), CardsModule, DatabaseModule, ColumnsModule, ChatbotModule],
  controllers: [AppController],
  providers: [AppService, AllExceptionsFilter]
})
export class AppModule { }
