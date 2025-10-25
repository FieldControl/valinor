import {
  Body,
  Controller,
  Post,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { ChatbotService } from './chatbot.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) { }

  @Post()
  chatbot(@Req() req: Request, @Body() createMessageDto: CreateMessageDto) {
    const sessionId = req["sessionId"]
    return this.chatbotService.handleMessage(sessionId,createMessageDto);
  }
}
