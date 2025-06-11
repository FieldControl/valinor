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
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ColumnsService } from './columns.service';

@ApiTags('Columns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('columns')
export class ColumnsController {
  constructor(private readonly service: ColumnsService) {}

  @Get()
  @Roles(0, 1, 2)
  @ApiOperation({ summary: 'Listar todas as colunas' })
  @ApiResponse({ status: 200, description: 'Lista de colunas retornada.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(0, 1, 2)
  @ApiOperation({ summary: 'Obter detalhes de uma coluna' })
  @ApiResponse({ status: 200, description: 'Detalhes da coluna.' })
  @ApiResponse({ status: 404, description: 'Coluna não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(0, 1)
  @ApiOperation({ summary: 'Criar nova coluna' })
  @ApiResponse({ status: 201, description: 'Coluna criada.' })
  create(@Body() dto: CreateColumnDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(0, 1)
  @ApiOperation({ summary: 'Atualizar coluna existente' })
  @ApiResponse({ status: 200, description: 'Coluna atualizada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateColumnDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(0)
  @ApiOperation({ summary: 'Deletar coluna (Somente admin)' })
  @ApiResponse({ status: 200, description: 'Coluna deletada.' })
  @ApiResponse({ status: 404, description: 'Coluna não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
