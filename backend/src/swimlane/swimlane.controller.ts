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
  import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';
  
  @Controller('swimlane')
  export class SwimlaneController {
  constructor(private readonly swimlaneService: SwimlaneService) {}
  
  @Post()
  @UseGuards(AuthGuard)
  create(
   @Request() req: PayloadRequest,
   @Body() createSwimlaneDto: CreateSwimlaneDto,
  ) {
   return this.swimlaneService.create(createSwimlaneDto, req.user.id);
  }
  
  @Put('update-order')
  @UseGuards(AuthGuard)
  updateOrder(
   @Request() req: PayloadRequest,
   @Body() reorderedSwimlanes: ReordereSwimlaneDto,
  ) {
   return this.swimlaneService.updateSwimlaneOrders(
     reorderedSwimlanes,
     req.user.id,
   );
  }
  
  @Get('/board/:boardId')
  @UseGuards(AuthGuard)
  findAll(@Param('boardId') boardId: string, @Request() req: PayloadRequest) {
   return this.swimlaneService.findAllByBoardId(Number(boardId), req.user.id);
  }
  
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
   @Param('id') id: string,
   @Body() updateSwimlaneDto: UpdateSwimlaneDto,
   @Request() req: PayloadRequest,
  ) {
   return this.swimlaneService.update(+id, req.user.id, updateSwimlaneDto);
  }
  
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
   return this.swimlaneService.remove(+id, req.user.id);
  }
  }