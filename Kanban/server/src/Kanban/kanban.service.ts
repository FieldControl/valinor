/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column, ColumnDocument } from './models/column.model';
import { Card, CardDocument } from './models/card.model';

@Injectable()
export class KanbanService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @InjectModel(Card.name) private cardModel: Model<CardDocument>
  ) {}

  async createColumn(name: string): Promise<Column> {
    const createdColumn = new this.columnModel({ name });
    return createdColumn.save();
  }

  async getAllColumns(): Promise<Column[]> {
    return this.columnModel.find().exec();
  }

  async getColumnById(columnId: string): Promise<Column> {
    const column = await this.columnModel.findById(columnId).exec();
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }
    return column;
  }

  async updateColumn(columnId: string, name: string): Promise<Column> {
    const updatedColumn = await this.columnModel.findByIdAndUpdate(
      columnId,
      { name },
      { new: true }
    ).exec();
    if (!updatedColumn) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }
    return updatedColumn;
  }

  async deleteColumn(columnId: string): Promise<void> {
    const result = await this.columnModel.deleteOne({ _id: columnId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }
  }

  async createCard(columnId: string, title: string, description: string): Promise<Card> {
    const createdCard = new this.cardModel({ columnId, title, description });
    return createdCard.save();
  }

  async getCardsInColumn(columnId: string): Promise<Card[]> {
    return this.cardModel.find({ columnId }).exec();
  }

  async updateCard(cardId: string, title: string, description: string): Promise<Card> {
    return this.cardModel.findByIdAndUpdate(cardId, { title, description }, { new: true }).exec();
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.cardModel.findByIdAndDelete(cardId).exec();
  }
}