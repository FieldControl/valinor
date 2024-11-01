import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { SwimlaneService } from './swimlane.service';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard';
import { ReorderedSwimlaneDto } from './dto/reorder-swimlane.dto';

@Controller('swimlane')
export class SwimlaneController {
  constructor(private readonly swimlaneService: SwimlaneService) {}

  // Cria uma nova swimlane
  @Post()
  @UseGuards(AuthGuard)
  create(
    @Request() req: PayloadRequest,
    @Body() createSwimlaneDto: CreateSwimlaneDto,
  ) {
    return this.swimlaneService.create(createSwimlaneDto, req.user.id);
  }
  // Atualiza a ordem das swimlanes
  @Put('update-order')
  @UseGuards(AuthGuard)
  updateOrder(
    @Request() req: PayloadRequest,
    @Body() reorderedSwimlaneDto: ReorderedSwimlaneDto,
  ) {
    return this.swimlaneService.updateSwimlaneOrders(
      reorderedSwimlaneDto, 
      req.user.id
    );
  }

  // Retorna todas as swimlanes associadas ao board
  @Get('/board/:boardId')
  @UseGuards(AuthGuard)
  findAll(@Param('boardId') boardId: string, @Request() req: PayloadRequest) {
    return this.swimlaneService.findAllByBoardId(Number(boardId), req.user.id);
  }

  // Retorna uma swimlane específica associada ao board
  // Retorna também as cards associadas à swimlane
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSwimlaneDto: UpdateSwimlaneDto,
    @Request() req: PayloadRequest,
  ) {
    return this.swimlaneService.update(+id, req.user.id, updateSwimlaneDto);
  }

  // Remove uma swimlane
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.swimlaneService.remove(+id, req.user.id);
  }
}
