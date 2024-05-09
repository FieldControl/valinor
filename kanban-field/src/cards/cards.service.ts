import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './entities/card.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class CardsService {

  constructor(@InjectModel(Card.name) private cardModel: Model<CardDocument>) {}

  async create(createCardDto: CreateCardDto, userId: string) {
    try {
      const card = new this.cardModel({...createCardDto, responsibles: [userId] });
      return await card.save();
    } catch (error) {
      throw new Error(`Falha ao criar o cartão: ${error.message}`);
    }
  }

  async findAll(userId: string) {
    try {
      return await this.cardModel.find({ responsibles: { $in: [userId] } }).populate('responsibles').populate('column');
    } catch (error) {
      throw new Error(`Falha ao consultar todos os cartões: ${error.message}`);
    }
  }

  async findOne(id: string, userId: string) {
    const card = await this.cardModel.findById({_id: id, responsibles: { $in: [userId] } }).populate('responsibles').populate('column');
    
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }
    
    return card;
  }

  async find(conditions: any, userId: string) {
    try {
      return this.cardModel.find({...conditions, responsibles: { $in: [userId] } }).populate('responsibles');  // responsavel por achar a coluna que pertence
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

  async remove(id: string, userId: string) {
    const card = await this.cardModel.findByIdAndDelete({_id: id, responsibles: { $in: [userId] } });
    
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }
    
    return card
  }
}
