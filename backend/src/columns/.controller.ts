import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Service } from './.service';
import { CreateDto } from './dto/create-.dto';
import { UpdateDto } from './dto/update-.dto';

@Controller('')
export class Controller {
  constructor(private readonly Service: Service) {}

  @Post()
  create(@Body() createDto: CreateDto) {
    return this.Service.create(createDto);
  }

  @Get()
  findAll() {
    return this.Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
    return this.Service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.Service.remove(+id);
  }
}
