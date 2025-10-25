
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CardsModule } from '../cards/cards.module';
import { ColumnsModule } from '../columns/columns.module';
import { OpenAIModule } from '../openai/openai.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

@Module({
  imports: [CardsModule, ColumnsModule, DatabaseModule, OpenAIModule],
  controllers: [ChatbotController],
  providers: [ChatbotService]
})
export class ChatbotModule { }
