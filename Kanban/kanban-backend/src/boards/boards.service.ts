
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardsService {
  //"banco de dados" temporário
  private boards: Board[] = [];
  private lastId = 0;

  create(createBoardDto: CreateBoardDto): Board {
    this.lastId++;
    const newBoard: Board = {
      id: this.lastId,
      name: createBoardDto.name,
      description: createBoardDto.description || '', // Usa a descrição ou uma string vazia
    };
    this.boards.push(newBoard);
    return newBoard;
  }

  findAll(): Board[] {
    return this.boards;
  }

  findOne(id: number): Board {
    const board = this.boards.find((board) => board.id === id);
    if (!board) {
      // Lança um erro 404 se o quadro não for encontrado
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
    return board;
  }

  // Os métodos update e remove podem ser implementados depois
  update(id: number, updateBoardDto: UpdateBoardDto) {
    const board = this.findOne(id); // Reutiliza o findOne para encontrar o quadro
    // Lógica para atualizar o quadro...
    return `This action updates a #${id} board`;
  }

  remove(id: number) {
    const boardIndex = this.boards.findIndex((board) => board.id === id);
     if (boardIndex === -1) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
    this.boards.splice(boardIndex, 1);
    return `This action removes a #${id} board`;
  }
}