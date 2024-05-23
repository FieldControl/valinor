import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SwimlaneService } from './swimlane.service';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';

@Controller('swimlane')
export class SwimlaneController {
  constructor(private readonly swimlaneService: SwimlaneService) {}

  @Post()
  create(@Body() createSwimlaneDto: CreateSwimlaneDto) {
    return this.swimlaneService.create(createSwimlaneDto);
  }

  @Get()
  findAll() {
    return this.swimlaneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.swimlaneService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSwimlaneDto: UpdateSwimlaneDto) {
    return this.swimlaneService.update(+id, updateSwimlaneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.swimlaneService.remove(+id);
  }
}
