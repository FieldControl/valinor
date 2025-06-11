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
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';

@Controller('cards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Get()
  @Roles(0, 1, 2)
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
  create(@Body() dto: CreateCardDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(0, 1)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCardDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/move/:columnId/:order')
  @Roles(0, 1)
  move(
    @Param('id', ParseIntPipe) id: number,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('order', ParseIntPipe) order: number,
  ) {
    return this.service.move(id, columnId, order);
  }

  @Delete(':id')
  @Roles(0)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
