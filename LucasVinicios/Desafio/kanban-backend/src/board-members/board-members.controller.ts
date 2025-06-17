
import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { User } from '../entidades/user.entity';
// import { UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @UseGuards(AuthGuard('jwt'))
@Controller('board/:boardId/members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Get()
  getMembers(@Param('boardId') boardId: string): Promise<User[]> {
    return this.boardMembersService.getBoardMembers(+boardId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  addMember(
    @Param('boardId') boardId: string,
    @Body(ValidationPipe) addMemberDto: AddMemberDto,
  ): Promise<any> {
    return this.boardMembersService.addMemberToBoard(+boardId, addMemberDto);
  }

  @Delete(':userId') 
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.boardMembersService.removeMemberFromBoard(+boardId, +userId);
  }
}