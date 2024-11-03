import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LanesService } from './lanes.service';
import { CreateLaneDto } from './dto/create-lane.dto';
import { UpdateLaneDto } from './dto/update-lane.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lanes')
@UseGuards(JwtAuthGuard)
export class LanesController {
  constructor(private readonly lanesService: LanesService) {}

  @Post()
  async create(@Body() createLaneDto: CreateLaneDto) {
    return await this.lanesService.create(createLaneDto);
  }

  @Get()
  async findAll() {
    return await this.lanesService.findAll();
  }
  @Get("board/:id")
  async findAllByBoard(@Param('id') id: number) {
    return await this.lanesService.findAllByBoard(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.lanesService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLaneDto: UpdateLaneDto) {
    return await this.lanesService.update(+id, updateLaneDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.lanesService.remove(+id);
  }
}
