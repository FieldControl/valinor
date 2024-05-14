import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Column, ColumnDocument } from './entities/column.entity';
import { Model } from 'mongoose';
import { CardsService } from 'src/cards/cards.service';
import { BoardsService } from 'src/boards/boards.service';

@Injectable()
export class ColumnsService {

  constructor(@InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
              private cardService: CardsService,
              private boardService: BoardsService) {}

  async create(createColumnDto: CreateColumnDto, boardId: string, userId: string, ) {
    try {
      const board = await this.boardService.findBoard(boardId, userId)

      const userIds = board.responsibles  //  users responsaveis pela board compartilhada

      const column = new this.columnModel({...createColumnDto, responsibles: userIds});
      return await column.save();
    } catch (error) {
      throw new Error(`Falha ao criar a coluna: ${error.message}`);
    }
  }

  async findAll(userId: string) {
    try {
      const colums = await this.columnModel.find({ responsibles: { $in: [userId] } }).populate('cards');
  
      const columnsWithCards = await Promise.all(colums.map(async (column) => {
        column.cards = await this.cardService.find({ column: column._id }, userId);
        return column;
      }));
  
      return columnsWithCards;
    } catch (error) {
      throw new Error(`Falha ao consultar todas as coluna: ${error.message}`);
    }
  }

  async findOne(id: string, userId: string) {
    const column = await this.columnModel.findById({_id: id, responsibles: { $in: [userId] } });
    
    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    column.cards = await this.cardService.find({ column: id }, userId);
    
    return column; // retorna a coluna e os cards pertencentes a ela
  }

  async findByBoard(id: string, userId: string) {
    try {
      const columns = await this.columnModel.find({ board: id, responsibles: { $in: [userId] } }).populate('responsibles');
      
      const columnsWithCards = await Promise.all(columns.map(async (column) => {
        column.cards = await this.cardService.find({ column: column._id },userId);
        return column;
      }));
  
      return columnsWithCards;
    } catch (error) {
      throw new Error(`Falha ao consultar todas as colunas: ${error.message}`);
    }
    
  }

  async find(conditions: any, userId: string) {
    try {
      return this.columnModel.find({...conditions, responsibles: { $in: [userId] } }).populate('responsibles');
    } catch (error) {
      throw new Error(`Falha ao encontrar a coluna: ${error.message}`);
    }
  }

  async update(id: string, updateColumnDto: UpdateColumnDto, userId: string) {
    const column = await this.columnModel.findByIdAndUpdate(
      {_id: id, responsibles: { $in: [userId] } }, updateColumnDto, { new: true }
    )

    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    return column
  }

  async remove(id: string, userId: string) {
    const column = await this.columnModel.findByIdAndDelete({_id: id, responsibles: { $in: [userId] } });
    
    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    } 

    return column
  }
}
