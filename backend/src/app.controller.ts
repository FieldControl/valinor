import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Tasks } from './app.service';
@Controller('api/todos')
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly appService: AppService) {}
  @Get()
  getTodos(): Tasks[] {
    try {
      return this.appService.getTasks();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post()
  createTodo(@Body() { name }: Tasks): Tasks[] {
    try {
      return this.appService.createTask(name);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Delete(':id')
  deleteTodo(@Param('id') id: number): Tasks[] {
    try {
      return this.appService.deleteTask(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}