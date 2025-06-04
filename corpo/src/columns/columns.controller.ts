import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { BoardColumn } from '../entities/column.entity';

    @Controller('columns')
    export class ColumnsController {
      constructor(private readonly columnsService: ColumnsService) {}

      @Get()
      async findAll(): Promise<BoardColumn[]> {
        return this.columnsService.findAll();
      }

      @Get(':id')
      async findOne(@Param('id') id: string): Promise<BoardColumn> {
        return this.columnsService.findOne(+id);
      }

      @Post()
      @HttpCode(HttpStatus.CREATED)
      async create(@Body() createColumnDto: CreateColumnDto): Promise<BoardColumn> {
        return this.columnsService.create(createColumnDto);
      }

      @Delete(':id')
      @HttpCode(HttpStatus.NO_CONTENT)
      async remove(@Param('id') id: string): Promise<void> {
        await this.columnsService.remove(+id);
      }
    }