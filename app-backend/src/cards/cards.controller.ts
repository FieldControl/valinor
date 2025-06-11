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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardsService } from './cards.service';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Get()
  @Roles(0, 1, 2)
  @ApiOperation({ summary: 'Listar todos os cards' })
  @ApiResponse({ status: 200, description: 'Lista de cards retornada.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(0, 1, 2)
  @ApiOperation({ summary: 'Detalhar um card específico' })
  @ApiResponse({ status: 200, description: 'Detalhes do card.' })
  @ApiResponse({ status: 404, description: 'Card não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(0, 1)
  @ApiOperation({ summary: 'Criar novo card' })
  @ApiResponse({ status: 201, description: 'Card criado.' })
  create(@Body() dto: CreateCardDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(0, 1)
  @ApiOperation({ summary: 'Atualizar um card' })
  @ApiResponse({ status: 200, description: 'Card atualizado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCardDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/move/:columnId/:order')
  @Roles(0, 1)
  @ApiOperation({ summary: 'Mover card entre colunas/ordens' })
  @ApiResponse({ status: 200, description: 'Card movido.' })
  move(
    @Param('id', ParseIntPipe) id: number,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('order', ParseIntPipe) order: number,
  ) {
    return this.service.move(id, columnId, order);
  }

  @Delete(':id')
  @Roles(0)
  @ApiOperation({ summary: 'Deletar um card (Somente admin)' })
  @ApiResponse({ status: 200, description: 'Card deletado.' })
  @ApiResponse({ status: 404, description: 'Card não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
