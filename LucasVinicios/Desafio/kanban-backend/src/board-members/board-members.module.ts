import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entidades/board.entity'; 
import { User } from '../entidades/user.entity';   

@Module({
  imports: [TypeOrmModule.forFeature([Board, User])], 
  controllers: [BoardMembersController],
  providers: [BoardMembersService],
})
export class BoardMembersModule {}