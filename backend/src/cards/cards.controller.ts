import { Body, Controller, Delete, Post, UseGuards, Req, Get, Request, Patch, ParseIntPipe, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card-with-tasks.dto';
import { UserId } from '../users/decorators/user.decorator';


@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Roles(Role.LEADER)
  @Post()
  async create(@Body() dto: CreateCardDto, @Req() req: any) {
    console.log('DTO recebido:', dto);
    console.log('Tipo de tasks[0]:', dto.tasks?.[0]?.constructor?.name);
    const leaderId = req.user.userId;
    return this.cardsService.createCardForMember(leaderId, dto);
  }

  @Roles(Role.LEADER)
  @Get('submitted')
  async getSubmittedCards(@Req() req: any) {
    const leaderId = req.user.userId;
    return this.cardsService.findSubmittedCardsByLeader(leaderId);
  }

  @Roles(Role.LEADER)
  @Delete(':id')
  async deleteSubmittedCard(
    @Param('id', ParseIntPipe) cardId: number,
    @Req() req: any
  ) {
    const leaderId = req.user.userId;
    return this.cardsService.deleteSubmittedCardByLeader(cardId, leaderId);
  }

  @Roles(Role.MEMBER)
  @Get('membercards')
  async getMyCards(@Request() req) {
    const memberId = req.user.userId;
    return this.cardsService.findCardsByMemberId(memberId);
  }

  @Roles(Role.MEMBER)
  @Patch(':id/submit')
  async submitCard(
    @Param('id', ParseIntPipe) cardId: number,
    @UserId() userId: number,
  ) {
    console.log('submitCard called with:', { cardId, userId });
    return this.cardsService.submitCard(cardId, userId);
  }
}
