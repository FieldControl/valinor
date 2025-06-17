import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entidades/board.entity';
import { User } from '../entidades/user.entity';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  
  async getBoardMembers(boardId: number): Promise<User[]> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['members'], 
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found.`);
    }
    return board.members;
  }

  
  async addMemberToBoard(boardId: number, addMemberDto: AddMemberDto): Promise<Board> {
    const { email } = addMemberDto;

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['members'], 
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found.`);
    }

    const userToAdd = await this.userRepository.findOne({ where: { email } });

    if (!userToAdd) {
      throw new NotFoundException(`User with email "${email}" not found.`);
    }

    
    if (board.members.some(member => member.id === userToAdd.id)) {
      throw new ConflictException(`User "${email}" is already a member of this board.`);
    }

    
    board.members.push(userToAdd);
    await this.boardRepository.save(board); 
    return board;
  }

  
  async removeMemberFromBoard(boardId: number, userId: number): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['members'], 
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found.`);
    }

    
    board.members = board.members.filter(member => member.id !== userId);
    await this.boardRepository.save(board); 
  }
}