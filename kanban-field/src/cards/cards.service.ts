import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './entities/card.entity';
import { Model } from 'mongoose';
import { ColumnsService } from '../columns/columns.service';

@Injectable()
export class CardsService {

  constructor(@InjectModel(Card.name) private cardModel: Model<CardDocument>,
              @Inject(forwardRef(() => ColumnsService))
              private columnsService: ColumnsService) {}

  async create(createCardDto: CreateCardDto, columnId: string, userId: string) {
    try {
      const column = await this.columnsService.findColumn(columnId, userId)

      if (!column) {
        throw new Error('Coluna não encontrada');
    }
      const cards = column.cards || [];

      const userIds = column.responsibles

      const position = cards.length;

      return await this.cardModel.create({...createCardDto, responsibles: userIds, position: position});
    } catch (error) {
      throw new Error(`Falha ao criar o cartão: ${error.message}`);
    }
  }

  async findAll(userId: string) {
    try {
      return await this.cardModel.find({ responsibles: { $in: [userId] } });
    } catch (error) {
      throw new Error(`Falha ao consultar todos os cartões: ${error.message}`);
    }
  }

  async findOne(id: string, userId: string) {
    const card = await this.cardModel.findById({_id: id, responsibles: { $in: [userId] } });
    
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }
    
    return card;
  }

  async find(conditions: any, userId: string) {
    try {
      return this.cardModel.find({...conditions, responsibles: { $in: [userId] } }).populate('responsibles').exec();  // responsavel por achar a coluna que pertence
    } catch (error) {
      throw new Error(`Falha ao encontrar o cartão: ${error.message}`);
    }
  }  

  async update(id: string, updateCardDto: UpdateCardDto, userId: string) {
    const card = await this.cardModel.findByIdAndUpdate(
      {_id: id, responsibles: { $in: [userId] } }, updateCardDto, { new: true }
    )
    
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }
    
    return card
  }

  async updatePosition(id: string, newPosition: number, userId: string) {
    const card = await this.cardModel.findByIdAndUpdate(
      {_id: id, responsibles: { $in: [userId] } }, { position: newPosition }, { new: true }
    )
  
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }
  
    return card
  }


  async remove(id: string, userId: string) {
    const card = await this.cardModel.findByIdAndDelete({_id: id, responsibles: { $in: [userId] } });
    
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }
    
    return card
  }
}
