import { Injectable } from "@nestjs/common";
import { CardDTO } from "src/DTO/cards.dto";
import { Model } from 'mongoose';
import { InjectModel } from "@nestjs/mongoose";
import { Card } from "../Interfaces/card.interface";
import { ObjectId } from "mongoose";
import { exec } from "child_process";

@Injectable()
export class CardRepository {

    constructor(
        @InjectModel('card') private readonly cardModel: Model<Card>
    ) { }

    async saveCard(newCard: CardDTO): Promise<Card> {
        const savedCard = new this.cardModel(newCard);
        return await savedCard.save()
    }

    async getAllCards(): Promise<Card> {
        return await this.cardModel.find({}, { _v: false }).exec();
    }

    async getCardById(cardID: string): Promise<Card> {
        return await this.cardModel.findById(cardID, { __v: false });
    }

    async deleteCardById(cardID: string): Promise<Card> {
        return this.cardModel.findOneAndDelete({ cardID }, { __v: false });
    }

    async updateCardById(cardID: string, newCard: CardDTO): Promise<Card> {
        return this.cardModel.findOneAndUpdate({ _id: cardID }, newCard);
    }

}