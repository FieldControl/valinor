import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColunasService } from './colunas.service';
import { CreateColunaDto } from './dto/create-coluna.dto';
import { UpdateColunaDto } from './dto/update-coluna.dto';

@Controller('colunas')
export class ColunasController {
  constructor(private readonly colunasService: ColunasService) {}

  @Post()
  create(@Body() createColunaDto: CreateColunaDto) {
    return this.colunasService.create(createColunaDto);
  }

  @Get()
  findAll() {
    return this.colunasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colunasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateColunaDto: UpdateColunaDto) {
    return this.colunasService.update(+id, updateColunaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colunasService.remove(+id);
  }
}