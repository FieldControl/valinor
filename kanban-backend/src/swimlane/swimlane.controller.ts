import { Controller, Get, Post, Body, Param, Put, Delete,  NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { SwimlaneService } from './swimlane.service';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { Swimlane } from './entities/swimlane.entity';

@Controller('swimlanes')
export class SwimlaneController {
  constructor(private readonly swimlaneService: SwimlaneService) {}

  @Post()
  create(@Body() createSwimlaneDto: CreateSwimlaneDto): Promise<Swimlane> {
    return this.swimlaneService.create(createSwimlaneDto);
  }

  @Get()
  findAll(): Promise<Swimlane[]> {
    return this.swimlaneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Swimlane> {
    return this.swimlaneService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateSwimlaneDto: UpdateSwimlaneDto): Promise<Swimlane> {
    return this.swimlaneService.update(id, updateSwimlaneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.swimlaneService.remove(id);
  }
}
