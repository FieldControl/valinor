import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Column, ColumnDocument } from './entities/column.entity';
import { Model } from 'mongoose';
import { CardsService } from 'src/cards/cards.service';

@Injectable()
export class ColumnsService {

  constructor(@InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
              private cardService: CardsService) {}

  async create(createColumnDto: CreateColumnDto) {
    try {
      const column = new this.columnModel(createColumnDto);
      return await column.save();
    } catch (error) {
      throw new Error(`Falha ao criar a coluna: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const colums = await this.columnModel.find();
  
      const columnsWithCards = await Promise.all(colums.map(async (column) => {
        column.cards = await this.cardService.find({ column: column._id });
        return column;
      }));
  
      return columnsWithCards;
    } catch (error) {
      throw new Error(`Falha ao consultar todas as coluna: ${error.message}`);
    }
  }

  async findOne(id: string) {
    const column = await this.columnModel.findById(id);
    
    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    column.cards = await this.cardService.find({ column: id });
    
    return column; // retorna a coluna e os cards pertencentes a ela
  }

  async find(conditions: any) {
    try {
      return this.columnModel.find(conditions);  // responsavel por achar a coluna que pertence
    } catch (error) {
      throw new Error(`Falha ao encontrar a coluna: ${error.message}`);
    }
  }  

  async update(id: string, updateColumnDto: UpdateColumnDto) {
    const column = await this.columnModel.findByIdAndUpdate(
      id, updateColumnDto, { new: true }
    )

    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    return column
  }

  async remove(id: string) {
    const column = await this.columnModel.findByIdAndDelete(id);
    
    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    } 

    return column
  }
}
