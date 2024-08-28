import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ColumnEntity } from './entities/column.entity';

@Controller('columns')
@ApiTags('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @ApiCreatedResponse({ type: ColumnEntity })
  @ApiBadRequestResponse()
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnsService.create(createColumnDto);
  }

  @Get()
  @ApiOkResponse({ type: ColumnEntity, isArray: true })
  findAll() {
    return this.columnsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ColumnEntity })
  @ApiNotFoundResponse()
  findOne(@Param('id') id: string) {
    return this.columnsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ColumnEntity })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  update(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  remove(@Param('id') id: string) {
    return this.columnsService.remove(id);
  }
}
