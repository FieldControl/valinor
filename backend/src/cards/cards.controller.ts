import { Body, Controller, Post, UseGuards, Req, Get, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card-with-tasks.dto';


@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Roles(Role.LEADER)
  @Post()
  async create(@Body() dto: CreateCardDto, @Req() req: any) {
    const leaderId = req.user.userId;
    return this.cardsService.createCardForMember(leaderId, dto);
  }

  @Roles(Role.MEMBER)
  @Get('membercards')
  async getMyCards(@Request() req) {
    const memberId = req.user.userId;
    return this.cardsService.findCardsByMemberId(memberId);
  }
}
