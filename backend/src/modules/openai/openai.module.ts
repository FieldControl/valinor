// src/openai/openai.module.ts
import { Module } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module';
import { ColumnsModule } from '../columns/columns.module';
import { MessageContextService } from './services/messageContext.service';
import { OpenAIService } from './services/openai.service';
import { ToolsService } from './services/tools.service';



@Module({
  imports: [ColumnsModule, CardsModule],
  providers: [
    OpenAIService,
    ToolsService,
    MessageContextService,
  ],
  exports: [
    OpenAIService,
    ToolsService,
    MessageContextService,
  ],
})
export class OpenAIModule { }
