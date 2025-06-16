// src/board-members/board-members.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entities/board.entity';
import { User } from '../entities/user.entity';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Método para obter todos os membros de um board
  async getBoardMembers(boardId: number): Promise<User[]> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['members'], // Carrega os membros relacionados
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found.`);
    }
    return board.members;
  }

  // Método para adicionar um membro a um board
  async addMemberToBoard(boardId: number, addMemberDto: AddMemberDto): Promise<Board> {
    const { email } = addMemberDto;

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['members'], // Carrega os membros existentes
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found.`);
    }

    const userToAdd = await this.userRepository.findOne({ where: { email } });

    if (!userToAdd) {
      throw new NotFoundException(`User with email "${email}" not found.`);
    }

    // Verifica se o usuário já é membro
    if (board.members.some(member => member.id === userToAdd.id)) {
      throw new ConflictException(`User "${email}" is already a member of this board.`);
    }

    // Adiciona o usuário à lista de membros
    board.members.push(userToAdd);
    await this.boardRepository.save(board); // Salva as alterações no board (atualiza a join table)
    return board;
  }

  // Método para remover um membro de um board
  async removeMemberFromBoard(boardId: number, userId: number): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['members'], // Carrega os membros existentes
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found.`);
    }

    // Filtra o membro a ser removido
    board.members = board.members.filter(member => member.id !== userId);
    await this.boardRepository.save(board); // Salva as alterações
  }

  // Futuramente: Método para verificar se um usuário é dono/membro (para permissões)
  // async isOwnerOrMember(boardId: number, userId: number): Promise<boolean> {
  //   const board = await this.boardRepository.findOne({
  //     where: { id: boardId },
  //     relations: ['members'],
  //   });
  //   if (!board) return false;
  //   return board.ownerId === userId || board.members.some(member => member.id === userId);
  // }
}