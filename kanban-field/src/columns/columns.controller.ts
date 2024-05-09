import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createColumnDto: CreateColumnDto, @Req() req) {
    try {
      return await this.columnsService.create(createColumnDto, createColumnDto.board, req.user.userId);
    } catch (error) {
      throw new HttpException(`Falha ao criar a coluna: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    try {
      return await this.columnsService.findAll(req.user.userId);
    } catch (error) {
      throw new HttpException(`Falha ao consultar todas as colunas: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    try {
      return await this.columnsService.findOne(id, req.user.userId);
    } catch (error) {

      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException('Falha ao consultar a coluna', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('boards/:boardId')
  async findColumnsByBoard(@Param('boardId') boardId: string, @Req() req) {
    try {
      return this.columnsService.findByBoard(boardId, req.user.userId);
    } catch (error) {
      throw new HttpException(`Falha ao encotrar as colunas: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto, @Req() req) {
    try {
      return await this.columnsService.update(id, updateColumnDto, req.user.userId);
    } catch (error) {

      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(`Falha ao atualizar a coluna ${error.message}`, HttpStatus.NOT_FOUND)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    try {
      return await this.columnsService.remove(id, req.user.userId);
    } catch (error) {

      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(`Falha ao remover a coluna: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
