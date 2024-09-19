import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { AuthGuard, payloudRequest } from 'src/authenticate/auth/auth.guard';


@Controller('column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Request() req: payloudRequest,
    @Body() createColumnDto: CreateColumnDto) {
    return this.columnService.createNewColumn(createColumnDto, req.user.id);
  }

  @Get(':boardId')
  @UseGuards(AuthGuard)
  findAll( @Request() req: payloudRequest, @Param('boardId') boardId: string) {
    return this.columnService.findAllByBoardId(Number(boardId), req.user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Request() req: payloudRequest,
    @Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    return this.columnService.updateColumn(+id, updateColumnDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove( @Request() req: payloudRequest, @Param('id') id: string) {
    console.log(id)
    return this.columnService.remove(+id, req.user.id);
  }
}
