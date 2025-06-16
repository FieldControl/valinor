// src/board-members/board-members.module.ts
import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board.entity'; // Importe Board
import { User } from '../entities/user.entity';   // Importe User

@Module({
  imports: [TypeOrmModule.forFeature([Board, User])], // Adicione Board e User repositórios
  controllers: [BoardMembersController],
  providers: [BoardMembersService],
})
export class BoardMembersModule {}