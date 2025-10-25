import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) { }

  @Post()
  create(@Req() req: Request, @Body() createColumnDto: CreateColumnDto) {
    const sessionId = req["sessionId"]
    return this.columnsService.create(sessionId, createColumnDto);
  }

  @Get('with-cards')
  listWithCards(@Req() req: Request) {
    const sessionId = req["sessionId"]
    return this.columnsService.listWithCards(sessionId);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.columnsService.delete(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number,
    @Body() updateColumnDto: UpdateColumnDto) {
    return this.columnsService.update(id, updateColumnDto)
  }
}
