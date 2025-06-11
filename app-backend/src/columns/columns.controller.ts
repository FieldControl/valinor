import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';

@Controller('columns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ColumnsController {
  constructor(private readonly service: ColumnsService) {}

  @Get()
  @Roles(0, 1, 2) // Ex: admins, criadores e visualizadores
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(0, 1, 2)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(0, 1)
  create(@Body() dto: CreateColumnDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(0, 1)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateColumnDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(0)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.remove(id);
  }
}
