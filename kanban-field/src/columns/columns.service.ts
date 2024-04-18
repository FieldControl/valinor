import { Injectable } from '@nestjs/common';
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

  create(createColumnDto: CreateColumnDto) {
    const column = new this.columnModel(createColumnDto);

    return column.save();
  }

  async findAll() {
    const colums = await this.columnModel.find();

    const columnsWithCards = await Promise.all(colums.map(async (column) => {
      column.cards = await this.cardService.find({ column: column._id });
      return column;
    }));

    return columnsWithCards;
  }

  async findOne(id: string) {
    const column = await this.columnModel.findById(id);
    column.cards = await this.cardService.find({ column: id });

    return column; // retorna a coluna e os cards pertencentes a ela
  }

  update(id: string, updateColumnDto: UpdateColumnDto) {
    return this.columnModel.findByIdAndUpdate(
      id, updateColumnDto, { new: true }
    )
  }

  remove(id: string) {
    return this.columnModel.deleteOne(
      {
        _id: id
      }).exec();
  }
}
