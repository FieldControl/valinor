import { Injectable } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Column, ColumnDocument } from './entities/column.entity';
import { Model } from 'mongoose';

@Injectable()
export class ColumnsService {

  constructor(@InjectModel(Column.name) private columnModel: Model<ColumnDocument>) {}

  create(createColumnDto: CreateColumnDto) {
    const column = new this.columnModel(createColumnDto);

    return column.save();
  }

  findAll() {
    return this.columnModel.find().populate('cards');
  }

  findOne(id: string) {
    return this.columnModel.findById(id).populate('cards'); // id do mongo é string
  }

  findByName(name: string) {
    return this.columnModel.findOne({ name });
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
