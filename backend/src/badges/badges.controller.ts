import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { Badge } from './entities/badge.entity';
import { v4 as uuid } from 'uuid';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post()
  create(@Body() createBadgeDto: CreateBadgeDto) {
    const badge = new Badge();
    badge.id = uuid();
    badge.name = createBadgeDto.name;
    badge.color = createBadgeDto.color;
    this.badgesService.create(badge);
    return {
      badge: badge,
      message: "Badge criada com sucesso !"
    }
  }

  @Get()
  findAll() {
    return this.badgesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.badgesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBadgeDto: UpdateBadgeDto) {
    const badge = await this.badgesService.update(id, updateBadgeDto);
    return {
      badge: badge,
      message: "Badge alterada com sucesso"
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const badge = await this.badgesService.remove(id);
    return {
      badge: badge,
      message: "Badge deletada com sucesso"
    }
  }
}
