import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColunaService } from './coluna.service';
import { CreateColunaDto } from './dto/create-coluna.dto';
import { UpdateColunaDto } from './dto/update-coluna.dto';

@Controller('coluna')
export class ColunaController {
  constructor(private readonly colunaService: ColunaService) {}

  @Post()
  create(@Body() createColunaDto: CreateColunaDto) {
    return this.colunaService.create(createColunaDto);
  }

  @Get(`/quadro/:quadroId`)
  findAllByQuadroId(@Param('quadroId') quadroId : number) {
    return this.colunaService.findByQuadroId(Number (quadroId));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateColunaDto: UpdateColunaDto) {
    return this.colunaService.update(+id, updateColunaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colunaService.remove(+id);
  }
}
