import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  async create(@Body() createColumnDto: CreateColumnDto) {
    try {
      return await this.columnsService.create(createColumnDto);
    } catch (error) {
      throw new HttpException(`Falha ao criar a coluna: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.columnsService.findAll();
    } catch (error) {
      throw new HttpException(`Falha ao consultar todas as colunas: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.columnsService.findOne(id);
    } catch (error) {

      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException('Falha ao consultar a coluna', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    try {
      return await this.columnsService.update(id, updateColumnDto);
    } catch (error) {

      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(`Falha ao atualizar a coluna ${error.message}`, HttpStatus.NOT_FOUND)
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.columnsService.remove(id);
    } catch (error) {

      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(`Falha ao remover a coluna: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
