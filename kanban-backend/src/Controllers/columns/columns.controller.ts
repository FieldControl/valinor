import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ColumnsDto } from '../../DTO/columns.dto';
import { ColumnsService } from '../../Services/columns/columns.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('columns')
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnService: ColumnsService) {}

  @Get()
  findAllColumns() {
    return this.columnService.findAllColumns();
  }

  @Get(':id')
  findColumnByID(@Param('id') id: string) {
    return this.columnService.findOneColumn(id);
  }

  @Post()
  createColumn(@Body() newColumn: ColumnsDto) {
    return this.columnService.createColumn(newColumn);
  }

  @Patch(':id')
  updateColumn(@Param('id') id: string, @Body() newColumn: ColumnsDto) {
    return this.columnService.updateColumn(id, newColumn);
  }

  @Delete(':id')
  deleteColumn(@Param('id') id: string) {
    return this.columnService.removeColumn(id);
  }
}
