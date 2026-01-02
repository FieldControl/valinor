import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnDto } from './dto/reorder-column.dto';

@Controller('column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnService.create(createColumnDto);
  }

  @Get('with-cards')
  findAllWithCards() {
    return this.columnService.findAllWithCards();
  }

  @Post('reorder')
  reorderColumn(@Body() reorderColumnDto: ReorderColumnDto[]) {
    return this.columnService.reorderColumn(reorderColumnDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.columnService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnService.update(id, updateColumnDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.columnService.remove(id);
  }
}
