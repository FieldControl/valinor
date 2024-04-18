import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './entities/card.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class CardsService {

  constructor(@InjectModel(Card.name) private cardModel: Model<CardDocument>) {}

  async create(createCardDto: CreateCardDto) {
    try {
      const column = new this.cardModel(createCardDto);
      return await column.save();
    } catch (error) {
      throw new Error(`Falha ao criar o cartão: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.cardModel.find().populate('responsible').populate('column');
    } catch (error) {
      throw new Error(`Falha ao consultar todos os cartões: ${error.message}`);
    }
  }

  async findOne(id: string) {
    const card = await this.cardModel.findById(id).populate('responsible').populate('column');
    
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }
    
    return card;
  }

  async find(conditions: any) {
    try {
      return this.cardModel.find(conditions);  // responsavel por achar a coluna que pertence
    } catch (error) {
      throw new Error(`Falha ao encontrar o cartão: ${error.message}`);
    }
  }  

  async update(id: string, updateCardDto: UpdateCardDto) {
    const card = await this.cardModel.findByIdAndUpdate(
      id, updateCardDto, { new: true }
    )
    
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }
    
    return card
  }

  async remove(id: string) {
    const card = await this.cardModel.findByIdAndDelete(id);
    
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }
    
    return card
  }
}
