/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card } from './card/card';

@Injectable()
export class ListService {
    constructor(
        @InjectModel(Card.name) private cardModel: Model<Card>
    ){}

    async listarTodos(): Promise<Card[]>{
        return this.cardModel.find().exec();
    }

    async listarPorStatus(status: string): Promise<Card[]> {
      return this.cardModel.find({ status }).exec();
    }

    async criar(card: Card):Promise<Card>{
        const cardCriado= new this.cardModel(card);

        return cardCriado.save();
    }
    async buscarPorId(id: string): Promise<Card> {
        return this.cardModel.findById(id).exec();
      }
    
      async atualizar(id: string, card: Card): Promise<Card> {
        return this.cardModel.findByIdAndUpdate(id, card).exec();
      }
    
      async remover(id: string) {
        const cardApagado = await this.cardModel.findOneAndDelete({ _id: id }).exec();
    
        return cardApagado;
      }
}
