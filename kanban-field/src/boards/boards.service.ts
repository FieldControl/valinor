import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Board, BoardDocument } from './entities/board.entity';
import { Model } from 'mongoose';
import { ColumnsService } from 'src/columns/columns.service';

@Injectable()
export class BoardsService {

  constructor(@InjectModel(Board.name) private boardModel: Model<BoardDocument>,
              private columnsService: ColumnsService) {}

  async create(createBoardDto: CreateBoardDto, userId: string) {
    try {
      const board = new this.boardModel({...createBoardDto, responsible: userId});
      return await board.save();
    } catch (error) {
      throw new Error(`Falha ao criar o quadro: ${error.message}`);
    }
  }

  async findAll(userId: string) {
    try {
      const boards = await this.boardModel.find({ responsible: userId });
  
      const boardsWithColumms = await Promise.all(boards.map(async (board) => {
        board.columns = await this.columnsService.find({ board: board._id }, userId);
        return board;
      }));
  
      return boardsWithColumms;
    } catch (error) {
      throw new Error(`Falha ao consultar todos os quadros ${error.message}`);
    }
  }

  async findOne(id: string, userId: string) {
    const board = await this.boardModel.findById({_id: id, responsible: userId});
    
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    board.columns = await this.columnsService.find({ board: id }, userId );
    
    return board; // retorna o quadro e as colunas pertencentes a ele
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string) {
    const board = await this.boardModel.findByIdAndUpdate(
      {_id: id, responsible: userId }, updateBoardDto, { new: true }
    )

    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    return board
  }

  async remove(id: string, userId: string) {
    const board = await this.boardModel.findByIdAndDelete({_id: id, responsible: userId});
    
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    } 

    return board
  }
}
