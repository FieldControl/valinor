import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './entities/card.entity';
import { Model } from 'mongoose';

@Injectable()
export class CardsService {

  constructor(@InjectModel(Card.name) private cardModel: Model<CardDocument>) {}

  create(createCardDto: CreateCardDto) {
    const column = new this.cardModel(createCardDto);

    return column.save();
  }

  findAll() {
    return this.cardModel.find().populate('responsible').populate('column');
  }

  findOne(id: string) {
    return this.cardModel.findById(id).populate('responsible').populate('column'); // id do mongo é string
  }

  find(conditions: any) {
    return this.cardModel.find(conditions);  // responsavel por achar a coluna que pertence
  }  

  update(id: string, updateCardDto: UpdateCardDto) {
    return this.cardModel.findByIdAndUpdate(
      id, updateCardDto, { new: true }
    )
  }

  remove(id: string) {
    return this.cardModel.deleteOne(
      {
        _id: id
      }).exec();
  }
}
